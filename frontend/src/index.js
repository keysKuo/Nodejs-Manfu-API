require('dotenv').config();
const PORT = process.env.CLIENT_PORT || 8080;
// const router = require('./resources/routes');
const fetch = require('node-fetch');
const app = require('./config/server').init();
const API_URL = process.env.API_URL;
const router = require('./resources/routes')
router(app);

app.get('/', async (req, res, next) => {
    
    return res.render('pages/admin', {
        layout: 'admin'
    })
    
})

app.get('/get-bill', async (req, res, next) => {
    const { bill_id } = req.query;
    await fetch(API_URL + `admin/get-bill/${bill_id}` , {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    }).then(async result => {
        let data = await result.json();
        return res.json(data)
    })
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})