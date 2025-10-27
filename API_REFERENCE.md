
# API Reference

This document provides a reference for the API endpoints used in this application.

## Authentication

Most API routes are protected and require a JSON Web Token (JWT) to be sent in the `Authorization` header of the request.

**Example:**

```javascript
const token = 'your_jwt_token'; // Replace with the actual token

fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## User API

### Register a new user

*   **Method:** `POST`
*   **Route:** `/api/users/register`
*   **Description:** Registers a new user.
*   **Access:** Public
*   **Request Body:**

    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "your_password"
    }
    ```

*   **Response:**

    ```json
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "credits": 10,
      "message": "user registered successfully"
    }
    ```

*   **Example Usage:**

    ```javascript
    fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'your_password'
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Login a user

*   **Method:** `POST`
*   **Route:** `/api/users/login`
*   **Description:** Authenticates a user and returns a JWT.
*   **Access:** Public
*   **Request Body:**

    ```json
    {
      "email": "john.doe@example.com",
      "password": "your_password"
    }
    ```

*   **Response:**

    ```json
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "credits": 10,
      "token": "your_jwt_token"
    }
    ```

*   **Example Usage:**

    ```javascript
    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'your_password'
      })
    })
    .then(response => response.json())
    .then(data => {
      // Store the token in localStorage or a secure place
      localStorage.setItem('token', data.token);
      console.log(data);
    });
    ```

### Get user profile

*   **Method:** `GET`
*   **Route:** `/api/users/profile`
*   **Description:** Retrieves the profile of the authenticated user.
*   **Access:** Private
*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Update user profile

*   **Method:** `PUT`
*   **Route:** `/api/users/profile`
*   **Description:** Updates the profile of the authenticated user.
*   **Access:** Private
*   **Request Body:**

    ```json
    {
      "name": "Johnathan Doe",
      "email": "johnathan.doe@example.com",
      "password": "new_password" // Optional
    }
    ```

*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Johnathan Doe'
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Delete user profile

*   **Method:** `DELETE`
*   **Route:** `/api/users/profile`
*   **Description:** Deletes the profile of the authenticated user.
*   **Access:** Private
*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/users/profile', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

---

## Flashcard API

### Generate a new flashcard pack

*   **Method:** `POST`
*   **Route:** `/api/flashcards/generate`
*   **Description:** Generates a new flashcard pack using AI.
*   **Access:** Private
*   **Request Body:**

    ```json
    {
      "topic": "JavaScript Promises",
      "cardCount": 5
    }
    ```

*   **Response:**

    ```json
    {
      "flashcards": [
        {
          "question": "What is a Promise?",
          "answer": "A Promise is an object representing the eventual completion or failure of an asynchronous operation."
        }
      ],
      "credits": 9
    }
    ```

*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/flashcards/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        topic: 'JavaScript Promises',
        cardCount: 5
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Save a generated flashcard pack

*   **Method:** `POST`
*   **Route:** `/api/flashcards/save`
*   **Description:** Saves a generated flashcard pack to the user's account.
*   **Access:** Private
*   **Request Body:**

    ```json
    {
      "title": "JavaScript Promises",
      "cards": [
        {
          "question": "What is a Promise?",
          "answer": "A Promise is an object representing the eventual completion or failure of an asynchronous operation."
        }
      ]
    }
    ```

*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');
    const flashcardPack = {
      title: 'JavaScript Promises',
      cards: [
        {
          question: 'What is a Promise?',
          answer: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.'
        }
      ]
    };

    fetch('/api/flashcards/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(flashcardPack)
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Get all user's flashcard packs

*   **Method:** `GET`
*   **Route:** `/api/flashcards/`
*   **Description:** Retrieves all flashcard packs for the authenticated user.
*   **Access:** Private
*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/flashcards/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Update a specific flashcard pack

*   **Method:** `PUT`
*   **Route:** `/api/flashcards/:id`
*   **Description:** Updates a specific flashcard pack.
*   **Access:** Private
*   **Request Body:**

    ```json
    {
      "title": "Advanced JavaScript Promises",
      "cards": [
        {
          "question": "What is `Promise.all()`?",
          "answer": "It returns a single Promise that resolves when all of the promises in the iterable argument have resolved."
        }
      ]
    }
    ```

*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');
    const packId = 'your_pack_id';
    const updatedPack = {
      title: 'Advanced JavaScript Promises',
      cards: [
        {
          question: 'What is `Promise.all()`?',
          answer: 'It returns a single Promise that resolves when all of the promises in the iterable argument have resolved.'
        }
      ]
    };

    fetch(`/api/flashcards/${packId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedPack)
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

### Delete a specific flashcard pack

*   **Method:** `DELETE`
*   **Route:** `/api/flashcards/:id`
*   **Description:** Deletes a specific flashcard pack.
*   **Access:** Private
*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');
    const packId = 'your_pack_id';

    fetch(`/api/flashcards/${packId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```

---

## Learning API

### Get an explanation for a word

*   **Method:** `POST`
*   **Route:** `/api/learn/vocabulary`
*   **Description:** Gets an explanation of a word from the AI service.
*   **Access:** Private
*   **Request Body:**

    ```json
    {
      "word": "asynchronous"
    }
    ```

*   **Response:**

    ```json
    {
      "explanation": "...",
      "credits": 8
    }
    ```

*   **Example Usage:**

    ```javascript
    const token = localStorage.getItem('token');

    fetch('/api/learn/vocabulary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        word: 'asynchronous'
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    ```
