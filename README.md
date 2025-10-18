# Ruut Webflow OAuth Integration

This Node.js application handles **OAuth authentication with Webflow** and securely stores access tokens to the Ruut backend.

---

## 🔧 Tech Stack

- **Express.js** — Web server framework
- **Webflow API** — For OAuth and site access
- **MongoDB** — (for extensibility, connection established)
- **dotenv** — For managing environment variables
- **CORS** — Secure domain handling
- **node-fetch** — For communicating with Ruut backend

---

## 🚀 How It Works

### 1. **OAuth Flow**

- User initiates auth via `/webflow/oauth`
- Redirects to Webflow for permission
- On callback, retrieves access token and sends it to the Ruut backend
- Token is securely stored via `/api/v1/accounts/profile`

### 2. **Token Check**

- Visiting `/webflow/` checks if a valid Webflow token exists
- If it does → redirect to Ruut App
- If not → redirects to begin OAuth process

---

## 📁 Folder Structure

/ruut-webflow-oauth
├── routes/
│ └── authRoutes.js # OAuth routes
├── utils/
│ └── tokens.js # Token handling with Ruut
├── db/
│ └── db.js # DB connection setup (MongoDB)
├── index.js # Main server entry
├── .env # Environment variables

---

## 🧪 Endpoints

| Method | Route                     | Description                             |
| ------ | ------------------------- | --------------------------------------- |
| GET    | `/webflow/`               | Checks for existing token and redirects |
| GET    | `/webflow/oauth`          | Starts OAuth flow                       |
| GET    | `/webflow/oauth/callback` | Handles Webflow OAuth redirect          |

---

## 🌐 Environment Setup

Create a `.env` file with the following variables:

```env
PORT=3000
DEV_PORT=3000
DOMAINS=http://localhost:3000,http://yourdomain.com
MONGO_URI=mongodb://localhost:27017/ruut-oauth
WEBFLOW_CLIENT_ID=your_webflow_client_id
WEBFLOW_CLIENT_SECRET=your_webflow_client_secret
WEBFLOW_REDIRECT_URI=http://localhost:3000/webflow/oauth/callback
WEBFLOW_SITE_TOKEN=optional_static_token
BEARER_TOKEN=your_internal_api_token


## To Run
npm install
npm start
```
