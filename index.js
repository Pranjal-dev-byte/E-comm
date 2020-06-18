const express = require('express');
const bodyParser = require('body-parser');
const userRepo = require('./repo/user');
const cookieSession = require('cookie-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ keys: [ '3233u3j2u3n' ] }));

app.get('/signup', (req, res) => {
	res.send(`
	<div class="">
        <form action="" method="POST">
            <input name="email" type="email" placeholder="Enter Email" id="">
            <input name="pass" type="password" placeholder="Password" id="">
            <input name="confirmPass" type="password" placeholder="Confirm password" id="">
            <button type="submit">Sign Up</button>
        </form>
    </div>
    `);
});

app.post('/signup', async (req, res) => {
	const { email, pass, confirmPass } = req.body;
	const existingUser = await userRepo.getOneBy({ email });
	if (existingUser) {
		return res.send('Email in use');
	}
	if (pass !== confirmPass) {
		return res.send('Please enter matching passwords');
	}
	//Create a user representing a realtime person
	const user = await userRepo.create({ email, password: pass });

	//Attach the user id inside of the users cookie
	req.session.userId = user.id;

	res.send('Account initiated');
});

app.get('/logout', async (req, res) => {
	req.session = null;
	res.send('You are logged out!');
});

app.get('/signin', async (req, res) => {
	res.send(`
	<div class="">
        <form action="" method="POST">
            <input name="email" type="email" placeholder="Enter Email" id="">
            <input name="pass" type="password" placeholder="Password" id="">
            <button type="submit">LOG IN</button>
        </form>
    </div>
	`);
});

app.post('/signin', async (req, res) => {
	const { email, pass } = req.body;
	const user = await userRepo.getOneBy({ email });
	if (!user) {
		return res.send('Invalid email');
	} else if (user.password !== pass) {
		return res.send('Invalid Password!');
	}
	req.session.userId = user.id;
	res.send('Signed in!');
});

app.listen(3000, () => {
	console.log('Listening');
});
