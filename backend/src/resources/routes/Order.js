const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');
const { query } = require('express');


// [GET] All orders page -> /api/orders/get-orders
router.get('/get-orders', async (req, res, next) => {
    await db.Query(queryString("select", {
        select: "OD.*, O.created_at",
        table: "__ORDER_DETAIL OD, __ORDER O",
        optional: `where O.order_ID = OD.order_ID 
                    order by OD.product_priority desc, O.created_at asc`
    }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: "List of order",
                    data: data
                })
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: "No data in order"
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [GET] Orders based on :status page -> /api/orders/get-orders/:status
router.get('/get-orders/:status', async (req, res, next) => {
    const { status } = req.params
    await db.Query(queryString('select', {
        select: "OD.*, O.created_at",
        table: "__ORDER_DETAIL OD, __ORDER O",
        optional: `where O.order_ID = OD.order_ID 
                    and OD.product_status = '${status}'
                    order by OD.product_priority desc, O.created_at asc`
    }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: `Data for status (${status}) found`,
                    data: data
                })
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: `No data for (${status})`
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


router.put('/update-order-detail/:status', (req, res, next) => {

})

module.exports = router