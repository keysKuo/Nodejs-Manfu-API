const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

var config = {
    database: 'manfu',
    server: 'DESKTOP-4FUINID\\SQLEXPRESS',
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
                
                if(records)
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
                
                if(result)
                    resolve(result)
            })  
        });
    })
}