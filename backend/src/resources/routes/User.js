const router = require('express').Router();

router.get('/', (req, res, next) => {
    return res.json({result: 'pass'});
})

router.get('/getUser/:id', (req, res, next) => {
    const { id } = req.params;
    return res.json({id, user: 'Kuo Nhan Dung'})
})

module.exports = router;