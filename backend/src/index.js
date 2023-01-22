require('dotenv').config();
const PORT = process.env.PORT || 8080;
const router = require('./resources/routes');

const app = require('./config/server').init();

router(app);

app.get('/', (req, res, next) => {
    return res.sendStatus(200);
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})