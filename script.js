import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { studentNames, soalAIK } from "./data.js";

// Firebase setup
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

// Elemen UI
const nameSelect = document.getElementById("student-name");
const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const soalContainer = document.getElementById("question-container");
const resultScreen = document.getElementById("result-screen");
const scoreDisplay = document.getElementById("score");

// Variabel kuis
let currentPage = 0;
let answers = [];
let selectedStudent = "";
let hasCheated = false;

// Tampilkan nama siswa
studentNames.forEach(name => {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  nameSelect.appendChild(opt);
});

// Anti-cheating
let hasBlurred = false;
window.onblur = () => {
  if (!hasBlurred) {
    hasBlurred = true;
    hasCheated = true;
    alert("Kamu meninggalkan halaman! Nilai langsung 0.");
    endQuiz();
  }
};

document.addEventListener("visibilitychange", () => {
  if (document.hidden && !hasBlurred) {
    hasBlurred = true;
    hasCheated = true;
    alert("Kamu membuka tab lain! Nilai langsung 0.");
    endQuiz();
  }
});

// Mulai kuis
startBtn.addEventListener("click", () => {
  selectedStudent = nameSelect.value;
  if (!selectedStudent) {
    alert("Silakan pilih nama siswa.");
    return;
  }
  document.getElementById("start-container").style.display = "none";
  quizContainer.style.display = "block";
  renderQuestions();
});

window.nextPage = function () {
  saveAnswers();
  currentPage++;
  if (currentPage * 10 >= soalAIK.length) {
    endQuiz();
  } else {
    renderQuestions();
  }
};

function renderQuestions() {
  soalContainer.innerHTML = "";
  const start = currentPage * 10;
  const end = Math.min(start + 10, soalAIK.length);

  soalAIK.slice(start, end).forEach((q, i) => {
    const idx = start + i;
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<p><b>${idx + 1}. ${q.question}</b></p>` +
      Object.entries(q.options).map(([k, v]) => `
        <label><input type="radio" name="q${idx}" value="${k}" ${answers[idx] === k ? "checked" : ""}>
        ${k.toUpperCase()}. ${v}</label><br>
      `).join("");
    soalContainer.appendChild(div);
  });
}

function saveAnswers() {
  const start = currentPage * 10;
  const end = Math.min(start + 10, soalAIK.length);

  for (let i = start; i < end; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    answers[i] = selected ? selected.value : null;
  }
}

function endQuiz() {
  saveAnswers(); // pastikan jawaban halaman terakhir tersimpan
  quizContainer.style.display = "none";
  resultScreen.style.display = "block";

  let score = 0;
  if (!hasCheated) {
    soalAIK.forEach((s, i) => {
      if (answers[i] === s.answer) score += 2;
    });
  }

  scoreDisplay.textContent = score;

  // Simpan nilai ke Firebase
  const studentRef = doc(db, "nilai", selectedStudent);
  setDoc(studentRef, { AIK: score }, { merge: true })
    .then(() => console.log("Nilai disimpan"))
    .catch(err => console.error("Gagal menyimpan nilai:", err));
}
