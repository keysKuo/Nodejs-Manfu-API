const router = require('express').Router();
const db = require("../../config/db/database");
const { queryString } = require('../middlewares');
const { uuid } = require('uuidv4');
const { query } = require('express');


// router.get('/get-orders', async (req, res, next) => {
//     await 
// })

module.exports = router