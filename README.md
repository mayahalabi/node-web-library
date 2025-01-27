# node-web-library

## Table of Contents

1. [About](#about)
2. [Features](#features)
    - [Administrator Features](#administrator-features)
    - [User Management Features](#user-management-features)
3. [Technologies Used](#technologies-used)
4. [Setup and Installation](#setup-and-installation)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)

---

## About

This backend service, developed using *Spring Boot, automates the management of library resources, including tracking books, managing user activities, and sending borrowing notifications. The system simplifies the borrowing and returning process, reduces errors, and enhances user experience by sending timely notifications about due dates, overdue items, and new arrivals. Using a *[specific database]** for data storage, it allows library staff to manage the catalog efficiently while improving communication with users. This solution reduces administrative burdens and enhances resource accessibility, meeting the growing demand for digital library management.

---

## Features

### Administrator Features:
- *User Management*: Allows administrators to create, update, and delete users, as well as authenticate logins, ensuring secure access to the system.
- *Genre Management*: Enables the library to manage genres by adding, updating, deleting, and viewing all available genres, helping users categorize and find books efficiently.
- *Book Management*: Facilitates the addition, update, deletion, and retrieval of book records, allowing the library to maintain an organized collection.
- *Author Management*: Allows administrators to manage author information, including creating, updating, and deleting author records.
- *Fine Management*: Manages fines associated with overdue books, including creating, updating, deleting fines, and checking if a book has associated fines.
- *Transaction Management*: Tracks the borrowing and returning of books, ensuring that each transaction is recorded properly for inventory and user tracking.
- *Comment Management*: Enables users to create comments and reviews on books and authors, providing feedback and interaction within the system.
- *Notification Management*: Sends and manages notifications, alerting users about important events like due dates, overdue books, or library activities.

### User Management Features:
- *User Registration*: Allows new users to create an account by providing necessary details such as username, password, and email.
- *User Authentication*: Supports user login with username and password, ensuring secure access to the system.
- *Manage Borrowed Books*: Users can borrow any book after viewing the collection provided.
- *Overdue Notifications*: Sends notifications to users about overdue books and approaching due dates.
- *User Role Management*: Differentiates between regular users and administrative users, providing appropriate access levels for each role.
- *Password Reset*: Provides a feature for users to reset their password if they forget it, ensuring continued access to the system.

---

## Technologies Used

- *Node.js: A JavaScript runtime built on Chrome's V8 engine, used to build scalable server-side applications.
- *Express.js: A minimal and flexible Node.js web application framework for building APIs and web applications.
- *JavaScript: The programming language used for both client-side and server-side development.
- *MySQL*: Relational database for storing application data.
- *NPM (Node Package Manager): Dependency management tool used to install and manage Node.js packages.
- *Dotenv: For environment variable management to keep sensitive data like API keys and database credentials safe.
- *Nodemon: A tool that automatically restarts the server when file changes are detected during development.

---

## Environment Variables

```properties
# Server settings
server.port=8080

# Database settings
spring.datasource.url=jdbc:mysql://localhost:3307/webLibrary
spring.datasource.username=root
spring.datasource.password=root

```

## Setup and Installation

### Installation Steps:

1. *Download the Application*:
    - Download the installation needed (IntelliJ).
    - Install necessary dependencies.

2. *Set Up the Web Server*:
    - Configure the server settings to point to the directory where the application files are stored.

3. *Install the Database*:
    - Install the required database software (MySQL).
    - Create a new database for the application to store all library-related data, including book details, user information, and transaction records.

4. *Configure the Database*:
    - Import the provided SQL schema (usually included in the application package) to create the necessary tables in your database.
    - Configure the application to connect to the database by editing the configuration file with the correct database credentials (host, username, password, etc.).

5. *Run the Application*:
    - After completing the setup, navigate to the web application URL or run the local server to start the application.
    - Log in using the default admin credentials provided or set during the installation process.

6. *Verify the Installation*:
    - Test the application by adding a few books, registering users, and processing a test borrow/return transaction.
    - Check if notifications are being sent successfully for due dates and overdue items.

---

## API Endpoints

### 1. User Endpoints
These endpoints are used to manage user data, including creating, updating, deleting, and logging in users.
- *GET /Users*: Fetches all user details from the database.
- *GET /Users/{username}*: Retrieves a specific user based on their username.
- *POST /Users*: Creates a new user in the system by sending user data in the request body.
- *PUT /Users/{username}*: Updates user details. It requires user-specific information to modify the existing user data.
- *DELETE /Users/{username}*: Deletes a user from the database.
- *POST /Users/login*: Authenticates a user by validating the login credentials (username and password).

### 2. Genre Endpoints
These endpoints manage genres within the library, including retrieving, creating, updating, and deleting genres.
- *GET /Genres*: Retrieves a list of all genres available in the library.
- *GET /Genres/{id}*: Fetches details of a specific genre by its ID.
- *POST /Genres*: Adds a new genre to the library.
- *PUT /Genres/{id}*: Updates an existing genre by modifying its details.
- *DELETE /Genres/{id}*: Deletes a genre from the system.

### 3. Author Endpoints
These endpoints are used for managing authors in the system, allowing for viewing, creating, updating, and deleting author information.
- *GET /Authors*: Retrieves a list of all authors.
- *GET /Authors/{id}*: Fetches details of a specific author based on their ID.
- *POST /Authors*: Creates a new author entry in the system.
- *PUT /Authors/{id}*: Updates an existing author’s details.
- *DELETE /Authors/{id}*: Deletes an author from the database.

### 4. Comment Endpoints
These endpoints allow users to interact with comments related to books, authors, or other library resources.
- *GET /Comments*: Retrieves a list of all comments.
- *GET /Comments/{id}*: Fetches details of a specific comment based on their ID.
- *POST /Comments*: Creates a new comment entry in the system.
- *PUT /Comments/{id}*: Updates an existing comment's details.
- *DELETE /Comments/{id}*: Deletes a comment.

### 5. Book Endpoints
The book-related endpoints manage the library's book collection, including adding, updating, deleting, and retrieving book information.
- *GET /Books*: Fetches all the books available in the library.
- *GET /Books/{id}*: Retrieves details of a specific book using its unique ID.
- *POST /Books*: Adds a new book to the library collection.
- *PUT /Books/{id}*: Updates the details of an existing book.
- *DELETE /Books/{id}*: Deletes a specific book from the collection.

### 6. Fine Endpoints
These endpoints handle fines associated with overdue books or other library infractions.
- *GET /Fines*: Retrieves all fines related to the library's users.
- *GET /Fines/{id}*: Fetches a specific fine by its ID.
- *POST /Fines*: Creates a new fine based on overdue books or other infractions.
- *PUT /Fines/{id}*: Updates the details of an existing fine.
- *DELETE /Fines/{id}*: Deletes a fine record from the database.
- *GET /Fines/checkFineByBook/{transactionId}*: Checks if a fine is associated with a specific transaction.

### 7. Transaction Endpoints
Transaction-related endpoints track borrowing and returning books, and can manage the complete lifecycle of a transaction.
- *GET /Transactions*: Retrieves all transactions in the library system.
- *GET /Transactions/{id}*: Fetches a specific transaction based on its ID.
- *POST /Transactions/borrowBook*: Initiates a borrowing process for a book by a user, recording the details of the transaction.
- *PUT /Transactions/returnBook*: Marks a book as returned, completing the transaction.
- *DELETE /Transactions*: Deletes a transaction record from the system.

### 8. Notification Endpoints
These endpoints are used to manage notifications, which may be used for sending alerts about overdue books, due dates, or library events.
- *GET /Notifications*: Retrieves all notifications within the system.
- *GET /Notifications/{id}*: Fetches details about a specific notification.
- *POST /Notifications*: Creates a new notification, often used to alert users about overdue books or due dates.
- *DELETE /Notifications*: Deletes a notification from the system.
- *PUT /Notifications/{id}*: Updates notification details.

*Note*: For a sample of each endpoint's detailed requirements, check the imported Postman testing endpoints provided.

---

### Views

1. *homepage*  
   *Purpose:* Acts as the entry point for all users and admins.  
   *Features:*
   - Sign-in and sign-up buttons for authentication.  

2. *authors*
   *Purpose:* Displays the all the author for admin.  
   *Features:*  
   - List all the authors.  
   - Options to add, update or delete an author.  

3. *addAuthor*  
   *Purpose:* Allows admins to add a new author.  
   *Features:*   
   - A form to input author details and a button to create an author. 

4. *editAuthor*  
   *Purpose:* Allows admins to edit an existing author. 
   *Features:*  
   - A pre-filled form to update author information and save changes.

5. *comments*  
   *Purpose:* Displays the all the comments for admin.  
   *Features:*  
   - List all the comments.  
   - Options to add, update or delete an author.   

6. *addComment*  
   *Purpose:* Allows admins to add a new comment.  
   *Features:*  
   - A form to input comment details and a button to create a comment. 

7. *editComment*  
   *Purpose:* Allows admins to edit an existing comment. 
   *Features:*    
   - A pre-filled form to update comment information and save changes.

8. *fines*  
   *Purpose:* Displays the all the fines for admin.  
   *Features:*  
   - List all the fines.  
   - Options to add, update or delete a fine.
   - update is to set the fine as paid (current date)   

9. *addFine*  
   *Purpose:* Allows admins to add a new fine.  
   *Features:*  
   - A form to input fine details and a button to create a fine.  

10. *genres*  
    *Purpose:* Displays the all the genres for admin.   
    *Features:*  
    - List all the genres.  
    - Options to add, update or delete a genre.

11. *addGenre*  
    *Purpose:* Allows admins to add a new genre.  
    *Features:*  
    - A form to input genre details and a button to create a genre.  

12. *editGenre*  
    *Purpose:* Allows admins to edit an existing genre. 
    *Features:*  
    - A pre-filled form to update genre information and save changes.

13. *notifications*  
    *Purpose:* Displays the all the notifications for admin.
    *Features:*  
    - List all the notifications.  
    - Options to add, update or delete a notification.

14. *addNotification*  
    *Purpose:* Allows admins to add a new notification.   
    *Features:*  
    - A form to input notification details and a button to create a notification.  

15. *transactions*  
    *Purpose:* Displays the all the notifications for admin.
    *Features:*  
    - List all the transactions.  
    - Options to add, update or delete a transaction.
    - update is to set the return date to now (the user returned the book)

16. *addTransaction*  
    *Purpose:*  Allows admins to add a new transaction.   
    *Features:*  
    - A form to input transaction details and a button to create a transaction.   

17. *users*  
    *Purpose:* Displays the all the users for admin.
    *Features:*  
    - List all the users.  
    - Options to add, update or delete a user.

18. *addUser*  
    *Purpose:* Allows admins to add a new user. 
    *Features:*  
    - A form to input user details and a button to create a user. 

19. *editUser*  
    *Purpose:* Allows admins to edit an existing user. 
    *Features:*  
    - A pre-filled form to update user information and save changes.

20. *books*  
    *Purpose:* Displays all the books, with different options depending on the user role (admin or regular user).  
    *Features:*  
    - For users: Clicking on a book cover shows detailed information, a "borrow" button (which changes to "return" once borrowed), and a comment section for feedback.  
    - For admins: Admins can view book details, delete books, or add new books to the library inventory.

21. *addBook*  
    *Purpose:* Allows admins to add a new book. 
    *Features:*  
    - A form to input book details and a button to create a book. 

21. *bookInfo*  
    *Purpose:* Displays detailed information about a specific book when the user clicks on a book cover in the `books.ejs` page.  
    *Features:*  
    - A "borrow" button (which changes to a "return" button once the book is borrowed).  
    - A comment section for user feedback on the book.

22. *bookDetails*  
    *Purpose:* Displays detailed information about a specific book when the admin clicks on a book cover in the `books.ejs` page.  
    *Features:*  
    - A "delete" button to delete the picked book

23. *borrowedBooksByUser*  
    *Purpose:* Displays the list of books borrowed by the logged-in user.  
    *Features:*  
    - View the books that the user has borrowed.

24. *footer*  
    *Purpose:* Displays summary stats.  
    *Features:*  
    - credentials

24. *Index*
   *Purpose:* Displays the admin dashboard with options to manage various resources like authors, books, genres, notifications, fines, and transactions.  
   *Features:*  
   - Button to "Manage Users" for user management.
   - Links to manage authors, books, genres, notifications, and fines.
   - Overview of the system’s key operations.

25. *Notifications for User*
   *Purpose:* Displays the notifications sent to the logged-in user.  
   *Features:*  
   - View notifications related to borrowed books, fines, and return reminders.

### Summary

The endpoints described above are integral to the functionality of a Library Management and Borrowing Notification Application. They allow library administrators to manage users, books, genres, authors, fines, transactions, and notifications in a structured way. These actions ensure that the library operates efficiently and provides timely notifications to users about their borrowed books and any fines they may owe.
