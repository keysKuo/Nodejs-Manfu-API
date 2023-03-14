const sql = require('mssql/msnodesqlv8');
require('dotenv').config();
const sql_machine = process.env.SQL_MACHINE || "local";
const sql_db = process.env.SQL_DB;

var config = {
    database: sql_db,
    server: sql_machine,
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
}

module.exports = {
    statusCheck: function (status) {
        const valid_status = ["success",
            "idle",
            "cancel"]
        return result = (valid_status.includes(status)) ? true : false
    },

    procedureQueryString: (sSQL) => {
        return new Promise(async (resolve, reject) => {
            await sql.connect(config, async err => {
                if (err)
                    reject(err);

                var request = new sql.Request();
                await request.query(sSQL, (err, result) => {
                    if (err)
                        reject(err);

                    if (result)
                        resolve(result)
                })
            });
        })
    },

    endline: function () {
        return "This is end line for index2.js"
    },

};