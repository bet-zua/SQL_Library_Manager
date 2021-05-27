var express = require('express');
var router = express.Router();
const Book = require('../models').Book;


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET Home route should redirect to the /books route. */
router.get('/', asyncHandler(async (req, res, next) => {
  res.redirect('/books');
}));

/* Show full list of books. */
router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll();
  res.render("index", { books });
}));

/* Create a new book form. */
router.get('/books/new', (req, res) => {
  res.render("new-book", {});
});

/* POST new book to the database. */
router.post('/books/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

/* Show book in detail form. */
router.get("/books/:id", asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  //404 Error Handling
  if(book) {
    res.render('update-book', { book });
  } else {
    const err = new Error();
    err.status = 404;
    next(err);
  }
}));

/* Update a book. */
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book){
      res.redirect("/books"); 
    }else{
      const err = new Error();
      err.status = 404;
      next(err); 
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      res.render("update-book", { book, errors: error.errors})
    } else {
      throw error;
    }
  }
}));

/* Delete individual book. */
router.post('/books/:id/delete', asyncHandler(async (req ,res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Looks like the book you requested doesn't exist in our library."
    next(err); 
  }
}));

module.exports = router;
