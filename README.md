# Student Feedback Web App

A full-stack web application to collect and review student feedback.

## Features

- Submit feedback with validation
- View all recent feedback entries
- Filter entries by course
- Live stats: total feedback count, average rating, and per-course breakdown
- Responsive UI for desktop and mobile

## Tech Stack

- Backend: Node.js + Express
- Frontend: HTML, CSS, Vanilla JavaScript
- Data storage: local JSON file (`data/feedback.json`)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open your browser:

- http://localhost:3000

## API Endpoints

- `GET /api/feedback` - list all feedback entries
- `POST /api/feedback` - submit a new feedback entry
- `GET /api/stats` - fetch aggregate stats

## Sample JSON for POST /api/feedback

```json
{
  "studentName": "Alex",
  "email": "alex@example.com",
  "course": "DevOps",
  "rating": 5,
  "feedbackText": "The labs were practical and very helpful."
}
```
