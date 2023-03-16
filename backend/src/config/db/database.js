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

module.exports.Query = (sSQL) => {
    return exec(sSQL, false);
}

module.exports.CallFunc = (config) => {
    const func = config.function;
    const optional = config.optional || '';
    
    let sSQL = "Select * From " + func + " " + optional;
    return exec(sSQL, false);
}

module.exports.ExecProc = (config) => {
    const proc = config.procedure;
    let sSQL = "Exec " + proc;
    return exec(sSQL, true);
}

function exec(sSQL, isNonQuery) {
    return new Promise((resolve, reject) => {
        sql.connect(config, err => {
            if (err) {
                if (isNonQuery)
                    reject(err);
                return reject(err);
            }

            var request = new sql.Request();
            request.query(sSQL, (err, result) => {
                if (err) {
                    if (isNonQuery)
                        reject(err);
                    return reject(err);
                }

                // if(isNonQuery)
                //     sql.close();

                if (result) {
                    if (isNonQuery)
                        resolve(result)
                    return resolve(result.recordset);
                }
            })
        });
    })
}