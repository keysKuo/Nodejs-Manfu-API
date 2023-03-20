require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');
const { match_2arr } = require('../middlewares/index');
// router.get('/home', (req, res, next) => {
//     return res.render('pages/client/home', {
//         layout: 'main'
//     })
// })

<<<<<<< HEAD
router.get('/menu', async (req, res, next) => {
=======
router.get('/home', (req, res, next) => {
    req.session.table_ID = 'B1',
    req.session.bill_ID = 'BILL0001'
    return res.redirect('/client/menu');
})

router.post('/create-order', async (req, res, next) => {
    const { table_ID, bill_ID } = req.session;
    const { data } = req.body;
    // console.log(data)

    // return res.json(data);
    let body = JSON.stringify({
        table_ID, bill_ID,
        data: data
    })

    
    await fetch(API_URL + 'orders/create-order/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: body 
    })
    .then(async result => {
        result = await result.json();
        return res.send(result)
    })
    .catch(err => {
        return res.sendStatus(500);
    })
})

router.get('/menu', async (req, res, next) => {
    const { table_ID , bill_ID } = req.session;
    
>>>>>>> e948c1e1ac5ef6ea00f0ca34574f205c0a95b1f4
    await fetch(API_URL + "products/get-menu", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(async result => {
            result = await result.json();
<<<<<<< HEAD

            if (result.success) {
                let data = result.data;
=======
            
            if (result.success) {
                let products = result.data;
                
>>>>>>> e948c1e1ac5ef6ea00f0ca34574f205c0a95b1f4
                let orders = [];
                if (data.length != 0) {
                    orders = data.map(d => {
                        return {
<<<<<<< HEAD
                            pid: d.product_ID,
                            pname: d.product_name,
                            pimg: d.image_link,
                            price: d.product_price.toString().toLocaleString('vi-vn'),
=======
                            pid: p.product_ID,
                            pname: p.product_name,
                            pimg: p.image_link,
                            price: p.product_price,
>>>>>>> e948c1e1ac5ef6ea00f0ca34574f205c0a95b1f4
                        }
                    })
                }

                return res.render('pages/clients/menu', {
                    layout: 'main',
                    success: req.flash('success') || '',
                    error: req.flash('error') || '',
                    orders: orders,
                    table_ID, bill_ID
                })
            }
        })
<<<<<<< HEAD

    return res.render('pages/clients/menu', {
        layout: 'main'
    })
=======
        .catch(err => {
            return res.render('pages/clients/menu', {
                layout: 'main'
            })
        })
    
>>>>>>> e948c1e1ac5ef6ea00f0ca34574f205c0a95b1f4
})

router.get('/place-order', async (req, res, next) => {

})

module.exports = router;