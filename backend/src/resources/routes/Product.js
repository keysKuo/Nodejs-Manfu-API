const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');

// [GET] Product Storage page -> /api/products/storage
// Get all the products
router.get('/storage', async (req, res, next) => {
    await db.Query(queryString('select',
        {
            select: '*',
            table: '__PRODUCT',
            optional: 'ORDER BY product_priority'
        }))
        .then(records => {
            if (records.length != 0)
                return res.status(200).json(
                    {
                        // code: 0,
                        success: true,
                        msg: "Display list of product",
                        data: records
                    });
            return res.status(404).json(
                {
                    success: false,
                    msg: 'Không tìm thấy sản phẩm nào'
                });
        })
        .catch(err => {
            return res.status(500).json(
                {
                    success: false,
                    msg: err
                });
        })
})

// [GET] Get Product list page by Target -> /api/products/get-menu/
router.get("/get-menu/", async (req, res, next) => {
    await db.CallFunc({
        function: 'FN_GET_MENU_CLIENT()',
        optional: 'Order by product_category'
    })
        .then(data => {
            if (data.length != 0) {
                return res.status(200).json({
                    // code: 0,
                    success: true,
                    message: "Display list of available products",
                    data: data
                });
            }
            else {
                return res.status(404).json({
                    code: 1,
                    success: false,
                    message: "Can not find available products"
                })
            }
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                success: false,
                message: err
            })
        })
})

// [GET] Preview Product /api/products/get-one/:pid
router.get('/get-one/:pid', async (req, res, next) => {
    const { pid } = req.params;
    await db.CallFunc({
        function: `FN_FIND_A_PRORDUCT_BY_ID ('${pid}')`
    })
        .then(records => {
            if (records.length != 0) {
                let is_available = records[0].is_available;
                if (is_available == 1) {
                    return res.status(200).json({
                        // code: 0,
                        success: true,
                        message: "Found product",
                        data: records[0]
                    })
                }
                else {
                    return res.status(300).json({
                        success: true,
                        message: "Product is not available"
                    })
                }
            }
            else
                return res.status(404).json({
                    code: 1,
                    success: false,
                    message: "Can not find product",
                })
            // return res.status(404).json({});
        })
        .catch(err => {
            return res.status(500).json({
                code: 1,
                success: false,
                msg: err
            });
        })
})



// [POST] Add a new product -> /api/products/create
router.post('/create', async (req, res, next) => {
    const { pid, pname, pimg, category, price, priority, is_available } = req.body;
    let available = is_available ? 1 : 0;
    let is_exist = await db.Query(queryString('select', {
        select: 'product_name',
        table: '__PRODUCT',
        where: `product_name = '${pname}'`
    }))

    if (is_exist.length != 0) {
        return res.status(500).json({ success: false, msg: 'Sản phẩm này đã tồn tại' });
    }

    await db.Execute(queryString('insert', {
        table: '__PRODUCT',
        values: `'${pid}' , N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${pimg}'`
    }))
        .then(() => {
            return res.status(200).json({ success: true, product: { ...req.body } })
        })
        .catch(err => {
            return res.status(500).json({ err });
        })
})

// [POST] Delete a product -> /api/products/delete/:pid
router.delete('/delete/:pid', async (req, res, next) => {
    const { pid } = req.params;

    await db.Execute(queryString('delete', {
        table: '__PRODUCT',
        where: `product_ID = '${pid}'`
    }))
        .then(() => {
            return res.status(200).json({ success: true, msg: 'Xóa sản phẩm thành công' });
        })
        .catch(err => {
            return res.status(500).json({ success: false, msg: err });
        })
})

// [PUT] Update a product -> /api/products/update/:pid
router.put('/update/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const { pname, category, price, priority, is_available, pimg } = req.body;
    let available = is_available ? 1 : 0;

    await db.ExecProc({
        procedure: `PROC_UPDATE_PRODUCT '${pid}', N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${pimg}'`
    })
        .then(() => {
            return res.status(200).json({ success: true, msg: 'Chỉnh sửa sản phẩm thành công' });
        })
        .catch(err => {
            return res.status(500).json({ success: false, msg: err });
        })
})


// [PUT] Toggle switch status of a Product -> /api/products/switch-status/:pid
router.put('/switch-status/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const { is_available } = req.body;
    
    let available = (is_available == "true") ? 0 : 1;
    
    await db.ExecProc({
        procedure: `PROC_SWITCH_STATUS_PRODUCT '${pid}', ${available}`
    })
        .then(() => {
            return res.status(200).json({
                success: true,
                msg: `Change success for ${pid}`,
                is_available: available
            });
        })
        .catch(err => {
            return res.status(500).json({ success: false, err });
        })
})



module.exports = router;
