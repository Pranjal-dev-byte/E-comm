const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ keys: [ '3233u3j2u3n' ] }));

app.use(authRouter);
app.use(adminProductsRouter);
app.use(productsRouter);
app.use(cartsRouter);
app.use((req, res) => {
	res.status('404').send('Webpage not available! :\\');
});

app.listen(3000, () => {
	console.log('Listening...');
});
