# Image Matting Web Application

This is a web application for image background removal with user authentication and credit-based payments.

## Features

- User authentication (register, login, logout)
- Image matting (background removal)
- Credit-based payment system using Stripe
- Image processing history
- Recharge history

## Project Structure

```
.
├── backend/                 # Flask API backend
│   ├── app/                 # Application package
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── .env                 # Environment variables (create from .env.example)
│   ├── .env.example         # Example environment file
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Application entry point
│
└── frontend/                # React frontend application
    ├── public/              # Static files
    └── src/                 # React source code
        ├── components/      # Reusable components
        ├── pages/           # Page components
        ├── services/        # API services
        └── utils/           # Utility functions
```

## Backend Setup

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```

4. Set up the database:
   ```
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE image_matting;
   ```

5. Run the application:
   ```
   python run.py
   ```

## Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `GET /api/me` - Get current user information
- `POST /api/logout` - Logout current user

### Image Matting

- `POST /api/matting` - Process an image
- `GET /api/matting/history` - Get user's matting history

### Payments

- `POST /api/recharge` - Initialize a payment for credits
- `POST /api/payment-webhook` - Stripe webhook for payment notifications
- `GET /api/credit/balance` - Get user's credit balance
- `GET /api/recharge/history` - Get user's recharge history

## Technologies Used

- **Backend**: Flask, SQLAlchemy, JWT, MySQL
- **Frontend**: React, React Router, Axios
- **Payment Processing**: Stripe
- **Image Processing**: PIL (Pillow) 