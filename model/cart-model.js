const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
	user_id: {
		type: String,
		required: true,
	},
	items: [
		{
			product_id: {
				type: String,
				required: true,
			},
			thumbnail: {
				type: String,
				required: true,
			},
			title: {
				type: String,
				required: true,
			},
			author: {
				type: String,
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
			price: {
				type: Number,
				required: true,
			},
			totalPrice: {
				type: Number,
				required: true,
			},
		},
	],
	price: {
		type: Number,
	},
	quantity: {
		type: Number,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
	},
});

module.exports = mongoose.model("Cart", cartSchema);
