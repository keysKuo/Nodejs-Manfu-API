const router = require('express').Router();
const db = require("../../config/db/database");
const { uuid } = require('uuidv4');
const { queryString } = require('../middlewares');




router.get('/get-bill/:bill_id', async (req, res, next) => {
    const bill_id = req.params.bill_id;
    
    let order_IDs = `Select P.product_name, P.product_price, OD.order_ID
                    From __ORDER_DETAIL OD, __PRODUCT P
                    Where OD.product_ID = P.product_ID AND OD.order_ID in 
                        (Select O.order_ID
                        From __ORDER O, __TABLE T, __BILL B 
                        Where O.table_ID = T.table_ID AND B.table_ID = T.table_ID AND B.bill_ID = '${bill_id}')
                    `

    return await db.Query(order_IDs)
        .then(bill => {
            return res.status(200).json({success: true, bill: bill});
        })
        .catch(err => {
            return res.status(404).json({success: false, msg: 'Không tìm thấy phiếu tính nào'});
        })
    
})

module.exports = router;
