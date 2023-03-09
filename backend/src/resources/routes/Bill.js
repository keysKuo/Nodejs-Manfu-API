const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { statusCheck, procedureQueryString } = require('../middlewares/index2');
const { uuid } = require('uuidv4');


router.get('/get-bills', async (req, res, next) => {
    await db.Query(queryString("select", {
        select: "*",
        table: "__BILL"
    }))
        .then((data) => {
            if (data.length == 0) {
                return res.status(404).json({
                    success: false,
                    message: "No bill in database"
                })
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: `There are ${data.length}`,
                    data: data
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



router.post("/create-bill", async (req, res, next) => {
    const { table_ID } = req.body
    let bill_ID = "B" + uuid().substring(0, 9) // create bill_ID

    // update/add bill_ID for __ORDER
    await db.Execute(queryString("update", {
        table: "__ORDER",
        set: `bill_ID = '${bill_ID}'`,
        where: `table_ID = '${table_ID}' and bill_ID is null`
    }))
        .then(() => {
            console.log("Add bill_ID successfully")
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })

    // convert remaining orders in __ORDER_DETAIL that are "idle" to "cancel" on/after update bill_ID
    await db.Execute(`update table_a
                            set table_a.product_status = 'cancel'
                            from
                                __ORDER_DETAIL as table_a
                            inner join (select *
                                        from __ORDER O
                                        where O.table_ID = '${table_ID}' and O.bill_ID = '${bill_ID}') as table_b
                            on table_a.order_ID = table_b.order_ID
                            where table_a.product_status = 'idle'`)
        .then(() => {
            console.log("Update status for remaining order successfully")
        })
        .catch(err => {
            console.log(err)
        })

    let result
    await db.Query(`select OD.*, P.product_category
                        from __ORDER O, __ORDER_DETAIL OD, __PRODUCT P
                        where O.order_ID = OD.order_ID
                            and OD.product_ID = P.product_ID
                            and O.table_ID = '${table_ID}' and O.bill_ID = '${bill_ID}'`)
        .then((data) => {
            if (data.length != 0) {
                console.log(`Get list after add bill_ID and update product status of ${bill_ID} and ${table_ID}`)
                result = data
            }
            else {
                console.log("Step 3 data was empty")
            }
        })
        .catch(err => {
            console.log(err)
        })

    // calculate money (ticket + alcarte + extra, no for the buffet ones)
    let ticket = 0
    let alacarte = 0
    let extra = 0
    result.forEach(element => {
        if (element.product_status == 'success') {
            if (element.product_category == 'alacarte') {
                alacarte = alacarte + (element.quantity * element.price)
            }
            if (element.product_category == 'ticket') {
                ticket = ticket + (element.quantity * element.price)
            }
            if (element.product_category == 'extra') {
                extra = extra + (element.quantity * element.price)
            }
        }
    });

    let total_price = ticket + alacarte + extra
    await db.Execute(queryString("insert", {
        table: "__BILL",
        values: `'${bill_ID}', ${total_price}, getdate(), '${table_ID}'`
    }))
        .then(() => {
            console.log(`Add bill ${bill_ID} at ${new Date().toISOString()}`)
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })

    // need to add switch status table

    return res.status(200).json({
        message: `${bill_ID} was added at ${new Date().toISOString()}`,
        price_detail: {
            ticket: ticket.toLocaleString(),
            alacarte: alacarte.toLocaleString(),
            extra: extra.toLocaleString(),
            total_price: total_price.toLocaleString()
        },
        products: result
    })
})


module.exports = router;