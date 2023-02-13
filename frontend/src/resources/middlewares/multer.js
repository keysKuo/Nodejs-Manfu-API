const multer = require('multer');
const fileapis = require('./fileapis');
require('dotenv').config();
const BASE_URL = process.env.BASE_URL;
const { uuid } = require('uuidv4');
const { generatePID } = require('./index');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pid = req.params.pid || generatePID(req.body.category);
        let path = BASE_URL + `${file.fieldname}/` + pid;
        fileapis.createSync(path, err => {
            req.flash('error', 'Tạo thư mục thất bại');
        });
        req.pid = pid;
        req.folder = path;
        cb(null, path);
    },

    filename: (req, file, cb) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null, uuid().substring(0,13) + ext);
    }
})


const upload = multer({
    storage: storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
})


module.exports = { upload }