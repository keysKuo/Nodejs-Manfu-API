require('dotenv').config();
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fileapis = require('../middlewares/fileapis');
const API_URL = process.env.API_URL;
const { upload } = require('../middlewares/multer');

router.get('/menu', async (req, res, next) => {
    return res.render('pages/clients/menu', {
        layout: 'main'
    })
})

module.exports = router;