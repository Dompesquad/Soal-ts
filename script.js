// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBr0SJYDWMkEnKHu-oHZFBJjz3IjhKXtdw",
  authDomain: "praktek-ts-mts.firebaseapp.com",
  projectId: "praktek-ts-mts",
  storageBucket: "praktek-ts-mts.appspot.com",
  messagingSenderId: "256342176188",
  appId: "1:256342176188:web:700dc0e1226a71d89f3bb9"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data siswa dan soal
import { studentNames, soalAIK } from "./data.js";

const nameSelect = document.getElementById("student-name");
const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const soalContainer = document.getElementById("questions");
const submitBtn = document.getElementById("submit-btn");
const scoreContainer = document.getElementById("score");

let currentPage = 0;
let userAnswers = {};
let cheatingDetected = false;

// Isi dropdown nama
studentNames.forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  nameSelect.appendChild(opt);
});

// Anti-cheating logic
let hasBlurred = false;
window.onblur = () => {
  if (!hasBlurred) {
    hasBlurred = true;
    cheatingDetected = true;
    alert("Kamu meninggalkan halaman. Nilai langsung 0.");
    endQuiz();
  }
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !hasBlurred) {
    hasBlurred = true;
    cheatingDetected = true;
    alert("Kamu beralih tab. Nilai langsung 0.");
    endQuiz();
  }
});

startBtn.addEventListener("click", () => {
  if (nameSelect.value === "") {
    alert("Pilih nama dulu.");
    return;
  }
  document.getElementById("start-container").style.display = "none";
  quizContainer.style.display = "block";
  renderQuestions();
});

submitBtn.addEventListener("click", () => {
  if ((currentPage + 1) * 10 >= soalAIK.length) {
    endQuiz();
  } else {
    currentPage++;
    renderQuestions();
  }
});

function renderQuestions() {
  soalContainer.innerHTML = "";
  const start = currentPage * 10;
  const end = start + 10;
  const questions = soalAIK.slice(start, end);

  questions.forEach((q, index) => {
    const qIndex = start + index;
    const qDiv = document.createElement("div");
    qDiv.className = "question";
    qDiv.innerHTML = `<p>${qIndex + 1}. ${q.question}</p>`;
    for (let [key, val] of Object.entries(q.options)) {
      qDiv.innerHTML += `
        <label>
          <input type="radio" name="q${qIndex}" value="${key}">
          ${key.toUpperCase()}. ${val}
        </label><br>`;
    }
    soalContainer.appendChild(qDiv);
  });
}

function endQuiz() {
  quizContainer.style.display = "none";
  let score = 0;

  if (!cheatingDetected) {
    const inputs = document.querySelectorAll("input[type='radio']:checked");
    inputs.forEach(input => {
      const index = parseInt(input.name.substring(1));
      if (input.value === soalAIK[index].answer) score += 2;
    });
  }

  scoreContainer.innerHTML = `Skor: ${score}`;
  scoreContainer.style.display = "block";

  const studentDoc = doc(db, "nilai", nameSelect.value);
  setDoc(studentDoc, { AIK: score }, { merge: true })
    .then(() => console.log("Nilai disimpan"))
    .catch(err => console.error("Gagal simpan", err));
}
