const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');
const { query } = require('express');
const { getTableStatus, checkStaffID } = require("../middlewares/function-phu");


// [GET] Get all tables -> /api/tables/get-tables
router.get("/get-tables", async (req, res, next) => {
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `ORDER BY table_ID asc`
    })
        .then((data) => {
            if (data.length == 0)
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: "No data available"
                })
            else
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `List of ${data.length} table(s)`,
                    counter: data.length,
                    data: data
                })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
});


// [GET] Get tables based on status -> /api/tables/get-tables/:status
router.get("/get-tables/:status", async (req, res, next) => {
    const { status } = req.params
    let is_available = (status == 'available') ? 1 : ((status == 'unavailable') ? 0 : -1)
    if (is_available == -1) {
        return res.status(404).json({
            success: true,
            code: 0,
            message: `The ${status} is invalid!`
        })
    }
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `WHERE is_available = ${is_available} ORDER BY table_ID asc`
    })
        .then((data) => {
            if (data.length == 0) {
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `There is no data for ${status}`
                })
            }
            else
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `List of ${status} table(s) is ${data.length}`,
                    counter: data.length,
                    data: data
                })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
});


// [GET] Get table info by ID -> /api/tables/get-table/:tid
router.get('/get-table/:tid', async (req, res, next) => {
    const { tid } = req.params;
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `WHERE table_ID = '${tid}'`
    })
        .then((data) => {
            if (data.length == 0)
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `There is no table ${tid}`
                })
            else
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Data for ${tid}`,
                    data: data
                })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
});


// [POST] Create a table -> /api/tables/create
router.post('/create', async (req, res, next) => {
    const { table_ID, table_seat, is_available } = req.body;
    let available = (is_available == true) ? 1 : 0;
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `WHERE table_ID = '${table_ID}'`
    })
        .then(async (data) => {
            if (data.length == 0)
                await db.ExecProc({
                    procedure: `PROC_INSERT_TABLE '${table_ID}', ${table_seat}, ${available}`
                })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            code: 1,
                            message: `Add table ${table_ID} successfully`,
                            data: { ...req.body }
                        })
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            success: false,
                            code: 0,
                            message: err
                        })
                    })
            else
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `Table with ID: ${table_ID} EXISTED!`
                })
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [DELETE] Delete table page -> /api/tables/delete/:tid
router.delete('/delete/:tid', async (req, res, next) => {
    const { tid } = req.params
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `WHERE table_ID = '${tid}'`
    })
        .then(async (data) => {
            if (data.length == 0)
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `No table ${tid} to delete`
                })
            else {
                await db.ExecProc({
                    procedure: `PROC_DELETE_TABLE '${tid}'`
                })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            code: 1,
                            message: `${tid} is deleted!`
                        })
                    })
                    .catch((err) => {
                        return res.status(300).json({
                            success: false,
                            code: 0,
                            message: err
                        })
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


// [PUT] Update table based on ID -> /api/tables/update/:tid
router.put('/update/:tid', async (req, res, next) => {
    const { tid } = req.params;
    const { table_seat, is_available } = req.body;
    let available = (is_available == true) ? 1 : 0
    await db.CallFunc({
        function: `FN_GET_ALL_TABLE()`,
        optional: `WHERE table_ID = '${tid}'`
    })
        .then(async (data) => {
            if (data.length == 0)
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `No table with ID = ${tid} found!`
                })
            else {
                await db.ExecProc({
                    procedure: `PROC_UPDATE_TABLE '${tid}', ${table_seat}, ${available}`
                })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            code: 1,
                            message: `${tid} is updated!`,
                            data: { ...req.body }
                        })
                    })
                    .catch((err) => {
                        return res.status(300).json({
                            success: false,
                            code: 0,
                            message: err
                        })
                    })
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
});


// [PUT] Open table -> /api/tables/open-table/:tid
// Open table = mở bàn = create a bill (but do not allow it to close)
router.put('/open-table/:tid', async (req, res, next) => {
    const { tid } = req.params
    const { staff_ID } = req.body
    let tableStatus = await getTableStatus(tid) // should check if the bill is completed
    let checkStaff = await checkStaffID(staff_ID)
    let bill_ID = "B" + uuid().substring(0, 9)
    if (tableStatus == 1 && checkStaff == 1) {
        await db.ExecProc({
            procedure: `PROC_SWITCH_STATUS_TABLE '${tid}', 0`
        })
            .then(async () => {
                await db.ExecProc({
                    procedure: `PROC_INSERT_BILL '${bill_ID}', 0, '${tid}', '${staff_ID}'`
                })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            code: 1,
                            bill_ID_created: bill_ID,
                            table_ID_used: tid,
                            staff_ID: staff_ID,
                            message: `${tid} is being used and ${bill_ID} is created!`
                        })
                    })
                    .catch((err) => {
                        return res.status(500).json({
                            success: false,
                            code: 0,
                            message: err
                        })
                    })
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    message: err
                })
            })
    }
    else if (tableStatus == 0) {
        return res.status(500).json({
            success: true,
            code: 0,
            message: `Table ${tid} is currently being used with ${bill_ID}! You can not create a bill!`
        })
    }
    else if (checkStaff == 0) {
        return res.status(500).json({
            success: true,
            code: 0,
            message: `Staff with ID: ${staff_ID} does not exist!`
        })
    }
    else {
        return res.status(500).json({
            success: false,
            message: "ERROR OR NOT FOUND TABLE_ID OR ERROR WITH STAFF"
        })
    }
})


module.exports = router;