const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');
const { checkExist, checkExistObject } = require("../middlewares/function-phu");


// [GET] Get product storage -> /api/products/storage
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
                        success: true,
                        code: 1,
                        message: "Product Storage",
                        counter: records.length,
                        data: records
                    });
            return res.status(300).json(
                {
                    success: true,
                    code: 0,
                    message: 'Storage is Empty!'
                });
        })
        .catch(err => {
            return res.status(500).json(
                {
                    success: false,
                    message: err
                });
        })
})


// [GET] Get products (client side) -> /api/products/get-menu/
router.get("/get-menu/", async (req, res, next) => {
    await db.CallFunc({
        function: 'FN_GET_MENU_CLIENT()',
        optional: 'ORDER BY product_category'
    })
        .then(data => {
            
            if (data.length != 0) {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: "Available products",
                    counter: data.length,
                    data: data
                });
            }
            else {
                return res.status(404).json({
                    success: true,
                    code: 0,
                    message: "Can not find available products"
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


// [GET] Get product info based on ID /api/products/get-one/:pid
router.get('/get-one/:pid', async (req, res, next) => {
    const { pid } = req.params;
    await db.CallFunc({
        function: `FN_FIND_A_PRORDUCT_BY_ID('${pid}')`
    })
        .then((data) => {
            if (data.length == 0) {
                return res.status(300).json({
                    success: true,
                    code: 0,
                    message: `No product with ID: ${pid} found!`
                })
            }
            else {
                let available = data[0].is_available
                if (available == true) {
                    return res.status(200).json({
                        success: true,
                        code: 1,
                        message: `Found info for ${pid}`,
                        data: data[0]
                    })
                }
                else {
                    return res.status(300).json({
                        success: true,
                        code: 0,
                        message: `Product ID: ${pid} is NOT available!`
                    })
                }
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })
})


// [POST] Create a new product -> /api/products/create
router.post('/create', async (req, res, next) => {
    const { pid, pname, category, price, priority, is_available, img } = req.body
    let available = (is_available == true) ? 1 : 0;
    let exist = await checkExist(`FN_FIND_A_PRORDUCT_BY_ID('${pid}')`, '')
    if (exist == 0) {
        await db.ExecProc({
            procedure: `PROC_INSERT_PRODUCT '${pid}', N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${img}'`
        })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Product ${pid} created!`,
                    data: { ...req.body }
                })
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    message: err
                })
            })
    }
    else {
        return res.status(500).json({
            success: true,
            code: 0,
            message: "ERROR OR PRODUCT EXISTED!"
        })
    }
})


// [DELETE] Delete a product -> /api/products/delete/:pid
router.delete('/delete/:pid', async (req, res, next) => {
    const { pid } = req.params;
    let exist = await checkExist(`FN_FIND_A_PRORDUCT_BY_ID('${pid}')`, '')
    if (exist == 0) {
        return res.status(404).json({
            success: false,
            message: `Product ${pid} do not exist!`
        })
    }
    else {
        await db.ExecProc({
            procedure: `PROC_DELETE_PRODUCT '${pid}'`
        })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Delete product ${pid} successfully!`
                })
            })
            .catch((err) => {
                return res.status(500).json({
                    success: false,
                    message: err
                })
            })
    }
})


// [PUT] Update a product -> /api/products/update/:pid
router.put('/update/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const { pname, category, price, priority, is_available, pimg } = req.body;
    let available = is_available ? 1 : 0;
    let exist = await checkExist(`FN_FIND_A_PRORDUCT_BY_ID('${pid}')`, '')
    if (exist == 0) {
        return res.status(404).json({
            success: false,
            message: `Product ${pid} does not exist!`
        })
    }
    else {
        await db.ExecProc({
            procedure: `PROC_UPDATE_PRODUCT '${pid}', N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${pimg}'`
        })
            .then(() => {
                return res.status(200).json({
                    success: true,
                    code: 1,
                    message: `Update product ${pid} successfully!`
                });
            })
            .catch(err => {
                return res.status(500).json({
                    success: false,
                    message: err
                });
            })
    }
})


// [PUT] Toggle status of a product -> /api/products/switch-status/:pid
router.put('/switch-status/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const { is_available } = req.body;
    let available = (is_available == "true") ? 0 : 1;

    let productChecker = await checkExistObject('FN_VIEW_PRODUCT_STORAGE()', `WHERE product_ID = '${pid}'`)
    if (productChecker.success == false) {
        return res.status(404).json({ success: true, code: 0, message: `Product ${pid} doesn't exist! Cannot switch status!` })
    }
    await db.ExecProc({
        procedure: `PROC_SWITCH_STATUS_PRODUCT '${pid}', ${available}`
    })
        .then(() => {
            return res.status(200).json({
                success: true,
                code: 1,
                message: `Product ${pid} successfully changed!`,
                is_available: available
            });
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            });
        })
})


module.exports = router;
