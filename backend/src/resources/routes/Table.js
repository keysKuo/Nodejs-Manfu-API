const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');

// [GET] All tables page -> /api/tables/get-tables
// Get all the tables
router.get("/get-tables", async (req, res, next) => {
    await db.Query(queryString("select",
        {
            select: "*",
            table: "__TABLE",
            optional: "order by table_ID desc"
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


router.get("/get-tables/available", async (req, res, next) => {
    await db.Query(queryString("select",
        {
            select: "*",
            table: "__TABLE",
            optional: "where is_available = 1 order by table_ID desc"
        }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: "List all available table(s)",
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


router.get("/get-tables/unavailable", async (req, res, next) => {
    await db.Query(queryString("select",
        {
            select: "*",
            table: "__TABLE",
            optional: "where is_available = 0 order by table_ID desc"
        }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: "List all unavailable table(s)",
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
});


router.get('/get-table/:tid', async (req, res, next) => {
    const { tid } = req.params;
    await db.Query(queryString("select",
        {
            select: "*",
            table: "__TABLE",
            optional: `where table_ID = '${tid}' `
        }))
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json(
                    {
                        success: true,
                        message: `Content of table ${tid}`,
                        data: data
                    }
                )
            }
            else {
                return res.status(500).json(
                    {
                        success: false,
                        message: 'No content'
                    }
                )
            }
        })
        .catch(err => {
            return res.status(404).json(
                {
                    success: false,
                    message: err
                }
            )
        })
});


router.post('/create', async (req, res, next) => {
    const { table_ID, table_seat, is_available, staff_ID } = req.body;
    let available = is_available ? 1 : 0;
    let is_exist = await db.Query(queryString('select', {
        select: 'table_ID',
        table: '__TABLE',
        where: `table_ID = '${table_ID}'`
    }))

    if (is_exist.length != 0) {
        return res.status(500).json(
            {
                success: false,
                msg: 'Bàn này đã tồn tại'
            }
        );
    }

    await db.Execute(queryString('insert', {
        table: '__TABLE',
        values: `'${pid}' , N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${pimg}'`
    }))
        .then(() => {
            return res.status(200).json({ success: true, product: { ...req.body } })
        })
        .catch(err => {
            return res.status(500).json({ err });
        })
})

// router.put('/update/:tid', async (req, res, next) => {
//     const { tid } = req.params;
//     const { table_ID, table_seat, is_available, staff_ID } = req.body;
//     let available = is_available ? 1 : 0

//     await db.Execute(queryString('update', {
//         table: '__PRODUCT',
//         set: `product_name = N'${pname}', product_category = '${category}', product_price = ${price}, product_priority = ${priority}, is_available = ${available}, image_link = '${pimg}'`,
//         where: `product_ID = '${pid}'`
//     }))
//         .then(() => {
//             return res.status(200).json({ success: true, msg: 'Chỉnh sửa sản phẩm thành công' });
//         })
//         .catch(err => {
//             return res.status(500).json({ success: false, msg: err });
//         })
// });


module.exports = router;