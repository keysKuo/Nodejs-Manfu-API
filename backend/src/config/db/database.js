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
    return new Promise((resolve, reject) => {
        sql.connect(config, err => {
            if (err)
                return reject(err);

            var request = new sql.Request();
            request.query(sSQL, (err, records) => {
                if (err)
                    return reject(err);

                sql.close();

                if (records)
                    return resolve(records.recordset)
            })
        });
    })
}

module.exports.Execute = (sSQL) => {
    return new Promise((resolve, reject) => {
        sql.connect(config, err => {
            if (err)
                reject(err);

            var request = new sql.Request();
            request.query(sSQL, (err, result) => {
                if (err)
                    reject(err);

                sql.close();

                if (result)
                    resolve(result)
            })
        });
    })
}