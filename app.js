const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const app = express();

const users = require('./router/user-router');
const products = require('./router/product-router');
const carts = require('./router/cart-router');
const orders = require('./router/order-router')
app.use(express.json());

dotenv.config();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

(async () => {
    const DB_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
    const db = await mongoose.connect(DB_URL);
    if (db.error)
        console.log('ERROR CONNECTING TO DB: ' + db.error);
    else
        console.log('Connected to DB');
})();



app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/cart', carts)
app.use('/api/order', orders)


app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
})