require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');
const { twoHalf, getTime } = require('../middlewares/index');


router.get('/home', async (req, res, next) => {
    req.session.staff_ID = "EMP0000001";
    if(req.session.table_ID) {
        return res.redirect('/client/menu')
    }
    await fetch(API_URL + 'tables/get-tables', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();

        let tables = [];
        if (result.success) {
            tables = result.data;
        }

        return res.render('pages/clients/home', {
            layout: 'main',
            tables: tables,
            error: req.flash('error') || ''
        })
    })
    .catch(err => {
        return res.render('pages/clients/home', {
            layout: 'main'
        })
    })
    
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

router.get('/get-orders-by-bill/:bill_ID', async (req, res, next) => {
    const { bill_ID } = req.params;

    await fetch(API_URL + `/orders/get-orders-by-bill/${bill_ID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'},
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let orders = result.data.orders;
            let total = result.data.total;
            return res.status(200).send({orders, total})
        }

        return res.status(404).send({err: result.message})
    })
    .catch(err => {
        return res.status(500).send({err})
    })
})

router.get('/open-table/:tid', async (req, res, next) => {
    const { tid } = req.params;
    await fetch(API_URL + `tables/open-table/${tid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({staff_ID: req.session.staff_ID})
    })
    .then(async result => {
        result = await result.json();
        if (result.success) {
            req.session.table_ID = result.table_ID_used;
            req.session.bill_ID = result.bill_ID_created;
            return res.redirect('/client/menu');
        }
        else {
            req.flash('error', 'Bàn đang được sử dụng. Vui lòng chọn bàn khác');
            return res.redirect('/client/home');
        }

    })
    .catch(err => {
        req.flash('error', 'Không thể mở bàn');
        return res.redirect('/client/home');
    })
})

router.get('/menu', async (req, res, next) => {
    if(!req.session.table_ID) {
        return res.redirect('/client/home')
    }
    const { table_ID , bill_ID } = req.session;
    
    await fetch(API_URL + "products/get-menu", {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(async result => {
            result = await result.json();
            
            if (result.success) {
                let data = result.data;
                let buffets = [];
                let alacartes = [];
                let extras = [];
                
                if (data.length != 0) {
                    data.forEach(p => {
                        let product = {
                            pid: p.product_ID,
                            pname: p.product_name,
                            pimg: p.image_link,
                            price: p.product_price,
                        }
 

                        switch(p.product_category) {
                            case 'buffet':
                                buffets.push(product);
                                break;
                            case 'alacarte':
                                alacartes.push(product);
                                break;
                            case 'extra':
                                extras.push(product);
                                break;
                            default:
                                break;
                        }
                        
                    })
                }
                
                return res.render('pages/clients/menu', {
                    layout: 'main',
                    success: req.flash('success') || '',
                    error: req.flash('error') || '',
                    buffets: twoHalf(buffets), alacartes: twoHalf(alacartes), extras: twoHalf(extras),
                    table_ID, bill_ID, total: 0
                })
            }
        })
        .catch(err => {
            console.log(err)
            return res.render('pages/clients/menu', {
                layout: 'main'
            })
        })
    
})

router.get('/tinh-tien', async (req, res, next) => {
    let { table_ID, bill_ID } = req.session;
    if (!table_ID || !bill_ID) {
        return res.redirect('/client/home');
    }

    await fetch(API_URL + `bills/get-bill/${bill_ID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        result = await result.json();

        if(result.success) {
            let total = result.total_price;
            let tax = result.tax_value;
            let final_price = result.final_price;
            let data = result.data;
            let items = [];
            data.forEach(d => {
                if (d.product_category != 'buffet') {
                    items.push( {
                        pname: d.product_name,
                        price: d.price,
                        quantity: d.quantity,
                        created_at: getTime(d.created_at),
                    })
                }
            })

            
            return res.render('pages/clients/bill',{
                layout: 'main',
                items, bill_ID,
                tax, total: parseInt(total.replaceAll(',','')), final_price: parseInt(final_price.replaceAll(',',''))
            });
        }
        else {
            req.flash('error', 'Xuất hiện lỗi hóa đơn');
            return res.redirect('/client/menu');
        }
        
    })
});

router.get('/thanh-toan/:bill_ID', async (req, res, next) => {
    let { table_ID, bill_ID } = req.session;
    if (!table_ID || !bill_ID) {
        return res.redirect('/client/home');
    }


    await fetch(API_URL + `bills/close-bill/${bill_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'}
    })
    .then(async result => {
        result = await result.json();
        
        if(result.success) {
            req.session.destroy();
            
            return res.render('pages/clients/finish');
        }
        else {
            return res.json({
                msg: 'Thanh toán hóa đơn thất bại'
            })
        }
    })
})



module.exports = router;