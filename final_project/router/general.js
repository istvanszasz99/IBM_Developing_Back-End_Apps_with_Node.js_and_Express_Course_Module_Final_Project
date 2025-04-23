const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Promise-based function to get all books
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve(books);
        } catch (error) {
            reject(error);
        }
    });
};

// Route using the Promise
public_users.get('/', function (req, res) {
    getAllBooks()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(500).json({ message: "Error fetching books", error: error.message }));
});

// Get book details based on ISBN using Promise
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found"));
        }
    });
};

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Get book details based on author using Promise
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error("No books found by this author"));
        }
    });
};

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then(filteredBooks => res.status(200).json(filteredBooks))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Get all books based on title using Promise
const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject(new Error("No books found with this title"));
        }
    });
};

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then(filteredBooks => res.status(200).json(filteredBooks))
        .catch(error => res.status(404).json({ message: error.message }));
});

// Get book review using Promise
const getBookReview = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book.reviews);
        } else {
            reject(new Error("Book not found"));
        }
    });
};

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookReview(isbn)
        .then(reviews => res.status(200).json(reviews))
        .catch(error => res.status(404).json({ message: error.message }));
});

module.exports.general = public_users;
