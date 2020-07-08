const userRepo = require('../../repo/user');
const { checkEmail, checkPass, checkConfirmPass, checkEmailExists, requireValidPassForUser } = require('./validation');
const express = require('express');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post('/signup', [ checkEmail, checkPass, checkConfirmPass ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.send(signupTemplate({ req, errors }));
	}
	const { email, pass } = req.body;
	//Create a user representing a realtime person
	const user = await userRepo.create({ email, password: pass });
	//Attach the user id inside of the users cookie
	req.session.userId = user.id;

	res.send('Account initiated');
});

router.get('/signout', async (req, res) => {
	req.session = null;
	res.send('You are logged out!');
});

router.get('/signin', async (req, res) => {
	res.send(signinTemplate({}));
});

router.post('/signin', [ checkEmailExists, requireValidPassForUser ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.send(signinTemplate({ errors }));
	}
	const { email } = req.body;
	const user = await userRepo.getOneBy({ email });
	req.session.userId = user.id;
	res.send('Signed in!');
});

module.exports = router;
