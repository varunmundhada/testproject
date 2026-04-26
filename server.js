const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "feedback.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function readFeedback() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function writeFeedback(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

function validateFeedback(payload) {
  const { studentName, email, course, rating, feedbackText } = payload;

  if (!studentName || typeof studentName !== "string" || studentName.trim().length < 2) {
    return "Student name must be at least 2 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return "Please provide a valid email address.";
  }

  if (!course || typeof course !== "string" || course.trim().length < 2) {
    return "Course name must be at least 2 characters.";
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return "Rating must be a whole number between 1 and 5.";
  }

  if (!feedbackText || typeof feedbackText !== "string" || feedbackText.trim().length < 10) {
    return "Feedback must be at least 10 characters.";
  }

  return null;
}

app.get("/api/feedback", (req, res) => {
  try {
    const entries = readFeedback();
    const sorted = [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: "Failed to read feedback entries." });
  }
});

app.post("/api/feedback", (req, res) => {
  const errorMessage = validateFeedback(req.body);
  if (errorMessage) {
    return res.status(400).json({ message: errorMessage });
  }

  try {
    const entries = readFeedback();
    const newEntry = {
      id: Date.now().toString(),
      studentName: req.body.studentName.trim(),
      email: req.body.email.trim().toLowerCase(),
      course: req.body.course.trim(),
      rating: Number(req.body.rating),
      feedbackText: req.body.feedbackText.trim(),
      createdAt: new Date().toISOString()
    };

    entries.push(newEntry);
    writeFeedback(entries);

    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save feedback entry." });
  }
});

app.get("/api/stats", (req, res) => {
  try {
    const entries = readFeedback();
    const total = entries.length;
    const averageRating =
      total === 0
        ? 0
        : Number((entries.reduce((sum, item) => sum + Number(item.rating), 0) / total).toFixed(2));

    const courses = entries.reduce((acc, item) => {
      acc[item.course] = (acc[item.course] || 0) + 1;
      return acc;
    }, {});

    res.json({ total, averageRating, courses });
  } catch (error) {
    res.status(500).json({ message: "Failed to compute stats." });
  }
});

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`Student Feedback app running on http://localhost:${PORT}`);
});
