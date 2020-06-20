const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UserRepo {
	constructor(filename) {
		this.filename = filename;
		if (!filename) {
			throw new Error('No such file exists');
		}
		try {
			fs.accessSync(this.filename);
		} catch (err) {
			fs.writeFileSync(this.filename, '[]');
		}
	}
	async getAll() {
		return JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf8' }));
	}
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
	async write(records) {
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}
	randomId() {
		return crypto.randomBytes(4).toString('hex');
	}
	async getOne(id) {
		const records = await this.getAll();
		return records.find((record) => record.id === id);
	}
	async delete(id) {
		const records = await this.getAll();
		const remainingRecords = records.filter((record) => record.id !== id);
		await this.write(remainingRecords);
	}
	async update(id, attr) {
		const records = await this.getAll();
		const record = records.find((record) => record.id === id);
		if (!record) {
			throw new Error(`Record with id ${id} not found`);
		}
		Object.assign(record, attr);
		await this.write(records);
	}
	async getOneBy(filters) {
		const records = await this.getAll();
		for (let record of records) {
			let flag = true;
			for (let key in filters) {
				if (record[key] !== filters[key]) {
					flag = false;
				}
			}
			if (flag) {
				return record;
			}
		}
	}
}
const test = async () => {
	const repo = new UserRepo('users.json');
	const user = await repo.getOneBy({ email: 'abcd@ef.com' });
	// console.log(user);
};
test();

module.exports = new UserRepo('users.json');
