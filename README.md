# 🛍️ C Commerce - Modern E-Commerce Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**C Commerce** is a sleek, full-stack e-commerce application designed with a "Spotify Blue" aesthetic. It features a glassmorphic UI, dynamic product catalog, persistent shopping cart, and a robust admin dashboard.

---

## ✨ Key Features

### 🎨 Design & UX
- **Spotify-Inspired UI**: Dark navy themes (`#050b1a`) with vibrant Spotify green (`#1db954`) accents.
- **Glassmorphism**: Beautiful backdrop filters and translucent cards for a modern feel.
- **Responsive Layout**: Fully optimized for desktop, tablet, and mobile viewing.

### 🛒 Customer Experience
- **Dynamic Catalog**: Browse 100+ seeded products with real-time search and category filtering.
- **Smart Shopping Cart**: Persistent cart with instant quantity adjustments and optimistic UI updates.
- **Order Management**: View detailed order history after a seamless checkout process.
- **Secure Profiles**: User-specific data protected by JWT authentication.

### 🛡️ Admin Power
- **Admin Dashboard**: Comprehensive view of all registered users and order history.
- **Product Management**: Create, edit, and delete products and categories directly from the UI.
- **System Monitoring**: Live logs and self-documenting API via Swagger.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Fetch API |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic v2, Python 3.10+ |
| **Database** | SQLite (File-based, zero configuration required) |
| **Security** | JWT (JSON Web Tokens), Bcrypt Password Hashing |
| **Server** | Uvicorn (ASGI) |

---

## 🚀 Quick Start Guide

The easiest way to get the project running is using the provided automation script.

### 1. Prerequisites
Ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) & [npm](https://www.npmjs.com/)

### 2. Launch Everything
Run the root startup script to set up environments and launch both servers:

```bash
# Make the script executable (Mac/Linux)
chmod +x start.sh

# Run the script
./start.sh
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Installation

If you prefer to set up the components individually:

### 🐍 Backend Setup
1. `cd backend`
2. Create virtual environment: `python3 -m venv venv`
3. Activate venv: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. Install packages: `pip install -r requirements.txt`
5. Start server: `uvicorn app.main:app --reload`

### ⚛️ Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

---

## 🔐 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@glasshop.com` | `admin123` |
| **Customer** | *Register in the UI* | *Your choice* |

---

## 📂 Project Architecture

```plaintext
e-comm/
├── backend/            # Python FastAPI backend
│   ├── app/
│   │   ├── database/   # DB setup & seeding logic
│   │   ├── models/     # SQLAlchemy database models
│   │   ├── routers/    # API endpoints (Auth, Products, Cart)
│   │   └── schemas/    # Pydantic data validation models
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx     # Main application logic & UI
│   │   └── index.css   # Global styles & Tailwind config
└── start.sh            # Root orchestration script
```

---

## 🔍 Admin Operations

### Viewing Registered Users
1. Log in as **Admin**.
2. Click the **Admin** tab in the navbar.
3. Browse the **Registered Accounts** table to manage users.

### Managing Products
- Access the Admin panel to add new items.
- Provide a title, price, category, and an image URL (e.g., from Unsplash).

---

## 🧪 Database Reset
To wipe the database and reload the 100 sample products:
```bash
rm backend/ecommerce.db
cd backend && PYTHONPATH=. venv/bin/python app/database/seed.py
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ by the C Commerce Team.*
