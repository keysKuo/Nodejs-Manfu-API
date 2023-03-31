require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { twoHalf, getTime } = require('../middlewares/index');

// [GET] Food Queue /kitchen/queue
router.get('/queue', async (req, res, next) => {
    let { key } = req.query || '';
    
    await fetch(API_URL + `/orders/get-orders/chef`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(async result => {
        result = await result.json();
        let orders = [];
        
        if (result.success) {
            let data = result.data;
            if(data.length != 0) {
                // return res.json(data);
                orders = data.map(d => {
                    let nextStatus = '';
                    switch (d.order_status) {
                        case 'waiting':
                            nextStatus = `<a onclick="switchStatus('${d.order_ID}', 'preparing')" data-id="${d.order_ID}" style="font-size: 10px" class="btn btn-primary sw-preparing w-100 mt-2 mb-3">Nhận đơn</a>`
                            break;
                        case 'preparing':
                            nextStatus = `<a onclick="switchStatus('${d.order_ID}', 'success')" data-id="${d.order_ID}" style="font-size: 10px" class="btn btn-success sw-success w-100 mt-2 mb-3">Hoàn thành</a>`
                            break;
                        default:
                            break;
                    }

                    return {
                        order_ID: d.order_ID,
                        pname: d.product_name,
                        table: d.table_ID,
                        status: d.order_status,
                        created_at: getTime(d.created_at),
                        nextStatus:  nextStatus                      
                    }
                })
            }
            
        }

        let orders_prepare = [];
        let orders_wait = [];

        orders.forEach(o => {
            if (o.status == 'waiting') {
                orders_wait.push(o);
            }
            else {
                orders_prepare.push(o);
            }
        })
        
        if(key == 'reload') {
            return res.status(200).send({orders_wait, orders_prepare})
        }

        return res.render('pages/kitchen/list', {
            layout: 'main',
            template: 'page',
            orders_wait: orders_wait,
            orders_prepare: orders_prepare,
            success: req.flash('success') || '',
            error: req.flash('error') || '' ,
        })
    })
    .catch(err => {
        return res.status(500).json({err});
    })
   
})


// [GET] Switch status order /kitchen/switch-status-order/:oid/:status
router.get('/switch-status-order/:oid/:status', async (req, res, next) => {
    const { oid, status } = req.params;
    
    let body = JSON.stringify({status})
    await fetch(API_URL + `/orders/update-status/${oid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: body
    })
    .then(async result => {
        result = await result.json();
        if (result.success) {
            // console.log('success');
            return res.redirect('/kitchen/queue');
        }
        else {
            console.log(result);
            return res.redirect('/kitchen/queue');
        }
    })
    .catch(err => {
        return res.json(err);
    })
})

module.exports = router;