const express = require('express');

const cartsRepo = require('../repo/carts');
const productsRepo = require('../repo/products');
const cartsShowTemplate = require('../views/carts/show');

const router = express.Router();

// Recieve a POST request for the product submission
router.post('/cart/products', async (req, res) => {
	// Figure out the cart!
	let cart;
	if (!req.session.cartId) {
		cart = await cartsRepo.create({ items: [] });
		req.session.cartId = cart.id;
	} else {
		cart = await cartsRepo.getOne(req.session.cartId);
	}
	const existingItem = cart.items.find((item) => item.id === req.body.productId);
	if (existingItem) {
		// increment the quantity by one and save cart
		existingItem.quantity++;
	} else {
		// Add the product id to items array
		cart.items.push({ id: req.body.productId, quantity: 1 });
	}
	await cartsRepo.update(cart.id, {
		items: cart.items
	});
	res.redirect('/cart');
});

// Recieve a GET request for the carts route
router.get('/cart', async (req, res) => {
	if (!req.session.cartId) {
		return res.redirect('/');
	}
	const cart = await cartsRepo.getOne(req.session.cartId);
	for (let item of cart.items) {
		const product = await productsRepo.getOne(item.id);
		item.product = product;
	}
	res.send(cartsShowTemplate({ items: cart.items }));
});

// Recieve a DELETE request for removing product
router.post('/cart/item/delete/:id', async (req, res) => {
	const itemId = req.params.id;
	const cart = await cartsRepo.getOne(req.session.cartId);
	const items = cart.items.filter((item) => item.id !== itemId);
	await cartsRepo.update(req.session.cartId, { items });
	res.redirect('/cart');
});

module.exports = router;
