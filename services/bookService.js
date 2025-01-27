// Importing the database initialization function
const { initDB } = require("../config/database");

// Importing the Book model for interacting with book data
const Book = require("../modules/bookModule");

// Importing the Notification service for interacting with notification data
const notificationService = require("../services/notificationService");

// Importing the User service for user-related operations
const userService = require("../services/userService");

// Importing the Transaction service for managing transactions
const transactionService = require("../services/transactionService");

// Importing the Image service for handling image uploads
const imageService = require("./imageService");

class BookService {

  // Constructor initializes the database connection pool
  constructor() {
    this.pool = null; // Database connection pool
    this.init(); //  Initialize database connection
  }

  /**
     * Initializes the database connection pool.
     * This method is called when the AuthorService is instantiated.
     */
  async init() {
    // Initialize the database connection pool
    this.pool = await initDB();
  }

  /**
   * Fetches all books along with genres, authors, and images.
   * 
   * @returns {Array} A list of all books mapped to Book model instances.
   */
  async getAllBooks() {
    // Query the database to get all books
    const [rows] = await this.pool.query(`SELECT 
        b.book_id,
        GROUP_CONCAT(g.type) AS genres,  -- Concatenate all genres for the book
        b.author_id,
        a.first_name,
        a.last_name,
        i.image_id,
        b.isbn,
        b.title,
        b.publisher,
        b.published_year,
        b.status,
        b.quantity,
        b.rate,
        b.description,
        i.image_data
    FROM 
        book b
    INNER JOIN 
        images i ON b.image_id = i.image_id
    INNER JOIN 
        bookGenres bg ON b.book_id = bg.book_id
    INNER JOIN 
        genre g ON g.genre_id = bg.genre_id
    INNER JOIN 
        author a ON a.author_id = b.author_id
    GROUP BY 
        b.book_id
       `);

    // Map the rows to Book instances
    return rows.map(Book.fromRow);
  }

  /**
   * Fetches all books for the admin view (similar to `getAllBooks`).
   * 
   * @returns {Array} A list of all books mapped to Book model instances.
   */
  async getAllBooksADMIN() {
    // Similar to getAllBooks, but intended for admin use
    const [rows] = await this.pool.query(`SELECT 
    b.book_id,
    GROUP_CONCAT(g.type) AS genres,  -- Concatenate all genres for the book
    b.author_id,
    a.first_name,
    a.last_name,
    i.image_id,
    b.isbn,
    b.title,
    b.publisher,
    b.published_year,
    b.status,
    b.quantity,
    b.rate,
    b.description,
    i.image_data
FROM 
    book b
INNER JOIN 
    images i ON b.image_id = i.image_id
LEFT JOIN 
    bookGenres bg ON b.book_id = bg.book_id  -- Change to LEFT JOIN to include books without genres
LEFT JOIN 
    genre g ON g.genre_id = bg.genre_id      -- Change to LEFT JOIN to include books without genres
INNER JOIN 
    author a ON a.author_id = b.author_id
GROUP BY 
    b.book_id

       `);

    // Map the rows to Book instances
    return rows.map(Book.fromRow);
  }

  /**
   * Fetches a single book by its ID, including associated genres, authors, and images.
   * 
   * @param {number} book_id - The ID of the book to fetch.
   * @returns {Book|null} The Book instance if found, or null if not found.
   */
  async getBookById(book_id) {
    // Query the database for a book with the specified id
    const [rows] = await this.pool.query(
      `SELECT 
    b.book_id,
    IFNULL(GROUP_CONCAT(g.type), '') AS genres,  -- If no genres, return an empty string instead of NULL
    b.author_id,
    a.first_name,
    a.last_name,
    i.image_id,
    b.isbn,
    b.title,
    b.publisher,
    b.published_year,
    b.status,
    b.quantity,
    b.rate,
    b.description,
    i.image_data
FROM 
    book b
INNER JOIN 
    images i ON b.image_id = i.image_id
LEFT JOIN 
    bookGenres bg ON b.book_id = bg.book_id  -- Change to LEFT JOIN to include books without genres
LEFT JOIN 
    genre g ON g.genre_id = bg.genre_id      -- Change to LEFT JOIN to include books without genres
INNER JOIN 
    author a ON a.author_id = b.author_id 
WHERE 
    b.book_id = ?
       `,
      [book_id]
    );

    // If no book is found, return null
    if (rows.length == 0) return null;

    // Return the Book instance created from the first row
    return Book.fromRow(rows[0]);
  }

  /**
   * Fetches a book based on a specific genre.
   * 
   * @param {number} id - The genre ID.
   * @returns {Book|null} A Book instance or null if no book is found for the genre.
   */
  async getBookByGenre(id) {
    const [rows] = await this.pool.query(
      `select b.book_id, title from book b, bookgenres bg
       where bg.book_id = b.book_id
       and genre_id = 3`,
      [id]
    );

    // If no books are found, return null
    if (rows.length == 0) return null;

    // Return the Book instance created from the first row
    return Book.fromRow(rows[0]);
  }

  /**
   * Creates a new image and saves it to the database.
   * 
   * @param {Object} imageData - The image data (buffer and file type).
   * @returns {number} The image ID of the newly created image.
   */
  async createImage(imageData) {
    const { imageBuffer, fileType } = imageData;
    const query = 'INSERT INTO images (image_data, image_type) VALUES (?, ?)';
    try {
      const base64Image = imageBuffer.toString('base64');
      const [result] = await this.pool.query(query, [base64Image, fileType]);
      return result.insertId;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Creates a new book and saves it to the database.
   * 
   * @param {Object} bookData - The data for the book (title, ISBN, publisher, etc.).
   * @returns {Object} The newly created book data.
   */
  async createBook(bookData) {
    const {
      title, isbn, publisher, published_year, status, description, author_id,
      image_data, quantity, rate,
    } = bookData;

    try {
      // Check if the book title already exists
      const [titleExists] = await this.pool.query("SELECT * FROM book WHERE title = ?", [title]);
      if (titleExists.length > 0) throw new Error("A book with this title already exists.");

      // Check if the ISBN already exists
      const [isbnExists] = await this.pool.query("SELECT * FROM book WHERE isbn = ?", [isbn]);
      if (isbnExists.length > 0) throw new Error("A book with this ISBN already exists.");

      let image_id = null;
      if (image_data) {
        image_id = await this.createImage(image_data); // Create the image if provided
      }

      // Insert the new book into the database
      const query = `
                INSERT INTO book (title, isbn, publisher, published_year, status, description,
                                  author_id, image_id, quantity, rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
      const [result] = await this.pool.query(query, [
        title, isbn, publisher, published_year, status, description, author_id,
        image_id, quantity, rate
      ]);

      return {
        id: result.insertId, author_id, image_id, isbn, title, publisher,
        published_year, status, quantity, rate, description
      };
    } catch (error) {
      console.error('Error creating book:', error);
      throw new Error('Error creating book');
    }
  }

  /**
   * Updates an existing book with new data.
   * 
   * @param {number} id - The ID of the book to update.
   * @param {Object} bookData - The updated book data.
   * @returns {boolean} Returns true if the update was successful, otherwise false.
   */
  async updateBook(id, bookData) {
    const {
      title,
      isbn,
      publisher,
      published_year,
      status,
      description,
      author_id,
      image_data,  // New image data (if any)
      quantity,
      rate,
    } = bookData;

    // Step 1: If a new image is uploaded, handle it
    let image_id = null;
    if (image_data) {
      // Create the new image in the images table
      image_id = await this.createImage(image_data);
    } else {
      // If no image data is provided, we might keep the current image
      const [currentBook] = await this.pool.query("SELECT image_id FROM book WHERE book_id = ?", [id]);
      image_id = currentBook[0]?.image_id || null; // Keep the current image_id if no new image is uploaded
    }

    // Step 2: Update the book in the database
    try {
      const [result] = await this.pool.query(
        "UPDATE book SET title = ?, isbn = ?, publisher = ?, published_year = ?, status = ?, description = ?, author_id = ?, image_id = ?, quantity = ?, rate = ? WHERE book_id = ?",
        [
          title,
          isbn,
          publisher,
          published_year,
          status,
          description,
          author_id,
          image_id,
          quantity,
          rate,
          id,
        ]
      );

      // Check if any rows were affected
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating book:', error);
      throw new Error('Error updating book');
    }
  }

  /**
   * Deletes a book from the database based on its ID.
   * 
   * @param {number} id - The ID of the book to delete.
   * @returns {boolean} Returns true if the book was deleted, otherwise false.
   */
  async deleteBook(id) {
    // Delete book from the database based on the provided book ID
    const [result] = await this.pool.query(
      "DELETE FROM book WHERE book_id = ?",
      [id]
    );

    // If affected rows is greater than 0, deletion was successful
    return result.affectedRows > 0;
  }

  /**
   * Checks if a book exists in the database based on its ID.
   * 
   * @param {number} id - The ID of the book to check.
   * @returns {boolean} Returns true if the book exists, otherwise false.
   */
  async checkBookExists(id) {
    // Query to check if the book exists in the database
    const [rows] = await this.pool.query(
      "SELECT book_id FROM book WHERE book_id = ?",
      [id]
    );

    // Return true if any rows were returned, indicating the book exists
    return rows.length > 0;
  }

  /**
  * Asynchronously searches for books based on a search term.
  * 
  * This function allows the user to search for books by matching the search term across various columns, including:
  * - Book title
  * - Author's first and last name
  * - Genre
  * - Published year
  * - Publisher
  *
  * The search uses the SQL `LIKE` operator for partial matching, allowing flexible and dynamic search results.
  * 
  * @param {string} searchItem - The search term used for finding books. The term will be used to match partial strings in the following columns: 
  *                               book title, author first name, author last name, genre, published year, and publisher.
  * 
  * @returns {Promise<Array<Object>>} A promise that resolves to an array of book objects that match the search criteria. 
  *                                   If no books are found, it returns an empty array.
  * 
  * @throws {Error} Throws an error if there is an issue with the database query.
  */
  async searchBook(searchItem) {
    try {
      const keyword = `%${searchItem}%`; // Format the search term for partial matching (LIKE operator)

      // SQL query to search for books with the keyword in title, author name, published year, or genre
      const query = `
                SELECT 
                    book.book_id,
                    book.title,
                    book.published_year,
                    book.publisher,
                    images.image_data,
                    images.image_type,
                    GROUP_CONCAT(genre.type SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_id = author.author_id
                JOIN bookgenres ON bookgenres.book_id = book.book_id
                JOIN genre ON bookgenres.genre_id = genre.genre_id
                JOIN images ON book.image_id = images.image_id
                WHERE 
                    book.title LIKE ?
                    OR genre.type LIKE ?
                    OR author.first_name LIKE ?
                    OR author.last_name LIKE ?
                    OR book.published_year LIKE ?
                    OR book.publisher LIKE ?
                GROUP BY book.book_id
            `;

      // Prepare query parameters to prevent SQL injection
      const queryParams = [keyword, keyword, keyword, keyword, keyword, keyword];

      // Execute the query and retrieve the matching books
      const [rows] = await this.pool.query(query, queryParams);

      if (!rows || rows.length === 0) {
        return []; // Return an empty array if no results
      }

      // Return the list of books formatted as objects
      return rows.map(row => ({
        book_id: row.book_id,
        title: row.title,
        published_year: row.published_year,
        publisher: row.publisher,
        genres: row.genres,
        image_data: row.image_data,
        image_type: row.image_type
      }));

    } catch (e) {
      throw new Error(`Error searching for book: ${e.message}`);
    }
  }

  /**
  * Allows a user to borrow a book.
  * It checks if the book is available, if the user exists, and if the book is not already borrowed.
  * 
  * @param {string} username - The username of the user borrowing the book.
  * @param {number} book_id - The ID of the book being borrowed.
  * @returns {Promise<Object>} - A response containing a success message and transaction details.
  * @throws {Error} - Throws errors for invalid book, user, or borrow conditions.
  */
  async borrowBook(username, book_id) {
    // Check if the book exists
    const checkbook = await this.checkBookExists(book_id);
    if (!checkbook) {
      throw new Error("Book doesn't exist.");
    }

    // Check if the user exists
    const checkuser = await userService.checkUserExists(username);
    if (!checkuser) {
      throw new Error("User doesn't exist.");
    }

    // Check if the book is already borrowed by this user
    const [rows] = await this.pool.query(
      `SELECT * from borrowing_transaction WHERE username = ? AND book_id = ? AND return_date IS NULL`,
      [username, book_id]
    );
    if (rows.length > 0) {
      throw new Error("Book is already borrowed by this user.");
    }

    // Check the current quantity of the book
    const [bookRows] = await this.pool.query(
      `SELECT quantity, status FROM book WHERE book_id = ?`,
      [book_id]
    );
    if (bookRows.length === 0) {
      throw new Error("Book doesn't exist in the book table.");
    }

    let { quantity, status } = bookRows[0];

    // If there are no available copies of the book
    if (quantity <= 0) {
      throw new Error("No available copies of the book to borrow.");
    }

    // Decrease the quantity by 1
    quantity--;

    // If quantity is 0, update the book status to 'unavailable'
    if (quantity === 0) {
      status = 'unavailable';
    }

    // Update the book's quantity and status in the database
    await this.pool.query(
      `UPDATE book SET quantity = ?, status = ? WHERE book_id = ?`,
      [quantity, status, book_id]
    );

    // Create a transaction since both are present
    const addTransaction = await transactionService.createTransaction({
      username,
      book_id,
    });

    const transaction_id = addTransaction.insertId;

    if (!transaction_id) {
      throw new Error("Transaction creation failed.");
    }

    // Create notification without fine
    await notificationService.createNotificationWithouFine({ transaction_id });

    // Return a message with book borrowed successfully
    return {
      message: "Book borrowed successfully",
      transaction: {
        transaction_id: transaction_id,
        username,
        book_id,
        issue_date: addTransaction.issue_date,
        return_date: addTransaction.return_date,
      },
    };
  }

  /**
  * Allows a user to return a borrowed book.
  * It updates the borrowing transaction to include the return date and increases the book's quantity.
  * 
  * @param {string} username - The username of the user returning the book.
  * @param {number} book_id - The ID of the book being returned.
  * @returns {Promise<Object>} - A response with a success message and the transaction details.
  * @throws {Error} - Throws an error if there is no active borrowing record.
  */
  async returnBook(username, book_id) {
    // Find the active borrowing transaction for this user and book
    const [borrowingRecord] = await this.pool.query(
      `SELECT * FROM borrowing_transaction
        WHERE username = ? AND book_id = ? AND return_date IS NULL`,
      [username, book_id]
    );

    // If there is no active borrowing record, throw an error
    if (borrowingRecord.length === 0) {
      throw new Error(
        "No active borrowing record found for this user and book."
      );
    }

    const transaction = borrowingRecord[0];
    const today = new Date();

    // Update the borrowing transaction to set the return_date to the current date
    await this.pool.query(
      `
        UPDATE borrowing_transaction
        SET return_date = ?
        WHERE transaction_id = ?`,
      [today, transaction.transaction_id]
    );

    // Increase the quantity of the book by 1 to reflect the returned copy
    await this.pool.query(
      `
        UPDATE book
        SET quantity = quantity + 1
        WHERE book_id = ?`,
      [book_id]
    );

    // Return a message with the transaction details
    return {
      message: "Book returned successfully",
      transaction: {
        transaction_id: transaction.transaction_id,
        username,
        book_id,
        issue_date: transaction.issue_date,
        return_date: today,
      },
    };
  }

  /**
  * Checks if a book is currently borrowed by a user.
  * 
  * @param {string} username - The username of the user.
  * @param {number} book_id - The ID of the book.
  * @returns {Promise<boolean>} - Returns `true` if the book is borrowed, otherwise `false`.
  */
  async checkIfBookIsBorrowed(username, book_id) {
    const [rows] = await this.pool.query(
      `SELECT * FROM borrowing_transaction WHERE username = ? AND book_id = ?`,
      [username, book_id]
    );

    // Returns true if borrowed, false otherwise
    return rows.length > 0;
  }
}

module.exports = new BookService();
