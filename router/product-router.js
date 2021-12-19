const express = require('express');
const router = express.Router();

const { Taleb_Book, Knuth_Book } = require('./../data/products');

router.get('/:authorName', async (req, res, next) => {
    const authorName = req.params.authorName;
    let Model;
    if (authorName === 'taleb')
        Model = Taleb_Book;
    else if (authorName === 'knuth')
        Model = Knuth_Book;
    let products;
    try {
        products = await Model.find({});
        return res.status(200).json({
            status: 'success',
            data: [
                ...products
            ]
        })
    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }


})

router.get('/:authorName/:id', async (req, res, next) => {
    const authorName = req.params.authorName;
    const id = req.params.id;

    let Model;
    if (authorName === 'taleb')
        Model = Taleb_Book;
    else if (authorName === 'knuth')
        Model = Knuth_Book;

    let product;
    try {
        product = await Model.findById(id);
        return res.status(200).json({
            status: 'success',
            data: {
                product: product
            }
        })

    } catch (err) {
        return res.status(500).json({
            status: 'fail',
            data: {
                message: 'An unknown error occurred'
            }
        })
    }


})


module.exports = router;