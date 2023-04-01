require("dotenv").config();
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');
const router = require('express').Router();
const db = require("../../config/db/database");
const { checkExistObject } = require("../middlewares/function-phu");
const API_URL = process.env.API_URL;
const moment = require('moment');


// [GET] Get all bills  -> /api/bills/get-bills
router.get('/get-bills', async (req, res, next) => {
    await db.CallFunc({
        function: `FN_VIEW_BILL ()`,
        optional: `ORDER BY created_at desc`
    })
        .then((data) => {
            if (data.length == 0)
                return res.status(300).json({ success: false, code: 0, message: `There are no bill(s)` })
            else
                return res.status(200).json({ success: true, code: 1, item_counter: data.length, data: data })
        })
        .catch((err) => { return res.status(500).json({ success: false, message: err }) })
})

// [GET] Get all bills of shift -> /api/bills/get-bills-of-day
router.get('/get-bills-of-day', async (req, res, next) => {
    let { shift } = req.query || '';
    let start = 8;
    let end = 22;
    if(shift) {
        if (shift == '1') {
            start = 8;
            end = 15;
        }else if (shift == '2') {
            start = 15
            end = 22
        }
    }

    await db.CallFunc({
        function: `FN_VIEW_BILL_HISTORY (${start}, ${end})`,
        optional: `ORDER BY created_at desc`
    })
        .then((data) => {
            if (data.length == 0)
                return res.status(300).json({ success: false, code: 0, message: `There are no bill(s)` })
            else
                return res.status(200).json({ success: true, code: 1, item_counter: data.length, data: data })
        })
        .catch((err) => { return res.status(500).json({ success: false, message: err }) })
})


// [GET] Get bill info by ID  -> /api/bills/get-bill/:bid
router.get('/get-bill/:bid', async (req, res, next) => {
    const { bid } = req.params
    await db.CallFunc({
        function: `FN_VIEW_BILL_INFO('${bid}')`
    })
        .then(async (data) => {
            if (data.length == 0) {
                return res.status(300).json({ success: false, message: `Bill: ${bid} do not exist!` })
            }
            else {
                let total_price = await checkExistObject(`FN_CALCULATE_BILL('${bid}')`, '')
                return res.status(200).json({
                    success: true,
                    code: 1,
                    item_counter: data.length,
                    total_price: total_price.data.total.toLocaleString(),
                    tax_value: "10%",
                    final_price: (total_price.data.total + (total_price.data.total * 10 / 100)).toLocaleString(),
                    is_completed: data[0].is_completed,
                    data: data
                })
            }
        })
        .catch((err) => { return res.status(500).json({ success: false, message: err }) })
})


// [PUT] Close bill  -> /api/bills/close-bill/:bid
// close bill = đóng bill = table is available (but do not allow it to open)
router.put('/close-bill/:bid', async (req, res, next) => {
    const { bid } = req.params
    let bill = await checkExistObject('FN_VIEW_BILL()', `WHERE bill_ID = '${bid}'`)
    let total_price = await checkExistObject(`FN_CALCULATE_BILL('${bid}')`, '')
    // console.log(bill)
    if (bill.data.is_completed == false) {
        await db.ExecProc({
            procedure: `PROC_SWITCH_STATUS_BILL '${bid}', 1, ${(total_price.data.total + (total_price.data.total * 10 / 100))}`
        })
            .then(async () => {
                await db.ExecProc({
                    procedure: `PROC_SWITCH_STATUS_TABLE '${bill.data.table_ID}', 1`
                })
                    .then(() => {
                        return res.status(200).json({
                            success: true, code: 1,
                            message_1: `Bill: ${bid} switched status to completed!`,
                            message_2: `Table: ${bill.data.table_ID} switched status to available!`,
                            total_price: total_price.data.total.toLocaleString(),
                            tax_value: "10%",
                            final_price: (total_price.data.total + (total_price.data.total * 10 / 100)).toLocaleString(),
                            is_completed: bill.data.is_completed
                        })
                    })
                    .catch((err) => { return res.status(500).json({ success: false, code: "PROC_SWITCH_STATUS_TABLE", message: err }) })
            })
            .catch((err) => { return res.status(500).json({ success: false, code: "PROC_SWITCH_STATUS_BILL", message: err }) })
    }
    else {
        return res.status(500).json({ success: false, message: `Bill: ${bid} is completed (closed) and cannot be changed!` })
    }
})


// [PUT] Update bill  -> /api/bills/update/:bid
router.put("/update/:bid", async (req, res, next) => {
    const { bid } = req.params
    const { total_price, created_at, is_completed, table_ID, staff_ID } = req.body
    let date = moment(created_at).format('YYYY-MM-DD HH:mm:ss')
    await db.ExecProc({
        procedure: `PROC_UPDATE_BILL '${bid}', ${total_price}, '${date}', ${is_completed}, '${table_ID}', '${staff_ID}'`
    })
        .then(() => {
            return res.status(200).json({
                success: true,
                code: 1,
                message: `${bid} was updated at ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
                data: { ...req.body }
            })
        })
        .catch((err) => { return res.status(500).json({ success: false, message: err }) })
})


module.exports = router;