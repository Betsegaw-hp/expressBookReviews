const express = require('express');
let books = require("./booksdb.js");
const jwt = require('jsonwebtoken');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    //Write your code here
    const { username, password} = req.body;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});

            let accessToken = jwt.sign({
                data: password
            }, 'access', { expiresIn: 60 * 60 });

            // Store access token and username in session
            req.session.authorization = {
                accessToken, username
            }

            return res.status(200).json({message: "Customer successfully registered. now login"});
        } else {
            return res.status(404).json({message: "Customer already exists!"});
        }
    }

    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const ISBN = req.params.isbn;
  return res.status(300).json({ISBN, ...books[ISBN]});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;

  const book = Object.values(books).filter(book => book.author === author)
  if(book.length <= 0) return res.status(404).json({msg: "book not found with author "+author})
  
  res.status(200).json({booksByAuthor: book});
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const title = req.params.title;

  const book = Object.values(books).filter(book => book.title === title)
  if(book.length <= 0) return res.status(404).json({msg: "book not found with title "+title})
  
  res.status(200).json({booksByTitle: book});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  const book = books[isbn].reviews;

  return res.status(300).json(book);
});

module.exports.general = public_users;
