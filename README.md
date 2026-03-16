# ChatNap - Real-time Messaging Platform

A full-stack chat application built with React, Express, TypeScript, PostgreSQL, Prisma, and Socket.io.

## Features

- **Authentication**: JWT-based user registration and login
- **User Directory**: See all registered users with online status
- **Real-time Messaging**: Instant message delivery via WebSockets
- **Online Presence**: Green dot indicator for online users
- **Typing Indicators**: See when someone is typing
- **Message Persistence**: Chat history survives page refreshes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod

### Frontend
- **Framework**: React 19 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client

## Project Structure

```
chatnap/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── services/          # API and socket services
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Main app component
│   ├── package.json
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Clone and Navigate

```bash
cd chatnap
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE chatnap;"
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if your backend runs on a different port

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatnap?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (except current user)
- `GET /users/me` - Get current user

### Messages
- `GET /messages/conversations` - Get recent conversations
- `GET /messages/:userId` - Get conversation with specific user

## WebSocket Events

### Client to Server
- `authenticate` - Send JWT token for socket authentication
- `send_message` - Send a message to another user
- `typing` - Send typing indicator

### Server to Client
- `authenticated` - Socket authentication response
- `new_message` - Receive a new message
- `message_sent` - Confirmation that message was sent
- `user_typing` - Another user is typing
- `user_online` - User came online
- `user_offline` - User went offline

## Database Schema

```prisma
model User {
  id            String    @id @default(uuid())
  username      String    @unique
  passwordHash  String
  isOnline      Boolean   @default(false)
  lastSeen      DateTime  @default(now())
  createdAt     DateTime  @default(now())
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

model Message {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String
  content     String
  createdAt   DateTime @default(now())
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver    User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```

## Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Set up a production PostgreSQL database
4. Configure CORS for your frontend domain
5. Use a process manager like PM2

### Frontend

1. Update `VITE_API_URL`  to point to your backend
2. Run `npm run build`
3. Deploy the `dist` folder to a static hosting service

### Nginx Configuration (WebSocket Support)

```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Testing

1. Open two different browsers (or incognito windows)
2. Register two different accounts
3. Log in on both browsers
4. You should see each other in the user list with online status
5. Click on a user to start chatting
6. Messages should appear instantly on both sides
7. Refresh the page - chat history should persist

## Troubleshooting

### Database connection errors
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### WebSocket connection issues
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- Ensure no firewall is blocking port 3001
- Check browser console for CORS errors

### Authentication errors
- Clear localStorage and try logging in again
- Check that `JWT_SECRET` is set correctly

## License

MIT
