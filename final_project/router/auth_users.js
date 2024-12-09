const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
     // Filter the users array for any user with the same username
     let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    //Write your code here
    const { username, password} = req.body;

    // Check if username or password is missing
    if (!username || !password) 
    return res.status(404).json({ message: "Error logging in" });

    if(authenticatedUser(username,password) ) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({message: "Invalid Login. Check username and password"});
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  const book = books[isbn];
  console.log(isbn)
  if(!book) return res.status(404).json({msg: "no book with given isbn "+isbn});

  const username = req.session.authorization.username;
  let filtered_review = book.reviews[username];

  if(filtered_review){
    // modify review

    if(review) filtered_review.review = review
    book.reviews[username] = filtered_review;

  } else {
    // add review
    book.reviews[username] = review;
  }

  return res.status(200).json({message: "The review for a book with ISBN "+ isbn+ " has been add/updated."});
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;

  const book = books[isbn];
  if(!book) return res.status(404).json({msg: "no book with given isbn "+isbn});

  const username = req.session.authorization.username;

  if(book.reviews[username]){

    delete book.reviews[username]
  } 

  return res.status(200).json({message: "The review for a book with ISBN "+ isbn+ " has been deleted. by user "+ username});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
