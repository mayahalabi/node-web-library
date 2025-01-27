// Importing necessary services and modules for handling book-related operations
const bookService = require("../services/bookService");
const commentService = require("../services/commentService");
const authorService = require("../services/authorService");
const userService = require("../services/userService");
const genreService = require('../services/genreService')
const notifier = require("node-notifier");
const path = require("path");

// BookController class manages the CRUD operations for books
class BookController {

  /**
   * Fetches and displays all books.
   * 
   * This method retrieves all the books using the book service and renders a page with the book list.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'books' page with a list of books
   */
  async getAllBooks(req, res) {
    try {
      // Fetch all books from the book service
      const books = await bookService.getAllBooks();

      const role = "admin"; // Set the role

      // Render the 'books' page, passing the list of books and user role
      res.render("books", {
        books: books,
        role: role, // Pass the role directly here
      });

    } catch (error) {
      // Respond with an internal server error if something goes wrong
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Fetches and displays all books for an admin.
   * 
   * Similar to `getAllBooks` but includes additional admin-specific details like username.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'books' page with admin data
   */
  async getAllBooksADMIN(req, res) {
    try {
      // Fetch all books from the book service
      const books = await bookService.getAllBooksADMIN();

      const role = "admin"; // Set to 'admin'
      const username = "maya5";

      // Render the 'books' page with admin-specific data
      res.render("books", {
        books: books,
        role: role,
        username: username,
      });

    } catch (error) {
      // Respond with an internal server error if something goes wrong
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Fetches and displays the details of a single book.
   * 
   * This method retrieves the book information along with comments and borrow status for a specific book.
   * 
   * @param {Object} req - The request object containing the book ID
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'bookInfo' page with book details, comments, and borrow status
   */
  async getBookById(req, res) {
    try {
      const book_id = parseInt(req.params.book_id, 10); // Get the book ID from the URL params
      const username = req.query.username;
      const book = await bookService.getBookById(book_id); // Fetch the book
      let comments = await commentService.getCommentByBookId(book_id); // Fetch comments
      const isBorrowed = await bookService.checkIfBookIsBorrowed(
        username,
        book_id
      );

      // Ensure comments is always an array, even if none are found
      if (!comments) {
        comments = [];
      }

      const password = await userService.getPassword(username);

      // Render the book details page with comments and borrow status
      res.render("bookInfo", {
        book: book,
        password: password,
        comments: comments,
        username: username,
        isBorrowed: isBorrowed,
      });

    } catch (error) {
      // Respond with an internal server error if something goes wrong
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
   * Updates the details of a book.
   * 
   * This method handles the book update functionality, including handling image uploads for book covers.
   * 
   * @param {Object} req - The request object containing the updated book data
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Responds with a success or error message
   */
  async updateBook(req, res) {
    try {
      const bookData = {
        title: req.body.title,
        isbn: req.body.isbn,
        publisher: req.body.publisher,
        published_year: req.body.published_year,
        status: req.body.status,
        description: req.body.description,
        author_id: req.body.author_id,
        image_data: req.file ? { imageBuffer: req.file.buffer, fileType: req.file.mimetype } : null, // Handle image upload
        quantity: req.body.quantity,
        rate: req.body.rate,
      };

      const success = await bookService.updateBook(req.params.id, bookData);

      // Return appropriate response based on the success of the operation
      if (success) {
        res.status(200).json({ message: 'Book updated successfully!' });
      } else {
        res.status(400).json({ message: 'Failed to update book.' });
      }
    } catch (error) {
      // Respond with an internal server error if something goes wrong
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Creates a new book.
   * 
   * This method handles the creation of a new book, including image upload and book data processing.
   * 
   * @param {Object} req - The request object containing the new book data
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Responds with a success message and the created book
   */
  async createBook(req, res) {
    try {
      if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });

      const bookData = {
        title: req.body.title,
        isbn: req.body.isbn,
        publisher: req.body.publisher,
        published_year: req.body.published_year,
        status: req.body.status,
        description: req.body.description,
        author_id: req.body.author_id,
        image_data: { imageBuffer: req.file.buffer, fileType: req.file.mimetype },
        quantity: req.body.quantity,
        rate: req.body.rate,
      };

      const newBook = await bookService.createBook(bookData);
      res.status(201).json({ message: 'Book created successfully', book: newBook });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Deletes a book by its ID.
   * 
   * This method handles the deletion of a book from the database by its ID.
   * 
   * @param {Object} req - The request object containing the book ID to delete
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Responds with a success message or error
   */
  async deleteBook(req, res) {
    try {
      // Parse the book ID
      const id = parseInt(req.params.id, 10);

      // Attempt to delete the book using the book service
      const success = await bookService.deleteBook(id);

      // If the book is not found respond with a 404 or 400 error
      if (!success) {
        return res.status(400).json({ message: "Book not found." });
      }

      // Show a success notification
      notifier.notify({
        title: 'Book Management',
        message: 'Book deleted successfully',
        icon: path.join(__dirname, 'path/to/success-icon.png'), // Optional
        sound: true, // Optional
        // wait: true // Optional
      });

      // Redirect to the authors list page after updating
      return res.redirect('/api/books/adminManagement');
    } catch (error) {
      // Handle unexpected errors
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  /**
  * Asynchronously searches for books based on a search term provided in the query string.
  * 
  * This function handles the search functionality for books. It retrieves the search term from 
  * the query parameters, calls the `searchBook` service method to query the database, and then 
  * returns the search results to the user. If no books are found, it returns a 404 status with 
  * an appropriate message. In case of any errors during the process, a 500 status is returned.
  * 
  * The search term can match any of the following:
  * - Book title
  * - Author first name
  * - Author last name
  * - Genre
  * - Published year
  * - Publisher
  *
  * @param {Object} req - The request object, which contains the query parameters (search term).
  * @param {Object} res - The response object used to send back the results or errors to the client.
  * 
  * @returns {Promise<void>} This function does not return any value directly. It renders a view or 
  *                          sends a JSON response based on the outcome.
  * 
  * @throws {Error} Throws an error if there is a failure during the book search or rendering process.
  */
  async searchBook(req, res) {
    try {
      const searchItem = req.query.searchItem; // Capture the search keyword from the query parameters

      const books = await bookService.searchBook(searchItem); // Call searchBook in bookService

      if (!books.length) {
        return res.status(404).json({ message: 'Books not found' }); // Return 404 if no books match the search
      }
      const username = 'maya1';
      const role = 'user';
      res.render('books', { books: books, username: username, role: role });
    } catch (e) {
      console.error('Error searching books:', e); // Log the error
      res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
    }
  }

  /**
   * Handles the borrowing of a book.
   * 
   * This method handles the process of borrowing a book, including checking borrow status and notifications.
   * 
   * @param {Object} req - The request object containing the book ID and username
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the book details with the updated borrow status
   */
  async borrowBook(req, res) {
    const { book_id, username } = req.body;
    try {
      // Call the service layer to perform the borrow
      const results = await bookService.borrowBook(username, book_id);

      if (results) {
        const book = await bookService.getBookById(book_id); // Fetch the book details

        let comments = await commentService.getCommentByBookId(book_id);

        // Ensure comments is always an array (even if no comments)
        if (!comments) {
          comments = [];
        }

        notifier.notify({
          title: "BORROWING",
          message: "Book was borrowed successfully",
        });

        const password = await userService.getPassword(username);
        res.render("bookInfo", {
          book: book,
          password: password,
          comments: comments,
          username: username,
          isBorrowed: true,
        });
      }
    } catch (error) {
      // Handle errors
      if (error.message.includes("Book doesnt exist.")) {
        return res.status(409).json({ message: error.message });
      } else if (error.message.includes("User doesnt exist.")) {
        return res.status(404).json({ message: error.message });
      } else if (error.message.includes("Book is already borrowed by this user")) {
        notifier.notify({
          title: "BORROWING",
          message: "Book is already borrowed by this user",
          icon: path.join(__dirname, "path/to/success-icon.png"), // Fixed the typo
          sound: true,
        });
        return res.status(400).json({ message: error.message });
      }
      // General error handling
      console.error("Error during borrowing book:", error.message, error.stack);
      res
        .status(500)
        .json({ error: "An error occurred while borrowing a book." });
    }
  }

  /**
   * Handles the returning of a borrowed book.
   * 
   * This method processes the return of a borrowed book and updates its status.
   * 
   * @param {Object} req - The request object containing the book ID and username
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the book details with the updated return status
   */
  async returnBook(req, res) {
    const { username, book_id } = req.body;

    try {
      const result = await bookService.returnBook(username, book_id);

      if (result) {
        const book = await bookService.getBookById(book_id); // Fetch the book details
        let comments = await commentService.getCommentByBookId(book_id);
        const isBorrowed = await bookService.checkIfBookIsBorrowed(
          username,
          book_id
        );

        if (!comments) {
          comments = [];
        }

        notifier.notify({
          title: "RETURNING",
          message: "Book was returned successfully",
        });

        const password = await userService.getPassword(username);
        res.render("bookInfo", {
          book: book,
          password: password,
          comments: comments,
          username: username,
          isBorrowed: false,
        });
      }
    } catch (error) {
      if (
        error.message.includes(
          "No active borrowing record found for this user and book."
        )
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Unexpected error during book return:", error);
        res.status(500).json({
          error: "An unexpected error occurred while returning the book.",
        });
      }
    }
  }

  /**
   * Displays the details of a book by its ID.
   * 
   * This method fetches a book by its ID and renders the details page for the book, passing
   * the relevant data such as book details, user role, and username to the view.
   * 
   * @param {Object} req - The request object containing the book ID in the URL parameter
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'bookDetails' page with book details and user information
   */
  async detailsForm(req, res) {
    try {

      const book_id = parseInt(req.params.book_id, 10);
      const books = await bookService.getBookById(book_id);

      const role = 'admin';
      const username = 'maya5';

      res.render("bookDetails", {
        books: books,
        role: role,
        username: username
      });
    } catch (error) {
      console.error("Error fetching book details:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Displays the form to add a new book.
   * 
   * This method fetches all authors from the database and renders the 'addBook' form
   * with the list of authors so the user can select one when adding a new book.
   * 
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'addBook' page with a list of authors
   */
  async addForm(req, res) {
    try {
      const authors = await authorService.getAllAuthors();

      res.render("addBook", { authors: authors });
    } catch (error) {
      console.error("Error fetching authors:", error);
      res.status(500).send("Error fetching authors");
    }
  }

  /**
   * Displays the details of a book for users.
   * 
   * This method fetches a book's details and any comments associated with it, then renders
   * the book's information page. It’s a public or user-facing version of the book details page.
   * 
   * @param {Object} req - The request object containing the book ID in the URL parameter
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'bookInfo' page with book details and comments
   */
  async detailsUsersForm(req, res) {
    const book_id = parseInt(req.params.book_id, 10); // Get the book ID from the URL params
    const book = await bookService.getBookById(book_id); // Fetch the book details
    let comments = await commentService.getCommentByBookId(book_id);

    // Ensure comments is always an array (even if no comments)
    if (!comments) {
      comments = [];
    }

    // Render the book details page, passing the book data and comments
    res.render("bookInfo", { book: book, comments: comments });
  }

  // Controller function to check if the book is borrowed by the user
  // In bookController.js
  async checkIfBookIsBorrowed(req, res) {
    const { username, book_id } = req.body;

    try {
      // Call the service to check if the book is borrowed
      const isBorrowed = await bookService.checkIfBookIsBorrowed(
        username,
        book_id
      );

      const book = await bookService.getBookById(book_id);

      // Render the book info page with the necessary data
      res.render("bookInfo", {
        book: book, // assuming book info is populated in req.book
        password: password,
        username: username,
        isBorrowed: isBorrowed, // Pass the borrow status to the view
      });
    } catch (error) {
      console.error("Error checking borrow status:", error);
      res
        .status(500)
        .json({ error: "An error occurred while checking borrow status." });
    }
  }

  /**
   * Displays the form for editing book details.
   * 
   * This method renders the form to edit a specific book's details based on its ID.
   * 
   * @param {Object} req - The request object containing the book ID
   * @param {Object} res - The response object
   * 
   * @returns {Promise<void>} Renders the 'editBook' form with book data
   */
  async editForm(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const book = await bookService.getBookById(id);

      res.render('editBook', { book: book });
    } catch (error) {
      console.error('Error deleting author:', error);
      res.status(500).json({ message: 'Internal Service error' });
    }
  }
}

module.exports = new BookController();
