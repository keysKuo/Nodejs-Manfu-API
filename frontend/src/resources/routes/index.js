const adminRouter = require('./Admin.js')
const kitchenRouter = require('./Kitchen.js');

function router(app) {
    app.use('/admin', adminRouter);
    app.use('/kitchen', kitchenRouter);
}

module.exports = router;