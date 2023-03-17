require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');

// [GET] Food Queue /kitchen/queue
router.get('/queue', async (req, res, next) => {
    await fetch(API_URL + `/orders/get-orders`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        result = await result.json();
        
        if (result.success) {
            let data = result.data;
            let orders = [];
            if(data.length != 0) {
                // return res.json(data);
                orders = data.map(d => {
                    let nextStatus = '';
                    switch (d.order_status) {
                        case 'waiting':
                            nextStatus = `<a style="font-size: 10px" class="btn btn-primary w-100 mt-2 mb-3">Nhận đơn</a>`
                            break;
                        case 'preparing':
                            nextStatus = `<a style="font-size: 10px" class="btn btn-success w-100 mt-2 mb-3">Hoàn thành</a>`
                            break;
                        default:
                            break;
                    }

                    return {
                        pname: d.product_name,
                        table: d.table_ID,
                        created_at: d.created_at,
                        nextStatus:  nextStatus                      
                    }
                })
            }
            return res.render('pages/kitchen/list', {
                layout: 'main',
                template: 'page',
                orders: orders,
                success: req.flash('success') || '',
                error: req.flash('error') || '' ,
            })
        }
    })
    .catch(err => {
        return res.status(500).json({err});
    })

    
})

module.exports = router;