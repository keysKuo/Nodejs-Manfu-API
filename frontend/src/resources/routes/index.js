const adminRouter = require('./Admin.js')

function router(app) {
    app.use('/admin', adminRouter);
}

module.exports = router;