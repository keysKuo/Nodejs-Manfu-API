require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');

// [GET] Food Queue /kitchen/queue
router.get('/queue', async (req, res, next) => {
    return res.render('pages/kitchen/list', {
        layout: 'main',
        template: 'page',
    })
})

module.exports = router;