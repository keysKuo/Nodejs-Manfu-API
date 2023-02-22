require('dotenv').config();
const PORT = process.env.API_PORT || 8080;
const router = require('./resources/routes');
const { uuid } = require('uuidv4');

const app = require('./config/server').init();

router(app);

app.get('/', (req, res, next) => {
    let id = uuid().substring(0, 8);
    return res.status(200).json({ id });
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})