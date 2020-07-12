const express = require('express');
const productsRepo = require('../repo/products');
const productsIdxTemplate = require('../views/products/index');

const router = express.Router();

router.get('/', async (req, res) => {
	const products = await productsRepo.getAll();
	res.send(productsIdxTemplate({ products }));
});

module.exports = router;
