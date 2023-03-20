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
        headers: { 'Content-Type': 'application/json' }
    })
        .then(async (result) => {
            result = await result.json();
            if (result.success == true) {
                let products = result.data;
                let orders = [];
                if (products.length != 0) {
                    orders = products.map(p => {
                        return {
                            pid: p.product_ID,
                            pname: p.product_name,
                            pimg: p.image_link,
                            price: p.product_price.toString().toLocaleString('vi-vn'),
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
        .catch((err) => {
            return res.status(500).json({err})
        })

    // return res.render('pages/clients/menu', {
    //     layout: 'main'
    // })
})


router.get('/place-order', async (req, res, next) => {
    // console.log(req)
    console.log(req.data)
    await fetch(API_URL + 'product')
})

module.exports = router;