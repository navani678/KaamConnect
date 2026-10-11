# KaamConnect AI

> **Find the Right Worker. Near You. At the Right Price.**  
> *Hyperlocal, AI-driven discovery and bilateral price negotiation platform for skilled informal blue-collar workers in India.*

---

##  1. Project Overview & Implemented Features

Across India, over 150 million skilled informal trade workers (electricians, plumbers, masons, carpenters, painters, and more) find daily work by waiting at physical roadside *labour nakas* or paying 20–30% cuts to aggregator monopolies. At the same time, households in Tier-2 and Tier-3 cities struggle with opaque pricing, unverified credentials, and language barriers.

**KaamConnect AI** connects customers directly with local verified artisans through transparent geospatial discovery, algorithmic matching, and bilateral price negotiation.

###  Implemented Features

- **5-Factor AI Match & Scoring Engine**:
  - Dynamically scores and ranks workers based on 5 weighted dimensions:
    - **Skill Relevance (30%)**: Matches required profession and keyword specializations against job descriptions.
    - **Geospatial Proximity (25%)**: Inverse distance scoring using MongoDB `2dsphere` spatial indexing.
    - **Price Compatibility (20%)**: Compares the worker's estimated quote against the customer's budget range (`budgetMin` to `budgetMax`).
    - **Availability (15%)**: Checks weekday availability, preferred time slot matching, and blackout dates.
    - **Bayesian Reputation (10%)**: Weighted rating score incorporating prior baseline confidence and total review count.
- **Truth-Grounded Explanations (Zero AI Hallucinations)**:
  - Generates clear human-readable match explanations explaining the exact rationale behind a worker's ranking (e.g., *"Matches required skills, is 2.5 km away, is available on Saturday, and quotes ₹900 within your budget"*).
- **Bilateral Price Negotiation State Machine**:
  - Customers propose an initial job budget.
  - Workers can **Accept**, **Reject**, or submit a **Counter-Offer** with an audit message.
  - Customers can **Confirm** the counter-offer, **Decline Counter**, or **Cancel**.
  - Enforces strict transition guarantees (`pending` → `countered` / `accepted` / `rejected` → `completed` / `cancelled`) with conflicting transition prevention (HTTP 409).
- **Hyperlocal Geospatial Worker Discovery**:
  - Distance queries using GeoJSON `[longitude, latitude]` and `$geoNear` aggregation.
  - Filter by profession, distance radius, daily/hourly rate, rating, and experience.
- **Multilingual Support (i18n)**:
  - Localized in **English (`en`)**, **Hindi (`hi`)**, and **Telugu (`te`)** with an instant navbar language toggle.
- **Interactive OpenStreetMap Visualization**:
  - Leaflet map integration (`react-leaflet`) for pin-pointing job locations and viewing worker proximities.
- **Privacy & Trust Infrastructure**:
  - Contact number masking: Phone numbers remain hidden until a booking is accepted by both parties.
  - Worker portfolios, certification badges, and tamper-proof review submissions tied strictly to completed bookings.
  - Incident reporting system (`/api/reports`) for safety violations.
- **Media Upload Pipeline**:
  - Handles photo and video uploads (up to 6 files, max 10MB each) via Multer.
  - Supports Cloudinary CDN when keys are supplied, with automatic fallback to local static storage (`server/uploads/`).
- **Mock Mode Toggle**:
  - Frontend supports offline development/demonstrations via `VITE_USE_MOCKS=true`.

---

##  2. Technologies Used

### Frontend (`client/`)
- **React 18 & Vite**: Fast SPA development and build tooling.
- **Tailwind CSS**: Modern utility styling and responsive UI.
- **React Router v7 / v6**: Client-side navigation and role-based route protection.
- **Leaflet & React Leaflet**: OpenStreetMap interactive maps and geocoding pins.
- **Lucide React**: Clean UI iconography.
- **i18next & react-i18next**: Multilingual internationalization framework.
- **Axios**: HTTP client with request/response interceptors for JWT tokens and envelope unwrap.
- **React Hook Form & Zod**: Form handling and input schema validation.

### Backend (`server/`)
- **Node.js 20 & Express.js 4**: Asynchronous REST API service.
- **Mongoose 8**: Object Data Modeling (ODM) for MongoDB with `2dsphere` geospatial indices.
- **Zod 3**: Strict runtime request payload validation middleware.
- **JSON Web Tokens (JWT) & bcryptjs**: Stateless bearer authentication and secure password hashing.
- **Multer**: Multipart file upload handling.
- **Cloudinary SDK**: Cloud media CDN integration with local disk fallback.
- **Helmet, CORS & express-rate-limit**: API security headers, cross-origin control, and authentication brute-force protection.
- **Morgan**: HTTP request logging.

### Testing & Quality
- **Vitest**: Unit testing suite for the 5-factor matching algorithm and booking state machine.
- **Jest & Supertest**: Integration testing capabilities.
- **Concurrently**: Parallel script runner for full-stack local development.

---

##  3. Project Folder Structure

```
kaamconnect/
├── AGENTS.md                          # Multi-agent pairing rules & workspace guidelines
├── README.md                          # Project documentation
├── package.json                       # Monorepo root package orchestrator
├── package-lock.json
├── render.yaml                        # Production deployment blueprint
│
├── docs/                              # Project architecture contracts & specifications
│   ├── api-contract.md                # REST API paths, payload schemas, and status codes
│   ├── data-models.md                 # Mongoose schema definitions and enums
│   ├── matching-spec.md               # 5-factor scoring formula & weight breakdown
│   ├── test-plan.md                   # QA test strategies and test cases
│   ├── demo-script.md                 # 3-5 minute live demonstration walk-through
│   └── pitch-deck-outline.md          # Hackathon presentation outline
│
├── client/                            # React 18 + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env.example                   # Client environment variables template
│   └── src/
│       ├── main.jsx                   # React DOM root entrypoint
│       ├── App.jsx                    # Application route router & role guards
│       ├── index.css                  # Global Tailwind imports
│       ├── api/                       # Axios client & modular API service methods
│       │   ├── client.js              # Base Axios instance & token interceptors
│       │   ├── auth.js                # Auth requests (login, register, profile)
│       │   ├── jobs.js                # Job creation & match queries
│       │   ├── bookings.js            # Booking requests & negotiation actions
│       │   ├── workers.js             # Worker search & profile endpoints
│       │   ├── reviews.js             # Review submission
│       │   ├── reports.js             # Incident reporting
│       │   └── uploads.js             # File upload helper
│       ├── components/                # Reusable UI components (Navbar, Footer, etc.)
│       ├── context/                   # React Context (AuthContext)
│       ├── i18n/                      # Translations (en.json, hi.json, te.json)
│       ├── mocks/                     # Local demo datasets for offline UI preview
│       ├── pages/                     # Application screens
│       │   ├── LandingPage.jsx        # Public home & hero page
│       │   ├── LoginPage.jsx          # User login
│       │   ├── RegisterPage.jsx       # Customer / Worker registration
│       │   ├── CustomerDashboard.jsx  # Customer jobs & bookings overview
│       │   ├── PostJobPage.jsx        # Job posting with map location selector
│       │   ├── JobDetailPage.jsx      # Job details view
│       │   ├── MatchesPage.jsx        # AI-ranked worker recommendations & map
│       │   ├── WorkerProfilePage.jsx  # Public artisan profile, reviews, portfolio
│       │   ├── BookingRequestPage.jsx # Initiate price quote & booking request
│       │   ├── BookingDetailPage.jsx  # Bilateral negotiation timeline & status
│       │   ├── WorkerDashboard.jsx    # Worker requests, active bookings, stats
│       │   ├── WorkerProfileEditor.jsx# Artisan skill, rate, and portfolio editor
│       │   ├── ReviewPage.jsx         # Post-completion rating & review
│       │   └── NotFoundPage.jsx       # 404 page
│       └── routes/                    # Protected route components
│
├── server/                            # Express 4 + Node.js backend
│   ├── package.json
│   ├── .env.example                   # Server environment variables template
│   ├── uploads/                       # Local file upload directory (fallback)
│   └── src/
│       ├── server.js                  # Database connection & HTTP server listener
│       ├── app.js                     # Express app setup, middleware, CORS, routes
│       ├── config/
│       │   ├── db.js                  # Mongoose MongoDB connection & retry logic
│       │   └── env.js                 # Zod runtime environment validation
│       ├── models/                    # Mongoose database models
│       │   ├── User.js                # Customer, Worker, Admin accounts
│       │   ├── WorkerProfile.js       # Trade, rate, location (2dsphere), portfolio
│       │   ├── JobRequest.js          # Customer job postings
│       │   ├── Booking.js             # Booking negotiations & status transitions
│       │   ├── Review.js              # Worker reviews and ratings
│       │   ├── Report.js              # Safety and dispute reports
│       │   └── constants.js           # Enums (Professions, Statuses, Time Slots)
│       ├── routes/                    # API route controllers
│       │   ├── index.js               # Primary /api router aggregator
│       │   ├── auth.js                # /api/auth
│       │   ├── workers.js             # /api/workers
│       │   ├── jobs.js                # /api/jobs
│       │   ├── bookings.js            # /api/bookings
│       │   ├── reviews.js             # /api/reviews
│       │   ├── reports.js             # /api/reports
│       │   ├── uploads.js             # /api/uploads
│       │   └── meta.js                # /api/health & /api/meta/professions
│       ├── controllers/               # Business logic controllers
│       ├── middleware/                # Auth guards, role checks, Zod validation
│       ├── services/
│       │   ├── geo.js                 # Geospatial calculations & point converters
│       │   ├── upload.js              # Multer & Cloudinary upload pipeline
│       │   ├── bookingStateMachine.js # State transition engine & validator
│       │   └── matching/              # 5-factor AI matching algorithms
│       │       ├── index.js           # Scoring pipeline orchestrator
│       │       ├── scoring.js         # Dimensional score functions
│       │       ├── keywords.js        # Trade keyword dictionaries
│       │       ├── quote.js           # Quote estimation logic
│       │       └── explain.js         # Truth-grounded explanation generator
│       ├── seed/
│       │   └── seed.js                # Database seeder (Warangal / Kazipet demo dataset)
│       └── utils/                     # ApiError class, response envelopes, helpers
│
└── tests/                             # Test suites & QA assets
    ├── api/                           # API integration tests
    ├── postman/                       # Postman test collection and environment
    └── e2e-checklist.md               # End-to-end verification checklist
```

---

##  4. Prerequisites & Installation Steps

### Prerequisites
- **Node.js**: `v20.x` or higher installed ([Download Node.js](https://nodejs.org/)).
- **npm**: `v10.x` or higher (comes bundled with Node.js).
- **Git**: Installed on your system.
- **MongoDB**: A free MongoDB Atlas cluster ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)) or a local MongoDB community server running on `mongodb://localhost:27017`.

> 💡 **Windows PowerShell Note**: If running scripts in PowerShell produces a security warning (*"execution of scripts is disabled on this system"*), execute commands using `npm.cmd <command>` instead of `npm <command>`, or run in Git Bash / Command Prompt.

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/kaamconnect.git
   cd kaamconnect
   ```

2. **Install all dependencies** (installs root, server, and client packages):
   ```bash
   npm run install:all
   ```
   *Alternative manual installation:*
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

---

##  5. How to Configure MongoDB Atlas Using a Private `.env` File

Follow these beginner-friendly steps to connect KaamConnect AI to a free MongoDB Atlas cloud database:

### Step 1: Create a Free MongoDB Atlas Account & Cluster
1. Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register or sign in.
2. Click **Create** to deploy a database.
3. Select the **M0 Free (Shared)** tier.
4. Choose a cloud provider and region near your location (e.g., `AWS / ap-south-1 Mumbai`).
5. Name your cluster (e.g., `Cluster0`) and click **Create Deployment**.

### Step 2: Create a Database User
1. In the MongoDB Atlas dashboard, navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication:
   - Enter a **Username** (e.g., `kaamconnect_user`).
   - Enter or generate a secure **Password** (e.g., `MySecurePassword123`).
   - *Tip:* Avoid special characters like `@`, `/`, or `:` in the password to prevent URL encoding issues.
4. Set **Database User Privileges** to `Read and write to any database`.
5. Click **Add User**.

### Step 3: Configure Network Access (IP Allowlist)
1. In the Atlas dashboard, navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. For local development, click **Allow Access from Anywhere** (`0.0.0.0/0`) or **Add Current IP Address**.
4. Click **Confirm**.

### Step 4: Retrieve Your Connection String
1. Go to **Deployment** → **Database**.
2. Click the **Connect** button next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Configure Your Local Private `server/.env` File
1. In your project, copy the example environment file into a private `.env` file:
   ```bash
   cp server/.env.example server/.env
   ```
2. Open `server/.env` in your text editor.
3. Replace the placeholder with your actual connection string, inserting your database username, password, and database name (`kaamconnect`):
   ```env
   MONGO_URI=mongodb+srv://kaamconnect_user:MySecurePassword123@cluster0.xxxxxx.mongodb.net/kaamconnect?retryWrites=true&w=majority
   ```
4. **Security Notice**: Never commit `server/.env` or `client/.env` to Git. The project's `.gitignore` automatically excludes these files to protect your credentials.

---

##  6. Required Environment Variables

All secrets and settings must be kept in private environment files. Below are the required variables using **placeholder examples only**.

### Backend Configuration: `server/.env`

Create a file named `server/.env` with the following variables:

```env
# ==========================================
# Server Network Settings
# ==========================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ==========================================
# Database Connection (MongoDB Atlas)
# ==========================================
MONGO_URI=mongodb+srv://<db_username>:<db_password>@<cluster_name>.mongodb.net/kaamconnect?retryWrites=true&w=majority

# ==========================================
# Authentication & Security
# ==========================================
# Minimum 32-character secret string used to sign JWT tokens
JWT_SECRET=your_jwt_secret_min_32_characters_long_placeholder
JWT_EXPIRES_IN=7d

# ==========================================
# File Uploads & Cloud Media (Optional)
# ==========================================
# Leave empty to automatically fallback to local static storage in server/uploads/
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
UPLOAD_DIR=./uploads
```

### Frontend Configuration: `client/.env`

Create a file named `client/.env` with the following variables:

```env
# URL where your backend API is accessible
VITE_API_URL=http://localhost:5000/api

# Set to true for offline mock data preview, or false to use real backend API
VITE_USE_MOCKS=false
```

---

##  7. How to Run the Frontend and Backend Locally

### 1. Seed Demo Data (Recommended)
Before running the app for the first time with a live MongoDB instance, populate realistic seed data (45 workers across 10 professions, 6 customers, jobs, bookings, and reviews centered in Warangal / Kazipet):

```bash
# Run from repository root
npm run seed
```
*Or directly inside the server directory:*
```bash
cd server
node src/seed/seed.js
cd ..
```

####  Available Demo Accounts Created by Seeder:
| Role | Email | Password | Description |
|---|---|---|---|
| **Demo Customer** | `customer@demo.com` | `Demo@1234` | Has active electrical & plumbing jobs posted in Kazipet |
| **Demo Worker** | `worker@demo.com` | `Demo@1234` | Ravi Kumar, top-rated Electrician with portfolio & 4.8★ |
| **Admin User** | `admin@kaamconnect.com` | `Demo@1234` | Platform administrator for dispute and report reviews |

---

### 2. Run Both Services Concurrently (Root)
To launch both the Express API and the Vite React frontend with a single command:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Gateway**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/health` or `http://localhost:5000/api/health`

---

### 3. Run Frontend and Backend Separately

If you prefer running services in separate terminal windows:

#### Terminal 1 — Backend Server
```bash
# From repository root
npm run dev:server

# Or navigate to server/
cd server
npm run dev
```
*The server will start on port `5000` with `nodemon` auto-reload.*

#### Terminal 2 — Frontend Client
```bash
# From repository root
npm run dev:client

# Or navigate to client/
cd client
npm run dev
```
*Vite will start the client server on `http://localhost:5173`.*

---

### 4. Running Automated Tests
To run unit tests validating the 5-factor scoring engine and the bilateral booking state machine:

```bash
npm test
```
*Output: 46 Vitest unit tests verifying price counter transitions, cancellation constraints, Bayesian reputation math, and truth-grounded explanation generation.*

---

##  8. Implemented API Endpoints

All responses follow a standard envelope format:
- **Success (`200/201`)**: `{ "success": true, "data": { ... } }`
- **Error (`400/401/403/404/409/500`)**: `{ "success": false, "error": { "code": "...", "message": "...", "fields": { ... } } }`

### System & Metadata
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Root health ping returning server status and timestamp |
| `GET` | `/api/health` | Public | API health ping |
| `GET` | `/api/meta/professions` | Public | Returns available professions and localization metadata |

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`customer`, `worker`, or `admin`) |
| `POST` | `/api/auth/login` | Public | Login with email and password to receive JWT token |
| `GET` | `/api/auth/me` | Bearer Token | Get current user's profile and linked worker profile |
| `PATCH` | `/api/auth/me` | Bearer Token | Update name, phone, or preferred language |

### Worker Discovery & Profiles (`/api/workers`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/workers` | Public | Search workers with geospatial distance, profession, and rate filters |
| `GET` | `/api/workers/:id` | Public | Get public worker profile and recent reviews |
| `GET` | `/api/workers/:id/reviews` | Public | Paginated list of customer reviews for a worker |
| `GET` | `/api/workers/me` | Worker / Admin | Get worker's own full profile |
| `PUT` | `/api/workers/me` | Worker / Admin | Upsert worker profile (rates, trade, service radius, GPS coordinates) |
| `POST` | `/api/workers/me/portfolio` | Worker / Admin | Add image/video item to portfolio |
| `DELETE` | `/api/workers/me/portfolio/:itemId` | Worker / Admin | Delete an item from worker portfolio |
| `PATCH` | `/api/workers/me/availability` | Worker / Admin | Update weekly days, time slots, and unavailable blackout dates |

### Jobs (`/api/jobs`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/jobs` | Customer / Admin | Post a new job request with profession, coordinates, and budget range |
| `GET` | `/api/jobs/mine` | Customer / Admin | Retrieve all jobs posted by the authenticated customer |
| `GET` | `/api/jobs/:id` | Customer / Worker | View full job details |
| `PATCH` | `/api/jobs/:id` | Customer / Admin | Edit job details or cancel (`status: "cancelled"`) |
| `GET` | `/api/jobs/:id/matches` | Customer / Admin | **Run 5-factor AI matching engine** to get ranked worker recommendations |

### Bookings & Negotiation (`/api/bookings`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Customer / Admin | Create a `pending` booking request with proposed price and date |
| `GET` | `/api/bookings/mine` | Bearer Token | List all bookings involving the logged-in customer or worker |
| `GET` | `/api/bookings/:id` | Bearer Token | Get booking detail with complete bilateral counter-offer history |
| `POST` | `/api/bookings/:id/accept` | Worker / Admin | Worker accepts booking (`pending` → `accepted`, job marked `booked`) |
| `POST` | `/api/bookings/:id/reject` | Worker / Admin | Worker rejects booking request (`pending` → `rejected`) |
| `POST` | `/api/bookings/:id/counter` | Worker / Admin | Worker submits counter price (`pending` → `countered` with message) |
| `POST` | `/api/bookings/:id/confirm` | Customer / Admin | Customer confirms worker's counter price (`countered` → `accepted`) |
| `POST` | `/api/bookings/:id/decline-counter` | Customer / Admin | Customer declines worker's counter (`countered` → `cancelled`) |
| `POST` | `/api/bookings/:id/cancel` | Customer / Admin | Customer cancels a booking (`pending` or `accepted` → `cancelled`) |
| `POST` | `/api/bookings/:id/complete` | Customer / Admin | Customer marks job completed (`accepted` → `completed`, updates worker stats) |

### Reviews & Safety Reports
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Customer / Admin | Submit a 1–5 star rating and comment for a completed booking |
| `POST` | `/api/reports` | Bearer Token | Submit an incident report or dispute regarding a booking |

### Media Uploads (`/api/uploads`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/uploads` | Bearer Token | Multipart upload (`files`, max 6 items, ≤10MB); uploads to Cloudinary or local disk |

---

##  9. Current Limitations & Unfinished Features

To provide clear expectations, the following features are currently out of scope or part of future milestones:

1. **Integrated Digital Payments & Escrow**:
   - There is currently no active payment gateway integration (e.g., Razorpay, Stripe, or automated UPI escrow).
   - Price negotiation establishes the agreed final contract price in INR (₹); payments are currently settled offline/directly upon work completion.
2. **Voice-Assisted Speech-to-Text Input**:
   - Voice-prompt job posting in vernacular languages (Telugu and Hindi speech recognition for low-literacy artisans) is planned for future mobile iterations.
3. **Computer Vision Damage Assessment**:
   - The automated AI trade classification from uploaded photos (`POST /ai/classify-job`) is a planned stretch feature; customers currently select trade categories manually.
4. **Real-time WebSockets & Push Notifications**:
   - Booking counter-offers and status updates currently rely on REST requests and page refreshes rather than active WebSockets (`socket.io`) or SMS/WhatsApp webhooks.
5. **In-App Freeform Chat**:
   - Communication during the agreement phase is strictly structured through bilateral counter-proposals with notes and audit messages, rather than a real-time messaging chat room.
6. **Dedicated Admin Dashboard UI**:
   - Admin roles exist in the backend schema and middleware, but an administrative moderation interface for reviewing filed reports and verifying identity documents has not yet been built into the frontend.

---

##  License & Acknowledgments

This project is licensed under the ISC License.  
Developed with ❤️ by the **KaamConnect AI Team** for the hackathon.
