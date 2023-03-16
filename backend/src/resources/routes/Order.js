const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { statusCheck, procedureQueryString } = require('../middlewares/index2');
const { uuid } = require('uuidv4');


// [GET] All orders page -> /api/orders/get-orders
router.get('/get-orders', async (req, res, next) => {
    await db.CallFunc({
        function: 'FN_REFRESH_ORDER_QUEUE()',
        optional: 'Order by order_priority desc, created_at'
    })
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
router.get('/get-orders/status/:status', async (req, res, next) => {
    const { status } = req.params
    if (statusCheck(status) == false) {
        return res.status(404).json({
            success: false,
            message: `No products with status ${status} found`
        })
    }

    await db.Query(queryString('select', {
        select: "OD.*, O.table_ID, O.created_at",
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
                    total_idle: data.length,
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


router.get("/get-orders/id/:oid", async (req, res, next) => {
    const { oid } = req.params
    await db.Query(queryString("select", {
        select: "*",
        table: "__ORDER_DETAIL",
        optional: `where order_ID = '${oid}'`
    }))
        .then((data) => {
            if (data.length == 0) {
                return res.status(404).json({
                    success: false,
                    message: `No data for ${oid}`
                })
            }
            else {
                return res.status(200).json({
                    success: true,
                    item: data.length,
                    data: data
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


// [PUT] Update order detail status -> /api/orders/update-order-detail-status/
// data needs to have order_ID, product_ID
// something like this:
// {
//     "status": "success",
//     "data": {
//         "order_ID": "OR00000002",
//         "product_ID": "AL00000001"
//             }
// }
router.put('/update-order-detail-status/', async (req, res, next) => {
    const { status, data } = req.body
    if (statusCheck(status) == false) {
        return res.status(404).json({
            success: false,
            message: `No valid status ${status}`
        })
    }

    // if (data.product_status != "idle") {
    //     return res.status(500).json({
    //         success: false,
    //         message: "Product's current status is not idle. Cancel process!"
    //     })
    // }

    if (data.product_ID == null || data.order_ID == null) {
        return res.status(404).json({
            success: false,
            message: "Can not find product"
        })
    }

    await db.Execute(queryString("update", {
        table: "__ORDER_DETAIL",
        set: `product_status = '${status}'`,
        where: `order_ID = '${data.order_ID}' and product_ID = '${data.product_ID}'`
    }))
        .then(() => {
            return res.status(200).json({
                success: true,
                message: "Switch status successfully"
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [POST] Create order -> /api/orders/create-order/
// {
//     "table_ID": "TAB0000001",
//     "data": [
//       {
//         "product_ID": "AL00000001",
//         "product_name": "bò xào ngũ vị",
//         "product_category": "alacarte",
//         "product_price": 75000,
//         "product_priority": 4,
//         "is_available": true,
//         "image_link": null,
//         "quantity": 2
//       },
//       {
//         "product_ID": "TK00000001",
//         "product_name": "ticket buffet lẩu",
//         "product_category": "ticket",
//         "product_price": 500000,
//         "product_priority": 10,
//         "is_available": true,
//         "image_link": null,
//         "quantity": 2
//       }
//     ]
//   }
router.post('/create-order', async (req, res, next) => {
    let order_id = "OR" + uuid().substring(0, 8)
    const { table_ID, data } = req.body

    await db.Execute(queryString("insert", {
        table: "__ORDER",
        values: `'${order_id}', getdate(), null, '${table_ID}', null`
    }))
        .then(() => {
            data.forEach(async element => {
                // Other products are idle and need increase
                if (element.product_priority != 10) {
                    await procedureQueryString("exec increaseOrderDetailPriority")
                    await db.Execute(queryString("insert", {
                        table: "__ORDER_DETAIL",
                        // need to define quantity
                        values: `'${order_id}', '${element.product_ID}', ${element.quantity}, ${element.product_price}, 'idle', '${element.product_priority}'`
                    }))
                }
                else {
                    // Tickets are success automactically and do not need increase
                    await db.Execute(queryString("insert", {
                        table: "__ORDER_DETAIL",
                        // need to define quantity
                        values: `'${order_id}', '${element.product_ID}', ${element.quantity}, ${element.product_price}, 'success', '${element.product_priority}'`
                    }))
                }
            });
            return res.status(200).json({
                success: true,
                message: `Add order ${order_id}`
            })
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


module.exports = router

