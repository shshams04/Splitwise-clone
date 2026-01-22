# Splitwise Clone

A full-stack expense splitting application similar to Splitwise, built with React and Node.js.

## Features

- User authentication (register/login)
- Create and manage groups
- Add expenses with custom splits
- Real-time balance calculations
- Settlement recommendations
- Responsive design with Tailwind CSS
- Real-time updates with Socket.IO

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- Heroicons

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- bcryptjs

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:
```bash
npm run install-all
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/splitwise
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/members` - Add member to group

### Expenses
- `POST /api/expenses` - Add new expense
- `GET /api/expenses/group/:groupId` - Get group expenses
- `GET /api/expenses/balances/:groupId` - Get group balances
- `DELETE /api/expenses/:id` - Delete expense

### Users
- `GET /api/users/search?q=query` - Search users

## Usage

1. Register a new account or login
2. Create a group and add members
3. Add expenses with custom or equal splits
4. View balances and settlement recommendations
5. Manage expenses and track who owes what

## License

MIT
