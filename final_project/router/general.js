const express = require('express');
const axios = require('axios');
const public_users = express.Router();

const PORT = 5000; // same port as your server
const BASE_URL = `http://localhost:${PORT}`;

// ------------------- Task 10: Get all books -------------------
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        res.status(200).json(response.data); // send JSON response
    } catch (err) {
        res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// ------------------- Task 11: Get book by ISBN -------------------
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
    }
});

// ------------------- Task 12: Get books by Author -------------------
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
});

// ------------------- Task 13: Get books by Title -------------------
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`${BASE_URL}/title/${title}`);
        res.status(200).json(response.data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching books by title", error: err.message });
    }
});

module.exports.general = public_users;
