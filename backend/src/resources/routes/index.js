const apiRouter = require('./API.js')

function router(app) {
    app.use('/api', apiRouter);
}

module.exports = router;