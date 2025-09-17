const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // your books object
const regd_users = express.Router();
const secretKey = "fingerprint_customer";

// In-memory users array
let users = [];

// ---------------------- Helper Functions ----------------------

// Check if username is already taken
const isValid = (username) => {
    const userExists = users.find(user => user.username === username);
    return !!userExists; // true if exists, false if not
};

// Authenticate user credentials
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// ---------------------- JWT Middleware ----------------------

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded; // decoded contains { username }
        next();
    });
};

// ---------------------- Routes ----------------------

// REGISTER new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists." });
    }

    // Add user to the in-memory array
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// LOGIN registered user
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "Username and password required." });

    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username." });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        return res.status(200).json({
            message: "Login successful!",
            token: token
        });
    } else {
        return res.status(401).json({ message: "Invalid password." });
    }
});

// ADD or MODIFY a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username;

    if (!books[isbn]) return res.status(404).json({ message: "Book not found." });
    if (!review) return res.status(400).json({ message: "Review text is required." });

    if (!books[isbn].reviews) books[isbn].reviews = {};

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review successfully added/updated.",
        reviews: books[isbn].reviews
    });
});
// DELETE a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "You have not added a review for this book." });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Your review has been deleted.",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

