const express = require('express');

const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const userRepo = require('../../repo/user');
const { checkEmail, checkPass, checkConfirmPass, checkEmailExists, requireValidPassForUser } = require('./validatiors');
const { handleErrors } = require('./middlewares');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post('/signup', [ checkEmail, checkPass, checkConfirmPass ], handleErrors(signupTemplate), async (req, res) => {
	const { email, pass } = req.body;
	//Create a user representing a realtime person
	const user = await userRepo.create({ email, password: pass });
	//Attach the user id inside of the users cookie
	req.session.userId = user.id;

	res.redirect('/admin/products');
});

router.get('/signout', async (req, res) => {
	req.session = null;
	res.send('You are logged out!');
});

router.get('/signin', async (req, res) => {
	res.send(signinTemplate({}));
});

router.post(
	'/signin',
	[ checkEmailExists, requireValidPassForUser ],
	handleErrors(signinTemplate),
	async (req, res) => {
		const { email } = req.body;
		const user = await userRepo.getOneBy({ email });
		req.session.userId = user.id;
		res.redirect('/admin/products');
	}
);

module.exports = router;
