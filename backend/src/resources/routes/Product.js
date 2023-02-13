const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');

// [GET] Product Storage page -> /api/products/storage
router.get('/storage', async (req, res, next) => {
    await db.Query(queryString('select', {
        select: '*',
        table: '__PRODUCT',
        optional: 'ORDER BY product_priority'
    }))
    .then(records => {
        if(records.length != 0)
            return res.status(200).json(records);
        return res.status(404).json({success: false, msg: 'Không tìm thấy sản phẩm nào'});
    })
    .catch(err => {
        return res.status(500).json({success: false, msg: err});
    })
})

// [GET] Preview Product /api/products/preview
router.get('/getOne/:pid', async (req, res, next) => {
    const { pid } = req.params;
    
    await db.Query(queryString('select', {
        select: '*',
        table: '__PRODUCT',
        where: `product_id = '${pid}'`
    }))
    .then(records => {
        if (records.length != 0)
            return res.status(200).json(records[0])
        return res.status(404).json({});
    })
    .catch(err => {
        return res.status(500).json({success: false, msg: err});
    })
})

// [POST] Add a new product -> /api/products/create
router.post('/create', async (req, res, next) => {
    const { pid, pname, pimg, category, price, priority, is_available } = req.body;
    let available = is_available ? 1 : 0;
    let is_exist = await db.Query(queryString('select',{
        select: 'product_name',
        table: '__PRODUCT',
        where: `product_name = '${pname}'`
    }))
    
    if (is_exist.length != 0) {
        return res.status(500).json({success: false, msg: 'Sản phẩm này đã tồn tại'});
    }
    
    await db.Execute(queryString('insert', {
        table: '__PRODUCT',
        values: `'${pid}' , N'${pname}', '${category}', ${price}, ${priority}, ${available}, '${pimg}'`
    }))
    .then(() => {
        return res.status(200).json({success: true, product: {...req.body}})
    })
    .catch(err => {
        return res.status(500).json({err});
    })
})

// [POST] Delete a product -> /api/products/delete/:pid
router.post('/delete/:pid', async (req, res, next) => {
    const { pid } = req.params;
    
    await db.Execute(queryString('delete', {
        table: '__PRODUCT',
        where: `product_ID = '${pid}'`
    }))
    .then(() => {
        return res.status(200).json({success: true, msg: 'Xóa sản phẩm thành công'});
    })
    .catch(err => {
        return res.status(500).json({success: false, msg: err});
    })
})

// [PUT] Update a product -> /api/products/update/:pid
router.put('/update/:pid', async (req, res, next) => {
    const { pid } = req.params;
    const { pname, category, price, priority, is_available, pimg } = req.body;
    let available = is_available ? 1 : 0;
    
    await db.Execute(queryString('update', {
        table: '__PRODUCT',
        set: `product_name = N'${pname}', product_category = '${category}', product_price = ${price}, product_priority = ${priority}, is_available = ${available}, image_link = '${pimg}'`,
        where: `product_ID = '${pid}'`
    }))
    .then(() => {
        return res.status(200).json({success: true, msg: 'Chỉnh sửa sản phẩm thành công'});
    })
    .catch(err => {
        return res.status(500).json({success: false, msg: err});
    })
})



module.exports = router;
