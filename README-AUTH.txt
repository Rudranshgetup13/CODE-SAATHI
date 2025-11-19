# Code Saathi

**Collaborative problem-solving platform for learners, developers, and problem‑solvers.**

---

## Table of Contents

* [About](#about)
* [Project Concept](#project-concept)
* [Current Status](#current-status)
* [Key Features](#key-features)
* [Tech Stack (suggested)](#tech-stack-suggested)
* [Folder Structure (example)](#folder-structure-example)
* [Installation & Setup](#installation--setup)

  * [Frontend (static)](#frontend-static)
  * [Local dev with Node.js backend (recommended)](#local-dev-with-nodejs-backend-recommended)
* [Usage](#usage)
* [API / Data Model (preview)](#api--data-model-preview)
* [Matching & Scoring — conceptual](#matching--scoring--conceptual)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## About

Code Saathi ("Code Companion") is a community-driven platform that helps developers and students get unstuck by connecting problem-posters with skilled solvers. Posters can upload or describe coding issues and set deadlines and budgets. Solvers with matching expertise can claim and deliver solutions — earning rewards and reputation.

## Project Concept

* Users post problems (code snippet, description, files, expected output).
* Solvers browse problems filtered by category, difficulty and ETA.
* Platform matches problems with solvers by skills and availability.
* Time-bound deliveries with optional payments handled through a gateway (Razorpay / Stripe).

## Current Status

You currently have a frontend prototype built with HTML/CSS/JavaScript (static pages). The project will be developed iteratively: start with the basic posting/solver workflow, then add authentication, payments, dashboards, and scoring.

## Key Features

* Problem posting (text + file upload + tags)
* Solver discovery (search & filters by skill/difficulty)
* Solver dashboard to accept and submit solutions
* Time-bound deliveries and simple milestone/payment flow
* User accounts, profiles, and reputation points
* Admin dashboard for moderation and dispute handling

## Tech Stack (suggested)

* Frontend: HTML, CSS, JavaScript (progress to React or Vue for dynamic UI)
* Backend: Node.js + Express (or Python Flask/Django)
* Database: MongoDB (NoSQL) or MySQL/Postgres (relational)
* Payments: Razorpay / Stripe
* Authentication: JWT (API) + secure password hashing (bcrypt)
* Hosting: Vercel / Netlify (frontend), Heroku / Render / DigitalOcean / Railway (backend)

## Folder Structure (example - based on your uploaded project screenshot)

```
project/
├─ css/
├─ img/
├─ script/      # small per-page scripts
├─ scripts/     # shared utility scripts
├─ asker.html
├─ dashboard.html
├─ homepage.html
├─ login.html
├─ register.html
├─ solver.html
├─ solverdashboard.html
├─ README-AUTH.md
```

*(Adjust names and structure as you migrate to a framework — e.g. `src/components`, `src/pages` for React.)*

---

## Installation & Setup

Below are two quick ways to run the project locally.

### Frontend (static)

If you only have static HTML/CSS/JS pages and want to preview locally:

```bash
# from the project directory
# Option A (Python 3):
python -m http.server 8000
# open http://localhost:8000 in your browser

# Option B (npm):
npm install -g serve
serve .
```

### Local dev with Node.js backend (recommended)

This describes a minimal Node/Express + MongoDB setup for full functionality.

1. Create a backend folder and initialize:

```bash
mkdir backend && cd backend
npm init -y
npm i express mongoose cors dotenv bcrypt jsonwebtoken multer
```

2. Example `.env` (create in backend folder):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/code_saathi
JWT_SECRET=your_jwt_secret_here
PAYMENT_KEY=your_payment_key_here
```

3. Run MongoDB locally (or use MongoDB Atlas)
4. Start backend:

```bash
node index.js
# or during development
npm i -D nodemon
npx nodemon index.js
```

5. Update the frontend to call API endpoints (CORS must be enabled on the backend).

---

## Usage

1. Open the homepage and create an account (register).
2. As a Poster: create a new problem, describe the issue, attach files, set deadline & budget.
3. As a Solver: browse problems, view details, accept a task, submit solution.
4. Project owner reviews the solution; approve or request changes. If using payments, release funds on approval.

---

## API / Data Model (preview)

### Collections (MongoDB-style)

* **users**: `_id, name, email, passwordHash, role (poster/solver), skills[], rating, walletBalance`
* **problems**: `_id, title, description, tags[], files[], posterId, difficulty, budget, deadline, status`
* **solutions**: `_id, problemId, solverId, files[], message, submittedAt, status, review, payoutAmount`
* **transactions**: `_id, fromUserId, toUserId, amount, status, createdAt`

### Example endpoints

* `POST /api/auth/register` — register user
* `POST /api/auth/login` — login
* `GET /api/problems` — list problems (filters)
* `POST /api/problems` — create problem (authenticated)
* `POST /api/problems/:id/solutions` — submit solution
* `POST /api/payments/create` — create payment intent

---

## Matching & Scoring — conceptual

* Tag/skill match: measure overlap between problem tags and solver skills.
* Reputation: give weight to solver rating and past completion speed.
* Availability & ETA: factor in solver declared ETA and current load.
* A simple score formula to start: `score = w1 * skillMatch + w2 * rating + w3 * (1 - avgCompletionTimeNormalized)`

---

## Roadmap (short-term)

1. Build basic posting & solver-accept workflow (MVP).
2. Add authentication and user profiles.
3. Implement simple payments & escrow (Stripe/Razorpay sandbox).
4. Add solver dashboard, notifications, and file uploads.
5. Introduce reputation/ratings and automated matching.

## Contributing

* Create an issue describing the feature/bug.
* Fork the repo, create a branch, and submit a PR.
* Follow the code style used in the project. Keep changes focused and documented.

## License

This project is released under the **MIT License**. See `LICENSE` for details.

---

## Contact

Project: **Code Saathi** — collaborate, learn, and earn together.
If you want me to tailor this README further (shorter/longer, different tech choices, or include exact commands for your environment), tell me which parts to change and I will update it.
