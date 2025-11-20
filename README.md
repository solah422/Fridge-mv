# Fridge MV - Point of Sale (POS) Application

A modern, secure, client-server POS system.

## Deployment Guide for x10hosting

This guide explains exactly how to deploy the Fridge MV application to a free **x10hosting** account using a PHP backend and MySQL database.

### Prerequisites

1.  An active [x10hosting](https://x10hosting.com) account.
2.  Node.js installed on your local computer (to build the React app).

---

### Phase 1: Prepare the Local Project

1.  **Open `backend/api/index.php`** in your project folder.
2.  You will see the database connection section:
    ```php
    $host = "localhost"; 
    $db_name = "YOUR_X10_DB_NAME"; 
    $username = "YOUR_X10_DB_USER";
    $password = "YOUR_X10_DB_PASSWORD";
    ```
    *Keep this file open.* You will need to paste your actual x10hosting database credentials here in Phase 2.

3.  **Build the React App**:
    Open your terminal in the project root and run:
    ```bash
    npm install
    npm run build
    ```
    This creates a `dist` (or `build`) folder containing the finalized frontend files (`index.html`, `.js`, `.css`).

---

### Phase 2: Server & Database Setup (x10hosting)

1.  **Log in to x10hosting** and enter your **DirectAdmin** control panel.
2.  **Create Database**:
    *   Go to **MySQL Management**.
    *   Click **Create New Database**.
    *   **Database Name**: Enter a name (e.g., `pos`). Note the full name (e.g., `zahuwaan_pos`).
    *   **Database User**: Create a user (e.g., `admin`). Note the full username (e.g., `zahuwaan_admin`).
    *   **Password**: Generate a secure password and **COPY IT**.
    *   Click **Create**.

3.  **Update API Config**:
    *   Go back to your local `backend/api/index.php` file.
    *   Replace `YOUR_X10_DB_NAME`, `YOUR_X10_DB_USER`, and `YOUR_X10_DB_PASSWORD` with the details you just created.
    *   Save the file.

4.  **Import Schema**:
    *   In DirectAdmin, click **phpMyAdmin**.
    *   Log in (often auto-logged in, or use your DB credentials).
    *   Select your new database from the left sidebar.
    *   Click the **Import** tab at the top.
    *   Click **Choose File** and select `backend/database.sql` from your project folder.
    *   Click **Go**. This creates all the tables (`users`, `customers`, etc.).
    *   *Important*: The default admin password is `password`. The finance password is `password`. You must change these immediately after logging in.

---

### Phase 3: Upload Files (File Manager)

1.  In DirectAdmin, go to **File Manager**.
2.  Navigate to `domains` -> `yourdomain.x10.mx` -> `public_html`.
3.  **Clear existing files**: Delete `index.php` or `default.html` if they exist.

#### A. Upload Backend API
1.  Create a new folder named `api` inside `public_html`.
2.  Enter the `api` folder.
3.  Upload your **updated** `backend/api/index.php`.
4.  Upload `backend/.htaccess` to this `api` folder.
    *   *Note: This .htaccess allows the API routing to work.*

#### B. Upload Frontend (React)
1.  Go back to `public_html`.
2.  Upload the **contents** of your local `dist` (or `build`) folder.
    *   You should see `index.html`, `assets/`, `vite.svg` etc., directly in `public_html`.
3.  Upload `public/.htaccess` to `public_html`.
    *   *Note: This .htaccess handles React Router, ensuring refreshing the page doesn't cause a 404 error.*

---

### Phase 4: Verification

1.  **Test the API**:
    *   Visit `https://yourdomain.x10.mx/api/customers` in your browser.
    *   You should see `[]` (empty JSON array) or a JSON response. If you see a PHP error, check your database credentials in `index.php`.
    
2.  **Test the App**:
    *   Visit `https://yourdomain.x10.mx`.
    *   You should see the "Fridge MV" login screen with the animated background.
    *   **Login**:
        *   Username: `admin`
        *   Password: `password`
    *   Go to **Settings** -> **Admin Security** and change your password immediately.

### Troubleshooting

*   **404 on Refresh**: Ensure `public/.htaccess` is in `public_html`.
*   **API 500 Error**: Check `backend/api/index.php` syntax or database credentials.
*   **Database Error**: Ensure you imported `database.sql` correctly in phpMyAdmin.
