const router = require('express').Router();
const db = require("../../config/db/database");
const { uuid } = require('uuidv4');
const { queryString } = require('../middlewares');



// [GET] View Bill Info /api/admin/get-bill/:bill_ID 
router.get('/get-bill/:bill_ID', async (req, res, next) => {
    const { bill_ID } = req.params;
    
    return await db.CallFunc({
        function: `FN_VIEW_BILL_INFO('${bill_ID}')`
    })
        .then(bill => {
            
            return res.status(200).json({success: true, bill: bill});
        })
        .catch(err => {
            return res.status(404).json({success: false, msg: 'Không tìm thấy phiếu tính nào'});
        })
    
})

module.exports = router;
