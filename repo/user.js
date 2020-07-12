const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UserRepo extends Repository {
	async create(attr) {
		// {email:'',password:''}
		attr.id = this.randomId();

		const salt = crypto.randomBytes(8).toString('hex');
		const buf = await scrypt(attr.password, salt, 32);

		const records = await this.getAll();
		const record = {
			...attr,
			password: `${buf.toString('hex')}.${salt}`
		};
		records.push(record);
		await this.write(records);
		return record;
		// Write all the updated records "array" back to json format
	}
	async comparePass(saved, supplied) {
		//Saved->Password in our database.
		//supplied-> Password supplied by the user
		const [ hashed, salt ] = saved.split('.');
		const bufSupplied = await scrypt(supplied, salt, 32);
		return hashed === bufSupplied.toString('hex');
	}
}

module.exports = new UserRepo('users.json');
