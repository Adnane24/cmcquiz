/* ---------- DATA LOADER (paste at the VERY TOP of script.js) ---------- */
/* This tries to load editable JSON files from /data/*. If they exist, they replace
   the in-memory questions/poles. If not present, the script keeps working with
   whatever is already in the file (non-destructive). */

(async function loadEditableData() {
  async function tryFetchJSON(url) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error("not found");
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  // Try load poles and questions from /data
  const [polesJSON, questionsJSON] = await Promise.all([
    tryFetchJSON("/data/poles.json"),
    tryFetchJSON("/data/questions.json"),
  ]);

  // Replace existing globals if found. These variable names are common; if your
  // script uses different names (e.g. "questions", "QUIZ_QUESTIONS", etc.) the loader
  // will try a few common names. You can add your own name to the list below.
  const possibleQuestionNames = ["questions", "QUESTIONS", "quizQuestions"];
  const possiblePoleNames = ["poles", "POLES", "departments"];

  if (Array.isArray(questionsJSON)) {
    for (const n of possibleQuestionNames) {
      if (window.hasOwnProperty(n) || typeof window[n] === "undefined") {
        window[n] = questionsJSON;
      } else {
        // still set it - in case script expects global var later
        window[n] = questionsJSON;
      }
    }
  }

  if (Array.isArray(polesJSON)) {
    for (const n of possiblePoleNames) {
      if (window.hasOwnProperty(n) || typeof window[n] === "undefined") {
        window[n] = polesJSON;
      } else {
        window[n] = polesJSON;
      }
    }
  }

  // If the main script exposes an init/start function, call it after loading.
  // Common names: initApp, init, startApp, startQuiz.
  const startFns = ["initApp", "init", "startApp", "startQuiz", "start"];
  for (const fn of startFns) {
    if (typeof window[fn] === "function") {
      // call next tick to let rest of the script initialize
      setTimeout(() => window[fn](), 50);
      break;
    }
  }
})();

// ============================================
// QCM Challenge - Complete Application Logic
// ============================================

// ============================================
// Admin Credentials
// ============================================
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "1234",
};

// ============================================
// Sample Questions Database
// ============================================
// let questions = [
//   {
//     id: 1,
//     question: "What does HTML stand for?",
//     options: [
//       "HyperText Markup Language",
//       "High Tech Modern Language",
//       "Home Tool Markup Language",
//       "Hyperlinks and Text Markup Language",
//     ],
//     correct: 0,
//   },
//   {
//     id: 2,
//     question: "Which CSS property is used to control the text size?",
//     options: ["font-style", "text-size", "font-size", "text-style"],
    correct: 2,
  },
  {
    id: 3,
    question:
      "What is the correct JavaScript syntax to change the HTML content?",
    options: [
      "document.getElementById('p').innerHTML = 'Hello'",
      "document.getElement('p').innerHTML = 'Hello'",
      "document.getElementById('p').textContent = 'Hello'",
      "None of the above",
    ],
    correct: 0,
  },
  {
    id: 4,
    question: "Which of the following is NOT a JavaScript data type?",
    options: ["String", "Number", "Boolean", "Integer"],
    correct: 3,
  },
  {
    id: 5,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Integration",
      "Application Process Interface",
      "Advanced Process Integration",
    ],
    correct: 0,
  },
  {
    id: 6,
    question: "Which HTTP method is used to retrieve data?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correct: 2,
  },
  {
    id: 7,
    question: "What is the purpose of localStorage?",
    options: [
      "To store data on the server",
      "To store data in the browser persistently",
      "To store temporary session data",
      "To encrypt data",
    ],
    correct: 1,
  },
  {
    id: 8,
    question:
      "Which framework is used for building user interfaces in JavaScript?",
    options: ["Django", "Spring Boot", "React", "Laravel"],
    correct: 2,
  },
  {
    id: 9,
    question: "What does REST stand for?",
    options: [
      "Remote Execution and Storage Transfer",
      "Representational State Transfer",
      "Resource Element Static Transfer",
      "Remote Element System Transfer",
    ],
    correct: 1,
  },
  {
    id: 10,
    question: "Which of the following is a NoSQL database?",
    options: ["PostgreSQL", "MongoDB", "MySQL", "Oracle"],
    correct: 1,
  },
];

// ============================================
// Global Variables
// ============================================
let currentUser = {
  name: "",
  pole: "",
  phone: "",
  userType: "", // "student" or "admin"
};

let quizState = {
  currentQuestion: 0,
  score: 0,
  answers: [],
  answered: false,
  timeRemaining: 120, // 2 minutes in seconds
  timerInterval: null,
};

// Poles (departments) - load from storage or fallback to defaults
// let poles = [
//   "Web Development",
//   "Mobile Development",
//   "Data Science",
//   "Cloud Computing",
//   "Cybersecurity",
// ];

async function loadPoles() {
  const response = await fetch("data/poles.json");
  const poles = await response.json();
  return poles;
}

async function loadQuestions() {
    const response = await fetch('data/questions.json');
    const questions = await response.json();
    return questions;
}

// Site settings (modifiable from admin)
let siteSettings = {
  title: "🏴‍☠️ Treasure Quest",
  primaryColor: "#d4af37",
};

// ============================================
// Page Navigation Functions
// ============================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
}

// ============================================
// Login Tab Switching
// ============================================

function switchLoginTab(tab) {
  // Hide all tabs
  document.getElementById("studentLoginTab").classList.remove("active");
  document.getElementById("adminLoginTab").classList.remove("active");

  // Remove active from all buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  if (tab === "student") {
    document.getElementById("studentLoginTab").classList.add("active");
    document.querySelectorAll(".tab-btn")[0].classList.add("active");
  } else {
    document.getElementById("adminLoginTab").classList.add("active");
    document.querySelectorAll(".tab-btn")[1].classList.add("active");
  }
}

// ============================================
// Student Login
// ============================================

function handleStudentLogin(event) {
  event.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const pole = document.getElementById("pole").value;
  const phone = document.getElementById("phoneNumber").value.trim();

  if (!name || !pole || !phone) {
    alert("Please fill all fields");
    return;
  }

  // Check if this student already completed the quiz
  const completedStudents =
    JSON.parse(localStorage.getItem("completedStudents")) || [];
  if (completedStudents.includes(name)) {
    showAlreadyPassedModal();
    return;
  }

  currentUser = { name, pole, phone, userType: "student" };

  // Save login info to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Display on student menu
  document.getElementById("welcomeName").textContent = name;
  document.getElementById("displayPole").textContent = pole;

  showPage("studentMenuPage");
  document.getElementById("studentLoginForm").reset();
}

// Replace pole display logic with async displayPoles
async function displayPoles() {
  const poleContainer = document.getElementById("pole-container");
  const poles = await loadPoles();

  poleContainer.innerHTML = "";

  poles.forEach((pole) => {
    const button = document.createElement("button");
    button.className = "pole-button";
    button.textContent = pole.name;
    button.onclick = () => startQuiz(pole.id);
    poleContainer.appendChild(button);
  });
}

displayPoles();

// ============================================
// Admin Login
// ============================================

function handleAdminLogin(event) {
  event.preventDefault();

  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  // Verify credentials
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    currentUser = { name: "Admin", userType: "admin" };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showPage("adminDashboardPage");
    refreshParticipantList();
    document.getElementById("adminLoginForm").reset();
  } else {
    alert("Invalid username or password. Demo: admin / 1234");
  }
}

// ============================================
// Logout
// ============================================

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    currentUser = { name: "", pole: "", phone: "", userType: "" };
    localStorage.removeItem("currentUser");
    showPage("loginPage");
    // Reset forms
    document.getElementById("studentLoginForm").reset();
    document.getElementById("adminLoginForm").reset();
    switchLoginTab("student");
    // Show message if student already completed quiz
    const completedStudents =
      JSON.parse(localStorage.getItem("completedStudents")) || [];
    const studentNameField = document.getElementById("studentName");
    if (
      studentNameField &&
      studentNameField.value &&
      completedStudents.includes(studentNameField.value)
    ) {
      alert("This student has already completed the QCM.");
    }
  }
}

function goToStudentMenu() {
  showPage("studentMenuPage");
}

// Go back to login page (for one-time quiz flow)
function backToLogin() {
  currentUser = { name: "", pole: "", phone: "", userType: "" };
  localStorage.removeItem("currentUser");
  showPage("loginPage");
  document.getElementById("studentLoginForm").reset();
  switchLoginTab("student");
}

// After quiz completion, go back to login
function goBackToLogin() {
  currentUser = { name: "", pole: "", phone: "", userType: "" };
  localStorage.removeItem("currentUser");
  showPage("loginPage");
  document.getElementById("studentLoginForm").reset();
  switchLoginTab("student");
}

// ============================================
// Quiz Functions
// ============================================

function startChallenge() {
  // Reset quiz state
  quizState = {
    currentQuestion: 0,
    score: 0,
    answers: [],
    answered: false,
    timeRemaining: 120, // 2 minutes
    timerInterval: null,
  };

  showPage("quizPage");
  startTimer();
  displayQuestion();
}

function displayQuestion() {
  const question = questions[quizState.currentQuestion];

  // Update progress bar
  const progress = (quizState.currentQuestion / questions.length) * 100;
  document.getElementById("progressFill").style.width = progress + "%";

  // Update question counter
  document.getElementById("currentQuestion").textContent =
    quizState.currentQuestion + 1;
  document.getElementById("totalQuestions").textContent = questions.length;

  // Display question
  document.getElementById("questionText").textContent = question.question;

  // Clear previous answers
  const container = document.getElementById("answersContainer");
  container.innerHTML = "";

  // Display answer options
  question.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = String.fromCharCode(65 + index) + ". " + option;
    btn.onclick = () => selectAnswer(index);
    btn.disabled = quizState.answered;
    container.appendChild(btn);
  });

  // Clear feedback
  document.getElementById("feedbackMessage").textContent = "";
  document.getElementById("feedbackMessage").className = "feedback";
}

// ============================================
// Timer Functions
// ============================================

function startTimer() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
  }

  quizState.timerInterval = setInterval(() => {
    quizState.timeRemaining--;
    updateTimerDisplay();

    if (quizState.timeRemaining <= 0) {
      clearInterval(quizState.timerInterval);
      endQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(quizState.timeRemaining / 60);
  const seconds = quizState.timeRemaining % 60;

  document.getElementById("timerMinutes").textContent = minutes
    .toString()
    .padStart(2, "0");
  document.getElementById("timerSeconds").textContent = seconds
    .toString()
    .padStart(2, "0");

  // Change color if time is running out
  const timerDisplay = document.querySelector(".timer-display");
  if (quizState.timeRemaining <= 30) {
    timerDisplay.style.color = "#ef4444"; // Red
  } else if (quizState.timeRemaining <= 60) {
    timerDisplay.style.color = "#f59e0b"; // Orange
  }
}

function selectAnswer(selectedIndex) {
  if (quizState.answered) return;

  const question = questions[quizState.currentQuestion];
  const isCorrect = selectedIndex === question.correct;

  quizState.answered = true;
  quizState.answers.push({
    question: question.id,
    selected: selectedIndex,
    correct: isCorrect,
  });

  if (isCorrect) {
    quizState.score++;
  }

  // Update UI - disable buttons after selection
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach((btn, index) => {
    btn.disabled = true;
  });

  // Move to next question automatically
  setTimeout(() => {
    if (quizState.currentQuestion < questions.length - 1) {
      quizState.currentQuestion++;
      quizState.answered = false;
      displayQuestion();
    } else {
      finishQuiz();
    }
  }, 1000); // Move to next question after 1 second
}

function finishQuiz() {
  // Save score to participants list
  clearInterval(quizState.timerInterval);
  saveParticipantScore();

  // Mark student as completed (one-time quiz)
  const completedStudents =
    JSON.parse(localStorage.getItem("completedStudents")) || [];
  if (!completedStudents.includes(currentUser.name)) {
    completedStudents.push(currentUser.name);
    localStorage.setItem(
      "completedStudents",
      JSON.stringify(completedStudents)
    );
  }

  // Display results
  document.getElementById("resultName").textContent = currentUser.name;
  document.getElementById("finalScore").textContent = quizState.score;

  const percentage = Math.round((quizState.score / questions.length) * 100);
  document.getElementById("scorePercentage").textContent = percentage + "%";

  showPage("resultsPage");
}

function skipQuestion() {
  if (quizState.answered) return;

  // Mark as answered but don't add to score
  quizState.answered = true;

  // Move to next question
  if (quizState.currentQuestion < questions.length - 1) {
    quizState.currentQuestion++;
    quizState.answered = false;
    displayQuestion();
  } else {
    finishQuiz();
  }
}

function endQuiz() {
  if (confirm("Are you sure you want to end the quiz?")) {
    clearInterval(quizState.timerInterval);
    finishQuiz();
  }
}

function restartQuiz() {
  quizState = {
    currentQuestion: 0,
    score: 0,
    answers: [],
    answered: false,
    timeRemaining: 120,
    timerInterval: null,
  };

  showPage("quizPage");
  startTimer();
  displayQuestion();
}

// ============================================
// Participants/Leaderboard Functions
// ============================================

function saveParticipantScore() {
  const participants = JSON.parse(localStorage.getItem("participants")) || [];

  const entry = {
    name: currentUser.name,
    pole: currentUser.pole,
    phone: currentUser.phone,
    score: quizState.score,
    maxScore: questions.length,
    percentage: Math.round((quizState.score / questions.length) * 100),
    dateSubmitted: new Date().toLocaleString(),
  };

  participants.push(entry);
  localStorage.setItem("participants", JSON.stringify(participants));
}

function viewLeaderboard() {
  const participants = JSON.parse(localStorage.getItem("participants")) || [];
  const container = document.getElementById("leaderboardContent");

  // Sort by score (descending)
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
  });

  if (sorted.length === 0) {
    container.innerHTML =
      '<div class="empty-leaderboard"><p>No scores yet. Start a quiz to appear on the leaderboard!</p></div>';
  } else {
    let html = "";

    sorted.forEach((entry, index) => {
      const medals = ["🥇", "🥈", "🥉"];
      const rank = medals[index] || index + 1;

      html += `
                <div class="leaderboard-entry">
                    <div class="leaderboard-rank">${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.name}</div>
                        <div class="leaderboard-pole">${entry.pole}</div>
                    </div>
                    <div class="leaderboard-score">${entry.score}/${entry.maxScore}</div>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  showPage("leaderboardPage");
}

// ============================================
// Admin Functions
// ============================================

function refreshParticipantList() {
  const participants = JSON.parse(localStorage.getItem("participants")) || [];
  // New grouped display by pole
  const container = document.getElementById("participantGroups");
  const emptyMsg = document.getElementById("participantGroupsEmpty");

  if (participants.length === 0) {
    container.innerHTML = "";
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";

    // Group participants by pole
    const groups = participants.reduce((acc, p) => {
      const pole = p.pole || "Unknown";
      if (!acc[pole]) acc[pole] = [];
      acc[pole].push(p);
      return acc;
    }, {});

    // Sort poles alphabetically
    const poles = Object.keys(groups).sort((a, b) => a.localeCompare(b));

    // Build HTML for groups
    let html = "";
    poles.forEach((pole, idx) => {
      const list = groups[pole]
        // sort by percentage desc then date
        .sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return new Date(b.dateSubmitted) - new Date(a.dateSubmitted);
        });

      html += `
                <div class="pole-group">
                    <button class="pole-header" onclick="togglePoleGroup(${idx})">
                        <span class="pole-name">${pole}</span>
                        <span class="pole-count">(${list.length})</span>
                        <span class="pole-chevron">▸</span>
                    </button>
                    <div class="pole-body" id="pole-body-${idx}">
                        <table class="admin-table admin-table--compact">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Score</th>
                                    <th>%</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list
                                  .map(
                                    (entry, i) => `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td>${entry.name}</td>
                                        <td>${entry.phone}</td>
                                        <td><strong>${entry.score}/${
                                      entry.maxScore
                                    }</strong></td>
                                        <td>${entry.percentage}%</td>
                                        <td>${entry.dateSubmitted}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  // Update stats
  updateAdminStats(participants);
}

// Toggle visibility of a pole group
function togglePoleGroup(idx) {
  const body = document.getElementById(`pole-body-${idx}`);
  const header = body ? body.previousElementSibling : null;
  if (!body || !header) return;

  const chevron = header.querySelector(".pole-chevron");
  if (body.style.display === "none" || body.style.display === "") {
    body.style.display = "block";
    chevron.textContent = "▾";
  } else {
    body.style.display = "none";
    chevron.textContent = "▸";
  }
}

function updateAdminStats(participants) {
  document.getElementById("totalParticipants").textContent =
    participants.length;

  if (participants.length > 0) {
    const avgScore = Math.round(
      participants.reduce((sum, p) => sum + p.percentage, 0) /
        participants.length
    );
    const highestScore = Math.max(...participants.map((p) => p.score));

    document.getElementById("averageScore").textContent = avgScore + "%";
    document.getElementById("highestScore").textContent = highestScore;
  } else {
    document.getElementById("averageScore").textContent = "0%";
    document.getElementById("highestScore").textContent = "0";
  }
}

function clearAllResults() {
  if (
    confirm(
      "Are you sure you want to clear ALL results? This cannot be undone!"
    )
  ) {
    localStorage.removeItem("participants");
    refreshParticipantList();
    alert("All results have been cleared.");
  }
}

/* ============================================
   Poles Manager
   ============================================ */

function openPolesManager(closeOnly) {
  const manager = document.getElementById("polesManager");
  if (!manager) return;
  if (closeOnly) {
    manager.style.display = "none";
    return;
  }
  manager.style.display = manager.style.display === "block" ? "none" : "block";
  if (manager.style.display === "block") renderPolesManager();
}

function renderPolesManager() {
  const tbody = document.getElementById("polesTableBody");
  if (!tbody) return;
  const participants = JSON.parse(localStorage.getItem("participants")) || [];
  if (!poles || poles.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center; color:#999;">No poles configured</td></tr>';
    return;
  }

  tbody.innerHTML = poles
    .map((p, idx) => {
      const count = participants.filter((pt) => pt.pole === p).length;
      return `
            <tr>
                <td>${idx + 1}</td>
                <td>${escapeHtml(p)}</td>
                <td>${count}</td>
                <td>
                    <button class="btn btn-secondary" onclick="showPoleForm('edit', ${idx})">Edit</button>
                    <button class="btn btn-danger" onclick="deletePole(${idx})">Delete</button>
                </td>
            </tr>
        `;
    })
    .join("");
}

let poleEditIndex = -1;
function showPoleForm(mode, idx) {
  poleEditIndex = typeof idx === "number" ? idx : -1;
  document.getElementById("poleForm").style.display = "block";
  if (mode === "edit" && poleEditIndex >= 0) {
    document.getElementById("poleName").value = poles[poleEditIndex];
  } else {
    document.getElementById("poleName").value = "";
  }
}

function hidePoleForm() {
  document.getElementById("poleForm").style.display = "none";
  poleEditIndex = -1;
}

function savePoleForm() {
  const name = document.getElementById("poleName").value.trim();
  if (!name) {
    alert("Enter a pole name");
    return;
  }
  if (poleEditIndex >= 0) {
    poles[poleEditIndex] = name;
  } else {
    if (poles.includes(name)) {
      alert("Crew already exists");
      return;
    }
    poles.push(name);
  }
  localStorage.setItem("poles", JSON.stringify(poles));
  displayPoles();
  renderPolesManager();
  hidePoleForm();
}

function deletePole(idx) {
  const name = poles[idx];
  if (
    !confirm(`Delete crew "${name}"? This will not remove participant records.`)
  )
    return;
  poles.splice(idx, 1);
  localStorage.setItem("poles", JSON.stringify(poles));
  displayPoles();
  renderPolesManager();
}

/* ============================================
   Site Settings
   ============================================ */

function openSiteSettings(closeOnly) {
  const panel = document.getElementById("siteSettings");
  if (!panel) return;
  if (closeOnly) {
    panel.style.display = "none";
    return;
  }
  panel.style.display = panel.style.display === "block" ? "none" : "block";
  if (panel.style.display === "block") {
    document.getElementById("siteTitleInput").value = siteSettings.title || "";
    document.getElementById("sitePrimaryColor").value =
      siteSettings.primaryColor || "";
  }
}

function saveSiteSettings() {
  const title = document.getElementById("siteTitleInput").value.trim();
  const color = document.getElementById("sitePrimaryColor").value.trim();
  if (title) siteSettings.title = title;
  if (color) siteSettings.primaryColor = color;
  localStorage.setItem("siteSettings", JSON.stringify(siteSettings));
  // Apply immediately
  document.title = siteSettings.title;
  document
    .querySelectorAll(".login-header h1")
    .forEach((h) => (h.textContent = siteSettings.title));
  document.documentElement.style.setProperty(
    "--primary-color",
    siteSettings.primaryColor
  );
  alert("Ship settings saved.");
}

function resetSiteSettings() {
  if (!confirm("Reset ship settings to defaults?")) return;
  siteSettings = { title: "🏴‍☠️ Treasure Quest", primaryColor: "#d4af37" };
  localStorage.removeItem("siteSettings");
  document.title = siteSettings.title;
  document
    .querySelectorAll(".login-header h1")
    .forEach((h) => (h.textContent = siteSettings.title));
  document.documentElement.style.setProperty(
    "--primary-color",
    siteSettings.primaryColor
  );
  alert("Ship settings reset.");
}

/* ============================================
   Questions Manager (Admin)
   ============================================ */

function openQuestionsManager(closeOnly) {
  const manager = document.getElementById("questionsManager");
  if (!manager) return;
  if (closeOnly) {
    manager.style.display = "none";
    return;
  }
  manager.style.display =
    manager.style.display === "none" || manager.style.display === ""
      ? "block"
      : "none";
  if (manager.style.display === "block") {
    renderQuestionsManager();
  }
}

function renderQuestionsManager() {
  const tbody = document.getElementById("questionsTableBody");
  if (!tbody) return;

  if (!questions || questions.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center; color:#999;">No questions</td></tr>';
    return;
  }

  tbody.innerHTML = questions
    .map(
      (q, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td style="max-width:400px;">${escapeHtml(q.question)}</td>
            <td>${q.options
              .map(
                (o, i) =>
                  `<div><strong>${String.fromCharCode(
                    65 + i
                  )}.</strong> ${escapeHtml(o)}</div>`
              )
              .join("")}</td>
            <td>${String.fromCharCode(65 + q.correct)}</td>
            <td>
                <button class="btn btn-secondary" onclick="showQuestionForm('edit', ${idx})">Edit</button>
                <button class="btn btn-danger" onclick="deleteQuestion(${idx})">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

let questionFormMode = "add";
let questionEditIndex = -1;

function showQuestionForm(mode, idx) {
  questionFormMode = mode;
  questionEditIndex = typeof idx === "number" ? idx : -1;
  document.getElementById("questionForm").style.display = "block";

  if (mode === "edit" && idx >= 0 && questions[idx]) {
    const q = questions[idx];
    document.getElementById("qText").value = q.question;
    document.getElementById("qOpt0").value = q.options[0] || "";
    document.getElementById("qOpt1").value = q.options[1] || "";
    document.getElementById("qOpt2").value = q.options[2] || "";
    document.getElementById("qOpt3").value = q.options[3] || "";
    document.getElementById("qCorrect").value = q.correct;
  } else {
    document.getElementById("qText").value = "";
    document.getElementById("qOpt0").value = "";
    document.getElementById("qOpt1").value = "";
    document.getElementById("qOpt2").value = "";
    document.getElementById("qOpt3").value = "";
    document.getElementById("qCorrect").value = 0;
  }
}

function hideQuestionForm() {
  document.getElementById("questionForm").style.display = "none";
  questionFormMode = "add";
  questionEditIndex = -1;
}

function saveQuestionForm() {
  const text = document.getElementById("qText").value.trim();
  const opt0 = document.getElementById("qOpt0").value.trim();
  const opt1 = document.getElementById("qOpt1").value.trim();
  const opt2 = document.getElementById("qOpt2").value.trim();
  const opt3 = document.getElementById("qOpt3").value.trim();
  const correct = parseInt(document.getElementById("qCorrect").value, 10);

  if (
    !text ||
    !opt0 ||
    !opt1 ||
    !opt2 ||
    !opt3 ||
    isNaN(correct) ||
    correct < 0 ||
    correct > 3
  ) {
    alert("Please fill all riddle fields and set the treasure clue (0-3).");
    return;
  }

  const qObj = {
    id: Date.now(),
    question: text,
    options: [opt0, opt1, opt2, opt3],
    correct: correct,
  };

  if (questionFormMode === "edit" && questionEditIndex >= 0) {
    questions[questionEditIndex] = qObj;
  } else {
    questions.push(qObj);
  }

  saveQuestionsToStorage();
  hideQuestionForm();
  renderQuestionsManager();
}

function deleteQuestion(idx) {
  if (!confirm("Delete this question?")) return;
  questions.splice(idx, 1);
  saveQuestionsToStorage();
  renderQuestionsManager();
}

function saveQuestionsToStorage() {
  try {
    localStorage.setItem("questions", JSON.stringify(questions));
    alert("Questions saved.");
  } catch (e) {
    console.error("Failed to save questions:", e);
    alert("Failed to save questions. See console.");
  }
}

// small helper to avoid XSS in table render
function escapeHtml(unsafe) {
  return (unsafe + "").replace(/[&<>"'`]/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
    }[m];
  });
}
document.addEventListener("DOMContentLoaded", () => {
  // Check if user was previously logged in
  const savedUser = localStorage.getItem("currentUser");
  // Load persisted questions if present
  const savedQuestions = localStorage.getItem("questions");
  if (savedQuestions) {
    try {
      const parsed = JSON.parse(savedQuestions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved questions:", e);
    }
  }
  // Load persisted poles
  const savedPoles = localStorage.getItem("poles");
  if (savedPoles) {
    try {
      const parsed = JSON.parse(savedPoles);
      if (Array.isArray(parsed) && parsed.length > 0) poles = parsed;
    } catch (e) {
      console.error("Failed to parse saved poles:", e);
    }
  }

  // Load site settings
  const savedSettings = localStorage.getItem("siteSettings");
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed && typeof parsed === "object")
        siteSettings = Object.assign(siteSettings, parsed);
    } catch (e) {
      console.error("Failed to parse site settings:", e);
    }
  }

  // Apply site settings (title and primary color)
  document.title = siteSettings.title || document.title;
  const h1s = document.querySelectorAll(".login-header h1");
  h1s.forEach((h) => (h.textContent = siteSettings.title));
  document.documentElement.style.setProperty(
    "--primary-color",
    siteSettings.primaryColor ||
      getComputedStyle(document.documentElement).getPropertyValue(
        "--primary-color"
      )
  );

  // Populate pole select options
  displayPoles();

  if (savedUser) {
    const user = JSON.parse(savedUser);
    currentUser = user;

    if (user.userType === "student") {
      document.getElementById("welcomeName").textContent = user.name;
      document.getElementById("displayPole").textContent = user.pole;
      showPage("studentMenuPage");
    } else if (user.userType === "admin") {
      showPage("adminDashboardPage");
      refreshParticipantList();
    }
  } else {
    showPage("loginPage");
  }
});

/* ============================================
   Custom Modal for Already Passed Message
   ============================================ */

function showAlreadyPassedModal() {
  const modal = document.getElementById("alreadyPassedModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeAlreadyPassedModal() {
  const modal = document.getElementById("alreadyPassedModal");
  if (modal) {
    modal.style.display = "none";
  }
}

async function startQuiz(poleId) {
    const questions = await loadQuestions();

    // show only questions for this pole
    const filtered = questions.filter(q => q.pole === poleId);

    currentQuestions = filtered;
    currentIndex = 0;

    showQuestion();
}
