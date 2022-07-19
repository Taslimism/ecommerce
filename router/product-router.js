const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { Taleb_Book, Knuth_Book } = require("./../data/products");
const User = require("./../model/user-model");
const authorize = require("./../auth/authorize");

router.get("/:authorName", async (req, res, next) => {
	const authorName = req.params.authorName;
	let Model;
	if (authorName === "taleb") Model = Taleb_Book;
	else if (authorName === "knuth") Model = Knuth_Book;
	let products;
	try {
		products = await Model.find({});
		return res.status(200).json({
			status: "success",
			data: [...products],
		});
	} catch (err) {
		return res.status(500).json({
			status: "fail",
			data: {
				message: "An unknown error occurred",
			},
		});
	}
});

router.get("/get/allbooks/allkind", async (req, res, next) => {
	const { count, page } = req.query;
	console.log(count, page);
	try {
		products = await Knuth_Book.find({})
			.skip(count * page)
			.limit(count);
		return res.status(200).json({
			status: "success",
			data: [...products],
		});
	} catch (err) {
		return res.status(500).json({
			status: "fail",
			data: {
				message: "An unknown error occurred",
			},
		});
	}
});

router.get("/:authorName/:id", async (req, res, next) => {
	const authorName = req.params.authorName;
	const id = req.params.id;

	// console.log(authorName);

	if (authorName === "authorName") {
		let product = await Taleb_Book.findById(id);
		if (!product) {
			product = await Knuth_Book.findById(id);
		}
		// console.log(product);
		return res.status(200).json({
			status: "success",
			data: {
				thumbnail: product.thumbnail,
				title: product.title,
				author: product.author,
				price: product.price,
				quantity: 1,
				totalPrice: product.price,
			},
		});
	}

	let Model;
	if (authorName === "taleb") Model = Taleb_Book;
	else if (authorName === "knuth") Model = Knuth_Book;

	let product;
	try {
		product = await Model.findById(id);
		return res.status(200).json({
			status: "success",
			data: {
				product: product,
			},
		});
	} catch (err) {
		return res.status(500).json({
			status: "fail",
			data: {
				message: "An unknown error occurred",
			},
		});
	}
});

const REVIEW_RATING = {};
router.post("/review/:authorName/:productId", authorize, async (req, res) => {
	const pid = mongoose.Types.ObjectId(req.params.productId);
	const authorName = req.params.authorName;
	const uid = req.body.user_id;

	let Model;
	if (authorName === "taleb") Model = Taleb_Book;
	else if (authorName === "knuth") Model = Knuth_Book;

	let name = "";
	let userId;
	try {
		const user = await User.find({ _id: uid });
		const userID = await User.find().select("_id");
		userId = userID.map((user) => {
			return user._id.toString();
		});
		name = user[0].name;
	} catch (err) {
		return res.status(500).json({
			status: "fail",
			data: {
				message: "An unknown error occurred",
			},
		});
	}

	const review = req.body.review;
	const rating = req.body.rating;
	REVIEW_RATING[uid] = {
		name: name,
		review: review,
		rating: rating,
		time: Date.now(),
	};

	try {
		let book = await Model.findByIdAndUpdate(
			pid,
			{ reviews: REVIEW_RATING },
			{ new: true }
		);

		const REVIEWS = [];

		userId.forEach((id) => {
			if (book.reviews[0][id.toString()])
				REVIEWS.push(book.reviews[0][id.toString()]);
		});

		res.status(200).json({
			status: "success",
			data: [...REVIEWS],
		});
	} catch (err) {
		console.log(err);
	}
});

router.get("/review/:authorName/:productId", async (req, res, next) => {
	const pid = mongoose.Types.ObjectId(req.params.productId);
	const authorName = req.params.authorName;
	const uid = req.body.user_id;

	let Model;
	if (authorName === "taleb") Model = Taleb_Book;
	else if (authorName === "knuth") Model = Knuth_Book;

	let userId;
	try {
		const userID = await User.find().select("_id");
		userId = userID.map((id) => id._id.toString());
	} catch (err) {
		console.log(err);
	}

	let reviewsFromDB;
	try {
		reviewsFromDB = await Model.find({ _id: pid }).select("reviews");
		const REVIEWS = [];
		if (reviewsFromDB[0].reviews[0]) {
			userId.forEach((id) => {
				if (reviewsFromDB[0].reviews[0][id.toString()])
					REVIEWS.push(reviewsFromDB[0].reviews[0][id.toString()]);
			});
		}

		res.status(200).json([...REVIEWS]);
	} catch (err) {
		return res.status(500).json({
			status: "fail",
			data: {
				message: "An unknown error occurred",
			},
		});
	}
});

module.exports = router;
