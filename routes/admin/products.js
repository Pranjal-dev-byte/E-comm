const express = require('express');
const multer = require('multer');

const productsRepo = require('../../repo/products');
const productEditTemplate = require('../../views/admin/products/edit');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIdxTemplate = require('../../views/admin/products/index');
const { requirePrice, requireTitle } = require('./validatiors');
const { handleErrors, requireAuth } = require('./middlewares');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/admin/products', requireAuth, async (req, res) => {
	const products = await productsRepo.getAll();
	res.send(productsIdxTemplate({ products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
	res.send(productsNewTemplate({}));
});

router.post(
	'/admin/products/new',
	upload.single('image'),
	[ requireTitle, requirePrice ],
	handleErrors(productsNewTemplate),
	async (req, res) => {
		const image = req.file.buffer.toString('base64');
		const { title, price } = req.body;
		await productsRepo.create({ title, price, image });
		res.redirect('/admin/products');
	}
);

router.get('/admin/products/edit/:id', requireAuth, async (req, res) => {
	const product = await productsRepo.getOne(req.params.id);
	if (!product) {
		return res.send('Product not found!');
	}
	res.send(productEditTemplate({ product }));
});

router.post(
	'/admin/products/edit/:id',
	upload.single('image'),
	[ requireTitle, requirePrice ],
	handleErrors(productEditTemplate, async (req) => {
		const product = await productsRepo.getOne(req.params.id);
		return { product };
	}),
	async (req, res) => {
		const changes = req.body;
		if (req.file) {
			changes.file = req.file.buffer.toString('base64');
		}
		try {
			await productsRepo.update(req.params.id, changes);
		} catch (err) {
			console.log(err);
		}
		res.redirect('/admin/products');
	}
);

router.post('/admin/products/:id/delete', async (req, res) => {
	await productsRepo.delete(req.params.id);
	res.redirect('/admin/products');
});

module.exports = router;
