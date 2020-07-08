const express = require('express');
const bodyParser = require('body-parser');
const authRouter = require('./routes/admin/auth');
const cookieSession = require('cookie-session');

const app = express();
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ keys: [ '3233u3j2u3n' ] }));

app.use(authRouter);

app.listen(3000, () => {
	console.log('Listening');
});
