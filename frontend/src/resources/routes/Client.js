require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');

router.get('/menu', async (req, res, next) => {
    await fetch(API_URL + "/products/get-menu", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let data = result.data;
            let orders = [];
            if(data.length != 0) {
                orders = data.map(d => {
                    return {
                        pid: d.product_ID,
                        pname: d.product_name,
                        pimg: d.image_link,
                        price: d.product_price.toString().toLocaleString('vi-vn'),
                    }
                })
            }

            return res.render('pages/clients/menu', {
                layout: 'main',
                success: req.flash('success') || '',
                error: req.flash('error') || '',
                orders: orders
            })
        }
    })

    return res.render('pages/clients/menu', {
        layout: 'main'
    })
})

router.get('/place-order', async (req, res, next) => {
    
})

module.exports = router;