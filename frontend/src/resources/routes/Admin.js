require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');


// [GET] Storage product /admin/storage-product
router.get('/storage-product', async (req, res, next) => {
    await fetch(API_URL + `products/storage` , {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        let products = data.map(d => {
            return {
                pid: d.product_ID,
                pname: d.product_name,
                pimg: d.image_link,
                category: d.product_category,
                price: d.product_price,
                priority: d.product_priority,
                is_available: d.is_available
            }
        })

        
        return res.render('pages/products/storage', {
            layout: 'admin',
            success: req.flash('success') || '',
            error: req.flash('error') || '' ,
            products: products
        })
    })
    
})

// [GET] Create product -> /admin/create-product
router.get('/create-product', async (req, res, next) => {
    let categories = ['buffet', 'alacarte', 'extra'];

    return res.render('pages/products/create', {
        layout: 'admin',
        pageName: 'Thêm sản phẩm',
        categories,
        success: req.flash('success') || '',
        error: req.flash('error') || ''
    })
})

// [POST] Create product -> admin/create-product
router.post('/create-product', upload.single('pimg'), async (req, res, next) => {
    const file = req.file;
    const pid = req.pid;
    let pimg = `/uploads/pimg/${pid}/${file.filename}`;

    let body = JSON.stringify({pid, pimg, ...req.body});
    await fetch(API_URL + '/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: body
    })
    .then(async (result) => {
        let data = await result.json();
        req.flash('success', 'Thêm sản phẩm thành công');
        return res.redirect('/admin/storage-product');
    })
    .catch(err => {
        req.flash('error', 'Xóa sản phẩm thất bại');
        return res.redirect('/admin/storage-product');
    })
})


// [GET] Delete product -> /admin/delete-product/:pid
router.get('/delete-product/:pid', async (req, res, next) => {
    const { pid } = req.params;
    
    await fetch(API_URL + `/products/delete/${pid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async (result) => {
        let data = await result.json();

        if(data.success) {
            req.flash('success', data.msg);
            fileapis.removeDirectory(`frontend/src/public/uploads/pimg/${pid}`, err => {
                console.log(err);
            })    
        }
        else {
            req.flash('error', 'Xóa sản phẩm thất bại');
        }
        return res.redirect('/admin/storage-product');
    })
    .catch(err => {
        req.flash('error', 'Xóa sản phẩm thất bại');
        return res.redirect('/admin/storage-product');
    })
})

// [GET] Update product -> admin/update-product/:pid
router.get('/update-product/:pid', async (req, res, next) => {
    const { pid } = req.params;
    let categories = ['buffet', 'alacarte', 'extra'];
    let data = await fetch(API_URL + `/products/getOne/${pid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        let data = await result.json();
        return {
            pid: data.product_ID,
            pname: data.product_name,
            pimg: data.image_link,
            category: data.product_category,
            price: data.product_price,
            priority: data.product_priority,
            is_available: data.is_available == 1
        };
    })

    return res.render('pages/products/update', {
        layout: 'admin',
        pageName: 'Chỉnh sửa sản phẩm',
        categories, data,
        success: req.flash('success') || '',
        error: req.flash('error') || ''
    })
})

// [POST] Update product -> /admin/update-product/:pid
router.post('/update-product/:pid', upload.single('pimg'), async (req, res, next) => {
    const { pid } = req.params;
    const file = req.file;
    let { oldpath } = req.body;
    let pimg = '';
    
    if(file) {
        pimg = `/uploads/pimg/${pid}/${file.filename}`;
        fileapis.deleteSync('frontend/src/public' + oldpath, err => [
            console.log(err)
        ])
    }
    else {
        pimg = oldpath;
    }

    let body = JSON.stringify({
        pid, pimg, ...req.body
    })
    
    await fetch(API_URL + `/products/update/${pid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body
    })
    .then(async result => {
        let data = await result.json();
        if(data.success) {
            req.flash('success', 'Chỉnh sửa sản phẩm thành công');
        }else {
            req.flash('error', 'Chỉnh sửa sản phẩm thất bại');
        }
        return res.redirect('/admin/storage-product');
        
    })
    .catch(err => {
        req.flash('error', 'Chỉnh sửa sản phẩm thất bại');
        return res.redirect('/admin/storage-product');
    })
})

// [GET] Preview product -> /admin/preview-product/:pid
router.get('/preview-product/:pid', async (req, res, next) => {
    const { pid } = req.params;

    await fetch(API_URL + `/products/getOne/${pid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        let data = await result.json();

        return res.render('pages/products/preview', {
            layout: 'admin',
            pageName: 'Preview sản phẩm',
            data: {
                pid: data.product_ID,
                pname: data.product_name,
                pimg: data.image_link,
                category: data.product_category,
                price: data.product_price,
                priority: data.product_priority,
            },
            success: req.flash('success') || '',
            error: req.flash('error') || ''
        })
    })
})


module.exports = router;