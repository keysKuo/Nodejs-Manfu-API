const adminRouter = require('./Admin.js')
const kitchenRouter = require('./Kitchen.js');
const clientRouter = require('./Client');
function router(app) {
    app.use('/admin', adminRouter);
    app.use('/kitchen', kitchenRouter);
    app.use('/client', clientRouter);
}

module.exports = router;