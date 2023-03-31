require('dotenv').config();
const sql = require('mssql/msnodesqlv8');
const sql_machine = process.env.SQL_MACHINE || "local";
const sql_db = process.env.SQL_DB;
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');

module.exports = {
    getTableStatus: async function (tid) {
        let result
        await db.CallFunc({
            function: `FN_GET_ALL_TABLE()`,
            optional: `WHERE table_ID = '${tid}'`
        })
            .then(async (data) => {
                if (data.length == 0) {
                    result = -1 // no data found
                }
                else {
                    // console.log(data)
                    let available = (data[0].is_available == true) ? 1 : 0
                    result = available
                }
            })
            .catch((err) => {
                result = -2 // error
            })
        return result
    },

    checkStaffID: async function (staff_ID) {
        let result
        await db.CallFunc({
            function: `FN_FIND_A_STAFF_BY_ID('${staff_ID}')`
        })
            .then((data) => {
                if (data.length == 0) {
                    result = 0
                }
                else {
                    result = 1
                }
            })
            .catch((err) => {
                result = -1
            })
        return result
    },

    checkExist: async function (func, optional) {
        let result
        await db.CallFunc({
            function: func,
            optional: optional
        })
            .then((data) => {
                if (data.length == 0) {
                    result = 0
                }
                else {
                    result = 1
                }
            })
            .catch((err) => {
                result = -1
            })
        return result
    },

    statusCheckOrder: function (status) {
        const valid_status_order = ["success",
            "waiting",
            "preparing",
            "cancel"]
        return result = (valid_status_order.includes(status)) ? true : false
    },

    getOrderStatus: async function (oid) {
        let result
        await db.CallFunc({
            function: `FN_REFRESH_ORDER_QUEUE()`,
            optional: `WHERE order_ID = '${oid}'`
        })
            .then((data) => {
                if (data.length == 0) {
                    result = "null"
                }
                else {
                    let status = data[0].order_status
                    result = status
                }
            })
            .catch((err) => {
                result = "error"
            })
        return result
    },

    updateStatusOrderCheck: async function (status, oid) {
        let result
        // valid status from req.body
        if (module.exports.statusCheckOrder(status)) {
            // get order_status from oid
            let order_status = await module.exports.getOrderStatus(oid)
            if (order_status == 'success' || order_status == 'cancel') {
                result = {
                    success: false,
                    message: `Can not change when the order is in ${order_status} status!`
                }
            }
            else if (order_status == 'preparing') {
                if (status == 'waiting') {
                    result = {
                        success: false,
                        message: 'Invalid status change! Order is in PREPARING status! Next logical status is success!'
                    }
                }
                else {
                    // reutn true
                    result = {
                        success: true,
                        code: 1,
                    }
                }
            }
            else if (order_status == 'waiting') {
                if (status == 'success') {
                    result = {
                        success: false,
                        message: 'Invalid status change! Order is in WAITING status! Next logical status is preparing or cancel!'
                    }
                }
                else {
                    result = {
                        success: true,
                        code: 1,
                    }
                }
            }
            else {
                result = {
                    success: false,
                    message: `${oid}'s current status is Invalid!`
                }
            }
        }
        else {
            result = {
                success: false,
                message: `${status} is Invalid!`
            }
        }
        return result
    },

    checkExistObject: async function (func, optional) {
        let result
        await db.CallFunc({
            function: func,
            optional: optional
        })
            .then((data) => {
                if (data.length == 0) {
                    result = {
                        success: false,
                        code: 0,
                        message: `No data`
                    }
                }
                else {
                    result = {
                        success: true,
                        code: 1,
                        data: data[0]
                    }
                }
            })
            .catch((err) => {
                result = {
                    success: false,
                    message: err
                }
            })
        return result
    },

    getStatusBasedOnCategory: function (category) {
        let result
        if (category == 'extra')
            result = 'success'
        else
            result = 'waiting'
        return result
    },

    increaseOrderPriority: function (proc) {
        let result
        db.ExecProc({
            procedure: proc
        })
            .then(() => {
                result = {
                    success: true,
                    code: 1
                }
            })
            .catch((err) => {
                result = {
                    success: false,
                    message: err
                }
            })
        return result
    }

}

// note to self: dont do module.exports = {}, do module.exports.func1() and module.exports.func2()
// try func1() and func2() and module.exports = {func1(), func2()} 