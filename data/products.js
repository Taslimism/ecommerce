const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

// (async () => {
//     const DB_URL = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
//     const db = await mongoose.connect(DB_URL);
//     if (db.error)
//         console.log('ERROR CONNECTING TO DB: ' + db.error);
//     else
//         console.log('Connected to DB');
// })();

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true
    },
    publishedDate: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currencyCode: {
        type: String,
        required: true
    },
    textSnippet: {
        type: String,
        required: true
    },
    totalRating: {
        type: Number
    },
    rating: [],
    reviews: []
})

const Taleb_Book = mongoose.model('Taleb_Book', bookSchema);
const Knuth_Book = mongoose.model('Knuth_Book', bookSchema);

const updateTalebBooksInDB = async () => {
    const GOOGLE_BOOK_API_URL = process.env.GOOGLE_BOOK_API_URL.replace('<QUERYSTRING>', 'inauthor:donald%20knuth') + process.env.GOOGLE_API_KEY;

    const { data } = await axios.get(GOOGLE_BOOK_API_URL);

    const BOOKS = data.items.map(book => {
        return {
            title: book.volumeInfo.title,
            subtitle: book.volumeInfo.subtitle,
            author: book.volumeInfo.authors[0],
            thumbnail: book.volumeInfo.imageLinks.thumbnail,
            publishedDate: book.volumeInfo.publishedDate,
            description: book.volumeInfo.description,
            price: (book.saleInfo.listPrice && book.saleInfo.listPrice.amount) || 500,
            currencyCode: (book.saleInfo && book.saleInfo.currencyCode) || 'INR',
            textSnippet: book.searchInfo.textSnippet
        };
    });

    BOOKS.forEach((book) => {
        const books = new Knuth_Book(book);
        books.save().then(data => { console.log('saved' + data) }).catch(err => { console.log(err) });

    })

}


module.exports.Knuth_Book = Knuth_Book;
module.exports.Taleb_Book = Taleb_Book;