const router = require('express').Router();
const userRouter = require('./User');
const productRouter = require('./Product');
const adminRouter = require('./Admin');
const tableRouter = require("./Table");
const orderRouter = require('./Order');


router.use('/users', userRouter);
router.use('/admin', adminRouter);
// api/products/
router.use('/products', productRouter);
// api/tables/
router.use("/tables", tableRouter);
// api/orders/
router.use('/orders', orderRouter);


module.exports = router;
