import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config Anda
const firebaseConfig = {
  apiKey: "AIzaSyBr0SJYDWMkEnKHu-oHZFBJjz3IjhKXtdw",
  authDomain: "praktek-ts-mts.firebaseapp.com",
  projectId: "praktek-ts-mts",
  storageBucket: "praktek-ts-mts.appspot.com",
  messagingSenderId: "256342176188",
  appId: "1:256342176188:web:700dc0e1226a71d89f3bb9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Ambil elemen
const startBtn = document.getElementById("start-btn");
const studentSelect = document.getElementById("student-name");
const quizContainer = document.getElementById("quiz-container");
const questionsDiv = document.getElementById("questions");
const submitBtn = document.getElementById("submit-btn");
const scoreDiv = document.getElementById("score");

// Load nama siswa
namaSiswa.forEach(nama => {
  const opt = document.createElement("option");
  opt.value = nama;
  opt.textContent = nama;
  studentSelect.appendChild(opt);
});

// Variabel soal
let currentPage = 0;
const questionsPerPage = 10;
let totalCorrect = 0;
let hasCheated = false;

// Anti-cheating
let lostFocusCount = 0;
window.onblur = () => {
  lostFocusCount++;
  if (lostFocusCount >= 1 && !hasCheated) {
    hasCheated = true;
    alert("Anda meninggalkan halaman. Nilai Anda menjadi 0.");
  }
};

// Acak soal
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}
const soal = shuffleArray(soalAIK); // soalAIK dari data.js

// Tampilkan soal per halaman
function showQuestions(page) {
  questionsDiv.innerHTML = "";
  const start = page * questionsPerPage;
  const end = Math.min(start + questionsPerPage, soal.length);

  for (let i = start; i < end; i++) {
    const q = soal[i];
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <p>${i + 1}. ${q.question}</p>
      ${q.options.map(opt =>
        `<label><input type="radio" name="question${i}" value="${opt}"> ${opt}</label><br>`
      ).join("")}
    `;
    questionsDiv.appendChild(div);
  }

  submitBtn.textContent = (end >= soal.length) ? "Selesai" : "Lanjut";
}

// Hitung jawaban benar
function countCorrect(page) {
  const start = page * questionsPerPage;
  const end = Math.min(start + questionsPerPage, soal.length);
  let correct = 0;

  for (let i = start; i < end; i++) {
    const selected = document.querySelector(`input[name="question${i}"]:checked`);
    if (selected && selected.value === soal[i].answer) {
      correct++;
    }
  }

  return correct;
}

// Simpan nilai
function saveScoreToFirebase(name, score) {
  const userRef = ref(db, `nilai/${name}`);
  update(userRef, { aik: score });
}

// Event mulai
startBtn.onclick = () => {
  const name = studentSelect.value;
  if (!name) return alert("Pilih nama terlebih dahulu.");

  document.getElementById("start-container").style.display = "none";
  quizContainer.style.display = "block";
  showQuestions(currentPage);
};

// Event submit
submitBtn.onclick = () => {
  totalCorrect += countCorrect(currentPage);
  currentPage++;

  if (currentPage * questionsPerPage >= soal.length) {
    const score = hasCheated ? 0 : totalCorrect * 2;
    const name = studentSelect.value;
    saveScoreToFirebase(name, score);

    quizContainer.style.display = "none";
    scoreDiv.innerHTML = `
      <h2>Terima kasih, ${name}!</h2>
      <p>Jawaban benar: ${totalCorrect} dari ${soal.length}</p>
      <p>Nilai akhir: ${score}</p>
    `;
    scoreDiv.style.display = "block";
  } else {
    showQuestions(currentPage);
  }
};
