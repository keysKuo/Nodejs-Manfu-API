const router = require('express').Router();
const userRouter = require('./User');
const productRouter = require('./Product');
const adminRouter = require('./Admin');
const tableRouter = require("./Table");

router.use('/users', userRouter);
// api/products/
router.use('/products', productRouter);
router.use('/admin', adminRouter);
router.use("/tables", tableRouter);

module.exports = router;
