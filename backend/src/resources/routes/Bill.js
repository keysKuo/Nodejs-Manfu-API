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

    // update bill_ID for __ORDER
    // await updateOrder(bill_ID, table_ID)
    await db.Execute(queryString("update", {
        table: "__ORDER",
        set: `bill_ID = '${bill_ID}'`,
        where: `table_ID = '${table_ID}' and bill_ID is null`
    }))
        .then(() => {
            console.log("Update step 1, completed")
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                message: err
            })
        })

    // convert idle to cancel on update
    // await convertIdleToCancelOnUpdate(table_ID, bill_ID)
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
            console.log("Updated __ORDER_DETAIL")
        })
        .catch(err => {
            console.log(err)
        })

    // let result = await getOrder(table_ID, bill_ID)
    let result
    await db.Query(`select OD.*, P.product_category
                        from __ORDER O, __ORDER_DETAIL OD, __PRODUCT P
                        where O.order_ID = OD.order_ID
                            and OD.product_ID = P.product_ID
                            and O.table_ID = '${table_ID}' and O.bill_ID = '${bill_ID}'`)
        .then((data) => {
            if (data.length != 0) {
                console.log("Step 3 completed")
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

    return res.status(200).json({
        message: "End of line",
        data: result,
        total_price: {
            ticket: ticket,
            alacarte: alacarte,
            extra: extra
        }
    })
})


async function updateOrder(bill_ID, table_ID) {
    await db.Execute(queryString("update", {
        table: "__ORDER",
        set: `bill_ID = '${bill_ID}'`,
        where: `table_ID = '${table_ID}' and bill_ID is null`
    }))
        .then(() => {
            console.log("Update step 1, completed")
        })
        .catch(err => {
            // return res.status(500).json({
            //     success: false,
            //     message: err
            // })
            console.log(err)
        })
}
// async function convertIdleToCancelOnUpdate(table_ID, bill_ID) {
//     await db.Execute(`update table_a
//                         set table_a.product_status = 'cancel'
//                         from
//                             __ORDER_DETAIL as table_a
//                         inner join (select *
//                                     from __ORDER O
//                                     where O.table_ID = '${table_ID}' and O.bill_ID = '${bill_ID}') as table_b
//                         on table_a.order_ID = table_b.order_ID
//                         where table_a.product_status = 'idle'`)
//         .then(() => {
//             console.log("Updated __ORDER_DETAIL")
//         })
//         .catch(err => {
//             // return res.status(500).json({
//             //     success: false,
//             //     message: err
//             // })
//             console.log(err)
//         })
// }
// async function getOrder(table_ID, bill_ID) {
//     await db.Query(`select OD.*, P.product_category
//                     from __ORDER O, __ORDER_DETAIL OD, __PRODUCT P
//                     where O.order_ID = OD.order_ID
//                         and OD.product_ID = P.product_ID
//                         and O.table_ID = '${table_ID}' and O.bill_ID = '${bill_ID}'`)
//         .then((data) => {
//             if (data.length != 0) {
//                 return data
//             }
//             else {
//                 // return res.status(404).json({
//                 //     success: false
//                 // })
//                 console.log("get order of data was empty")
//             }
//         })
//         .catch(err => {
//             // return res.status(500).json({
//             //     success: false,
//             //     message: err
//             // })
//             console.log(err)
//         })
// }
// function getTotalPrice(result) {
//     let ticket = 0
//     let alacarte = 0
//     let extra = 0

//     result.forEach(element => {
//         if (element.product_status == 'success') {
//             if (element.product_category == 'alacarte') {
//                 alacarte = alacarte + (element.quantity * element.price)
//             }
//             if (element.product_category == 'ticket') {
//                 ticket = ticket + (element.quantity * element.price)
//             }
//             if (element.product_category == 'extra') {
//                 extra = extra + (element.quantity * element.price)
//             }
//         }
//     });
//     return {
//         ticket_sum: ticket,
//         alacarte_sum: alacarte,
//         extra_sum: extra
//     }
// }



module.exports = router;

// await db.Query(queryString("select", {
    //     select: "*",
    //     table: "__ORDER",
    //     optional: `where table_ID = '${table_ID}' and bill_ID is null`
    // }))
    //     .then((data) => {
    //         if (data.length == 0) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: `There are no data for ${table_ID}`
    //             })
    //         }
    //         else {
    //             return res.status(200).json({
    //                 success: true,
    //                 message: data.length,
    //                 data: data
    //             })
    //         }
    //     })
    //     .catch(err => {
    //         return res.status(500).json({
    //             success: false,
    //             message: err
    //         })
    //     })