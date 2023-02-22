const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');

// [GET] Product Storage page -> /api/products/storage
// Get all the products
router.get("/get-tables", async (req, res, next) => {
    await db.Query(queryString("select",
        {
            select: "*",
            table: "__TABLE",
            optional: "order by table_ID asc"
        }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: "List all table",
                    data: data
                })
            }
            else {
                return res.status(404).json({
                    success: true,
                    message: "List is empty"
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


module.exports = router;