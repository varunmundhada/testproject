const feedbackForm = document.getElementById("feedbackForm");
const feedbackList = document.getElementById("feedbackList");
const formMessage = document.getElementById("formMessage");
const totalResponsesEl = document.getElementById("totalResponses");
const averageRatingEl = document.getElementById("averageRating");
const courseBreakdownEl = document.getElementById("courseBreakdown");
const courseFilterInput = document.getElementById("courseFilter");

let feedbackEntries = [];

async function fetchFeedback() {
  const response = await fetch("/api/feedback");
  if (!response.ok) {
    throw new Error("Unable to fetch feedback.");
  }
  feedbackEntries = await response.json();
  renderFeedback();
}

async function fetchStats() {
  const response = await fetch("/api/stats");
  if (!response.ok) {
    throw new Error("Unable to fetch stats.");
  }

  const stats = await response.json();
  totalResponsesEl.textContent = String(stats.total);
  averageRatingEl.textContent = String(stats.averageRating);

  const courses = Object.entries(stats.courses || {});
  if (courses.length === 0) {
    courseBreakdownEl.innerHTML = "<li>No data yet.</li>";
    return;
  }

  courseBreakdownEl.innerHTML = courses
    .sort((a, b) => b[1] - a[1])
    .map(([course, count]) => `<li><span>${escapeHtml(course)}</span><strong>${count}</strong></li>`)
    .join("");
}

function renderFeedback() {
  const query = courseFilterInput.value.trim().toLowerCase();
  const filtered = query
    ? feedbackEntries.filter((entry) => entry.course.toLowerCase().includes(query))
    : feedbackEntries;

  if (filtered.length === 0) {
    feedbackList.innerHTML = '<p class="empty">No feedback entries found.</p>';
    return;
  }

  feedbackList.innerHTML = filtered
    .map((entry) => {
      const date = new Date(entry.createdAt).toLocaleString();
      return `
        <article class="feedback-item">
          <h4>${escapeHtml(entry.studentName)} - ${"★".repeat(entry.rating)}</h4>
          <p class="meta">${escapeHtml(entry.course)} | ${escapeHtml(entry.email)} | ${date}</p>
          <p>${escapeHtml(entry.feedbackText)}</p>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setMessage(message, type) {
  formMessage.textContent = message;
  formMessage.classList.remove("error", "success");
  if (type) {
    formMessage.classList.add(type);
  }
}

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("", null);

  const payload = {
    studentName: feedbackForm.studentName.value,
    email: feedbackForm.email.value,
    course: feedbackForm.course.value,
    rating: feedbackForm.rating.value,
    feedbackText: feedbackForm.feedbackText.value
  };

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.message || "Failed to submit feedback.");
    }

    feedbackForm.reset();
    setMessage("Feedback submitted successfully.", "success");
    await Promise.all([fetchFeedback(), fetchStats()]);
  } catch (error) {
    setMessage(error.message, "error");
  }
});

courseFilterInput.addEventListener("input", renderFeedback);

(async function init() {
  try {
    await Promise.all([fetchFeedback(), fetchStats()]);
  } catch (error) {
    setMessage(error.message, "error");
  }
})();
