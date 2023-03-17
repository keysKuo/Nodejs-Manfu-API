const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { procedureQueryString } = require('../middlewares/index2');
const { uuid } = require('uuidv4');
const { statusCheckOrder, getOrderStatus, updateStatusOrderCheck, checkExistObject, getStatusBasedOnCategory, increaseOrderPriority } = require("../middlewares/function-phu");
const moment = require("moment");


// [GET] Get all orders -> /api/orders/get-orders
router.get('/get-orders', async (req, res, next) => {
    await db.CallFunc({
        function: 'FN_REFRESH_ORDER_QUEUE()',
        optional: 'Order by order_priority desc, created_at'
    })
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: "List of orders",
                    counter: data.length,
                    data: data
                })
            }
            else {
                return res.status(404).json({
                    success: true,
                    code: 0,
                    message: "There is no orders!"
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


// [GET] Get order based on status -> /api/orders/get-orders/:status
// waiting , preparing , success , cancel
router.get('/get-orders/status/:status', async (req, res, next) => {
    const { status } = req.params
    if (statusCheckOrder(status) == false) {
        return res.status(404).json({
            success: false,
            message: `No products with status ${status} found`
        })
    }
    await db.CallFunc({
        function: `FN_REFRESH_ORDER_QUEUE()`,
        optional: `WHERE order_status = '${status}' ORDER BY order_priority desc, created_at asc`
    })
        .then((data) => {
            if (data.length == 0) {
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `No data found for status ${status}!`
                })
            }
            else {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Data found for status ${status}!`,
                    counter: data.length,
                    data: data
                })
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [GET] Get orders for chefs (include only waiting and preparing) -> /api/orders/get-orders/:status
router.get("/get-orders/chef", async (req, res, next) => {
    await db.CallFunc({
        function: `FN_REFRESH_ORDER_QUEUE()`,
        optional: `WHERE order_status = 'waiting' OR order_status = 'preparing' ORDER BY order_priority desc, created_at asc`
    })
        .then((data) => {
            if (data.length == 0) {
                return res.status(300).json({
                    success: false,
                    code: 0,
                    message: `No Order(s) for 'waiting' and 'preparing' status!`
                })
            }
            else {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    counter: data.length,
                    message: `There are ${data.length} for 'waiting' and 'preparing' order(s)!`,
                    data: data
                })
            }
        })
        .catch((err) => { return res.status(500).json({ success: false, message: err }) })
})


// [GET] Get order info based on order ID -> /api/orders/get-orders/id/:oid
router.get("/get-orders/id/:oid", async (req, res, next) => {
    const { oid } = req.params
    await db.CallFunc({
        function: `FN_REFRESH_ORDER_QUEUE()`,
        optional: `WHERE order_ID = '${oid}'`
    })
        .then((data) => {
            if (data.length == 0) {
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `No order info for ${oid}!`
                })
            }
            else {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Data for order ${oid} found!`,
                    data: data
                })
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [PUT] Update order -> /api/orders/update/:oid
router.put("/update/:oid", async (req, res, next) => {
    const { oid } = req.params
    const { created_at, product_ID, price, quantity, order_status, order_priority, table_ID, bill_ID } = req.body
    let date = moment(created_at).format('YYYY-MM-DD HH:mm:ss')
    // console.log(date)
    await db.ExecProc({
        procedure: `PROC_UPDATE_ORDER '${oid}', '${date}', '${product_ID}', ${price}, ${quantity}, '${order_status}', ${order_priority}, '${table_ID}', '${bill_ID}'`
    })
        .then(() => {
            return res.status(200).json({
                success: true,
                code: 1,
                message: `${oid} updated at ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
                time: new Date()
            })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [PUT] Update order status -> /api/orders/update-status/:oid
// waiting -> preparing -> success
// waiting -> cancel
router.put('/update-status/:oid', async (req, res, next) => {
    const { oid } = req.params
    const { status } = req.body
    let result = await updateStatusOrderCheck(status, oid)
    
    if (result.success == true) {
        await db.ExecProc({
            procedure: `PROC_SWITCH_STATUS_ORDER '${oid}', '${status}'`
        })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Order: ${oid} switch status to ${status} successfully!`
                })
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    message: err
                })
            })
    }
    else {
        return res.status(300).json({
            success: false,
            message: result.message
        })
    }
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
    const { bill_ID, data } = req.body // data = product_ID, quantity
    // bill_ID -> check bill exist and bill status -> get billID and tableID
    let bill = await checkExistObject('FN_VIEW_BILL()', `WHERE bill_ID = '${bill_ID}'`)
    if (bill.success == true && bill.data.is_completed == false) {
        data.forEach(async element => {
            // product_ID -> check product exists -> order priority and price
            let product = await checkExistObject('FN_VIEW_PRODUCT_STORAGE()', `WHERE product_ID = '${element.product_ID}'`)
            if (product.success == true) {
                let product_ID = product.data.product_ID
                let price = product.data.product_price
                let quantity = element.quantity
                let order_status = getStatusBasedOnCategory(product.data.product_category)
                let order_priority = product.data.product_priority
                let table_ID = bill.data.table_ID
                let bill_ID = bill.data.bill_ID
                if (order_status != 'success') {
                    increaseOrderPriority('PROC_INCREASE_ORDER_PRIORITY')
                }
                let order_id = "OR" + uuid().substring(0, 8)
                await db.ExecProc({
                    procedure: `PROC_INSERT_ORDER '${order_id}', '${product_ID}', ${price}, ${quantity}, '${order_status}', ${order_priority}, '${table_ID}', '${bill_ID}'`
                })
                    .then(() => { })
                    .catch((err) => {
                        return res.status(500).json({ success: false, message: err })
                    })
            }
            // if product does not exist then we do not save it in
        });
        return res.status(200).json({
            success: true, code: 1, message: `Order for Bill: ${bill_ID} was created at ${moment().format('YYYY-MM-DD HH:mm:ss')}`
        })
    }
    else {
        return res.status(300).json({ success: false, message: `The Bill: ${bill_ID} is closed and cannot create orders!` })
    }
})


module.exports = router

