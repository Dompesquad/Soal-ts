import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { studentNames, soalAIK } from "./data.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDQ2UCP4tQpAxAlTh2WlUqA7IMaN02ytg0",
  authDomain: "praktek-ts-mts.firebaseapp.com",
  databaseURL: "https://praktek-ts-mts-default-rtdb.firebaseio.com",
  projectId: "praktek-ts-mts",
  storageBucket: "praktek-ts-mts.appspot.com",
  messagingSenderId: "191568130393",
  appId: "1:191568130393:web:a7aa69e97c17dbf6fa2fe1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elemen DOM
const startContainer = document.getElementById("start-container");
const quizContainer = document.getElementById("quiz-container");
const submitBtn = document.getElementById("submit-btn");
const questionsDiv = document.getElementById("questions");
const scoreDiv = document.getElementById("score");
const nameSelect = document.getElementById("student-name");

// Inisialisasi dropdown nama
studentNames.forEach(name => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  nameSelect.appendChild(option);
});

// Variabel kuis
let currentIndex = 0;
let score = 0;
let selectedName = "";
let leftPage = false;
let answers = [];

// Fungsi tampilkan soal
function displayQuestions() {
  questionsDiv.innerHTML = "";
  const currentQuestions = soalAIK.slice(currentIndex, currentIndex + 10);

  currentQuestions.forEach((soal, index) => {
    const div = document.createElement("div");
    div.classList.add("question-block");
    div.innerHTML = `<p>${currentIndex + index + 1}. ${soal.question}</p>`;

    Object.entries(soal.options).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${index}`;
      input.value = key;

      const label = document.createElement("label");
      label.textContent = value;

      div.appendChild(input);
      div.appendChild(label);
      div.appendChild(document.createElement("br"));
    });

    questionsDiv.appendChild(div);
  });
}

// Fungsi periksa jawaban
function checkAnswers() {
  const currentQuestions = soalAIK.slice(currentIndex, currentIndex + 10);
  currentQuestions.forEach((soal, index) => {
    const radios = document.getElementsByName(`question-${index}`);
    let selected = null;
    radios.forEach(r => {
      if (r.checked) selected = r.value;
    });
    answers.push(selected);
    if (selected === soal.answer) score += 2;
  });
}

// Submit soal per halaman
submitBtn.addEventListener("click", () => {
  checkAnswers();
  currentIndex += 10;

  if (currentIndex >= soalAIK.length || leftPage) {
    showScore();
  } else {
    displayQuestions();
  }
});

// Tampilkan skor akhir
function showScore() {
  quizContainer.style.display = "none";
  scoreDiv.style.display = "block";

  const finalScore = leftPage ? 0 : score;
  scoreDiv.innerHTML = `<h2>Skor Anda: ${finalScore} dari 100</h2>`;

  // Simpan ke Firebase
  if (selectedName) {
    set(ref(db, `nilai/${selectedName}`), {
      AIK: finalScore
    });
  }
}

// Tombol mulai
document.getElementById("start-btn").addEventListener("click", () => {
  selectedName = nameSelect.value;
  if (!selectedName) {
    alert("Silakan pilih nama terlebih dahulu.");
    return;
  }

  startContainer.style.display = "none";
  quizContainer.style.display = "block";
  displayQuestions();
});

// Anti-cheating: keluar halaman/tab
window.onblur = () => {
  if (!leftPage && quizContainer.style.display === "block") {
    leftPage = true;
    alert("Anda keluar dari halaman! Nilai Anda akan menjadi 0.");
    showScore();
  }
};
