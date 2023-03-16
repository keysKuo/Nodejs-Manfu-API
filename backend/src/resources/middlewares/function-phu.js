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
    }

}