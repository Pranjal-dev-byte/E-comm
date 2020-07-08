const userRepo = require('../../repo/user');
const { body } = require('express-validator');

module.exports = {
	checkEmail: body('email')
		.trim()
		.normalizeEmail()
		.isEmail()
		.withMessage('Email is not valid')
		.custom(async (email) => {
			existingUser = await userRepo.getOneBy({ email });
			if (existingUser) {
				throw new Error('Email already in use');
			}
		}),
	checkPass: body('pass')
		.trim()
		.isLength({ min: 4, max: 20 })
		.withMessage('Password must be min. 4 and max. 20 in length '),
	checkConfirmPass: body('confirmPass').trim().custom(async (confirmPass, { req }) => {
		if (confirmPass !== req.body.pass) {
			throw new Error('Passwords must match');
		} else {
			return true;
		}
	}),
	checkEmailExists: body('email')
		.trim()
		.normalizeEmail()
		.isEmail()
		.withMessage('Please enter a valid email!')
		.custom(async (email) => {
			const user = await userRepo.getOneBy({ email });
			if (!user) {
				throw new Error("Email doesn't exisits!");
			}
		}),
	requireValidPassForUser: body('pass').trim().custom(async (pass, { req }) => {
		const user = await userRepo.getOneBy({ email: req.body.email });
		if (!user) {
			throw new Error('Invalid password!');
		}
		const validPass = await userRepo.comparePass(user.password, pass);
		if (!validPass) {
			throw new Error('Invalid password!');
		}
	})
};
