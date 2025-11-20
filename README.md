# Fridge MV - Point of Sale (POS) Application

This is a modern, client-server Point of Sale (POS) application built with React and Redux. It has been architected to communicate with a backend API for all data storage, business logic, and authentication.

## Project Architecture

This project follows a standard client-server model:

-   **Frontend**: A Single Page Application (SPA) built with React and Redux. It is responsible for the UI, state management, and making API calls. It is a "dumb" client and does not store any business-critical data locally.
-   **Backend**: A RESTful API server (to be implemented by you in PHP/MySQL) that handles all business logic, database interactions, and user authentication.

## Getting Started

### 1. Backend API Implementation

Before running the frontend, you must create a backend API that exposes the necessary endpoints. This frontend is configured to communicate with your API for all data.

**Base URL**: The frontend will make requests to relative paths (e.g., `/api/login`). You will need to configure your server (e.g., using a reverse proxy or by placing the API in an `/api` directory) to route these requests to your PHP application.

**Authentication**: The backend should implement token-based authentication (e.g., JWT).
- The `POST /api/login` endpoint should return a user object and an authentication token upon success.
- All other API endpoints should be protected and require an `Authorization: Bearer <token>` header.

#### Required API Endpoints:

You need to create the following endpoints in your PHP backend:

| Method | Path                               | Description                                                                                                                                                             |
| :----- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/login`                       | Authenticate a user. Expects `username`, `password`. Returns `{ user, token }`.                                                                                         |
| `POST` | `/api/register`                    | Activate a customer account. Expects `redboxId`, `oneTimeCode`, `password`.                                                                                             |
| `POST` | `/api/password-reset/request`      | Initiate a password reset request for a customer.                                                                                                                       |
| `POST` | `/api/password-reset/approve`      | (Admin) Approve a reset request.                                                                                                                                        |
| `POST` | `/api/user/password`               | (Authenticated users) Change their own password.                                                                                                                        |
| `GET`  | `/api/customers`                   | Get all customers.                                                                                                                                                      |
| `PUT`  | `/api/customers`                   | Bulk update customers.                                                                                                                                                  |
| `POST` | `/api/customers`                   | Create a new customer and associated credential stub.                                                                                                                   |
| `POST` | `/api/customers/generate-code`     | Generate a new one-time activation code for a customer.                                                                                                                 |
| `GET`  | `/api/products`                    | Get all products.                                                                                                                                                       |
| `PUT`  | `/api/products`                    | Bulk update products.                                                                                                                                                   |
| `GET`  | `/api/transactions`                | Get all transactions.                                                                                                                                                   |
| `POST` | `/api/transactions`                | Create a new transaction. **Crucially, this endpoint must handle all related logic atomically**: update product stock, update customer loyalty points, update gift cards. |
| `PUT`  | `/api/transactions/:id`            | Update an existing transaction (e.g., change status, process returns).                                                                                                  |
| `GET`  | `/api/settings`                    | Get all application settings.                                                                                                                                           |
| `POST` | `/api/settings`                    | Save application settings.                                                                                                                                              |
| `...`  | `...`                              | Create similar `GET`, `POST`, `PUT` endpoints for all other data models: `wholesalers`, `purchase-orders`, `gift-cards`, `promotions`, `product-requests`, etc.           |

### 2. Database Seeding

Your backend's database (MySQL) must be seeded with initial data. This includes:
-   An `admin` user with a securely hashed password.
-   A `finance` user with a securely hashed password.
-   Initial lists of products, customers, and wholesalers if needed.

The client-side seeding has been removed.

### 3. Frontend Deployment

1.  **Install Dependencies**: Run `npm install` in the project root.
2.  **Build the Project**: Run `npm run build`. This will create a `build` or `dist` directory with static HTML, CSS, and JS files. (Note: The exact build command may depend on the deployment environment).
3.  **Upload to Server**: Upload the contents of the build directory to your web server (e.g., into the `public_html` or `www` folder).
4.  **Server Configuration**: Configure your web server (e.g., Apache or Nginx) to:
    -   Serve the `index.html` for any route that is not a static file (to support client-side routing).
    -   Proxy requests from `/api/*` to your PHP backend application.

---

This refactoring prepares the application for a professional, scalable deployment. The separation of concerns between the frontend and backend will make future development and maintenance much more manageable.
