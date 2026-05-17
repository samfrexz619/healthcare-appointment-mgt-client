````md
# Healthcare Appointment Management System (HAMS)

## Overview

The Healthcare Appointment Management System (HAMS) is a full-stack web application developed for the Software Quality Assurance coursework. The system enables patients to book healthcare appointments while allowing doctors to manage their schedules and appointments through a modern web interface.

The application was developed using:
- Next.js + TypeScript (Frontend)
- Express.js (Backend)
- MongoDB (Database)

The project demonstrates the practical application of software quality assurance principles, including system design, testing, modular architecture, and full-stack integration.

---

## Live Deployment

### Frontend Application
[Live Demo](https://medi-care-healthcare.netlify.app/)

### Frontend Repository
[Frontend GitHub Repository](https://github.com/samfrexz619/healthcare-appointment-mgt-client)

### Backend Repository
[Backend GitHub Repository](https://github.com/TakudzwaMushai/hams-backend)

---

## Features

### Authentication
- User login and signup
- Role-based access (Patient / Doctor)

### Appointment Management
- View doctors
- Book appointments
- View appointment history
- Appointment confirmation

### Doctor Management
- Doctor profile management
- Availability handling

### Backend Features
- RESTful APIs
- Middleware-based authentication
- MongoDB persistence
- Swagger API documentation


## Project Structure

### Frontend Structure

```bash
src/
├── app/
├── components/
├── hooks/
├── services/
├── types/
└── utils/
````

### Backend Structure

```bash
backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── tests/
```

---

## Installation and Setup

### Frontend Setup

#### 1. Clone the frontend repository

```bash
git clone https://github.com/samfrexz619/healthcare-appointment-mgt-client.git
```

#### 2. Navigate into the project directory

```bash
cd healthcare-appointment-mgt-client
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Start the development server

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

## Backend Setup

#### 1. Clone the backend repository

```bash
git clone https://github.com/TakudzwaMushai/hams-backend.git
```

#### 2. Navigate into the backend directory

```bash
cd hams-backend
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Configure environment variables

Create a `.env` file and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

#### 5. Run the backend server

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## API Documentation

Swagger documentation is integrated into the backend for API testing and endpoint visibility.

Example:

```bash
http://localhost:5000/api-docs
```


## Team Contributions

| Team Member | Contribution                                                                  |
| ----------- | ----------------------------------------------------------------------------- |
| Samuel Damilola Oyawale   | Frontend development, UI design, testing, and documentation                   |
| Mushai Takudzwa Allen   | Backend development, MongoDB integration, API development, and authentication |


```
```
