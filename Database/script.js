// --- Chatbot Logic ---
function sendMessage() {
  const input = document.getElementById("userInput").value;
  if (!input) return;

  const messages = document.getElementById("messages");
  messages.innerHTML += `<p><b>You:</b> ${input}</p>`;

  let reply = "I’m still learning about finance!";
  if (input.toLowerCase().includes("plan")) {
    reply = "Start with a budget: 50% needs, 30% wants, 20% savings.";
  } else if (input.toLowerCase().includes("invest")) {
    reply = "For beginners, SIPs in mutual funds are safer than stocks.";
  } else if (input.toLowerCase().includes("fraud")) {
    reply = "Never share OTP, PIN, or passwords with anyone!";
  }

  messages.innerHTML += `<p><b>Paisabuddy:</b> ${reply}</p>`;
  document.getElementById("userInput").value = "";
}

// --- Voice Learning Mode ---
function playAudio(language) {
  const audioPlayer = document.getElementById("audioPlayer");
  if (language === "hindi") {
    audioPlayer.src = "audios/finance_hindi.mp3";
  } else if (language === "english") {
    audioPlayer.src = "audios/finance_english.mp3";
  } else if (language === "tamil") {
    audioPlayer.src = "audios/finance_tamil.mp3";
  }
  audioPlayer.play();
}

// --- Quiz Logic ---
const quizData = [
  {
    question: "What is the 50-30-20 rule in budgeting?",
    options: [
      "50% needs, 30% wants, 20% savings",
      "50% savings, 30% expenses, 20% fun",
      "50% rent, 30% food, 20% travel"
    ],
    correct: 0
  },
  {
    question: "What should you never share with strangers?",
    options: [
      "Your Netflix password",
      "Your UPI PIN/OTP",
      "Your email ID"
    ],
    correct: 1
  },
  {
    question: "Which is a safer investment for beginners?",
    options: [
      "Lottery tickets",
      "Stock market day trading",
      "Mutual Funds / SIPs"
    ],
    correct: 2
  }
];

let currentQuestion = 0;
let score = 0;

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("score").innerText = "Score: 0";
  showQuestion();
}

function showQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById("question").innerText = q.question;

  let optionsHtml = "";
  q.options.forEach((opt, index) => {
    optionsHtml += `<button onclick="checkAnswer(${index})">${opt}</button><br>`;
  });

  document.getElementById("options").innerHTML = optionsHtml;
}

function checkAnswer(selected) {
  const q = quizData[currentQuestion];
  if (selected === q.correct) {
    score++;
    alert("✅ Correct!");
  } else {
    alert("❌ Oops! Wrong answer.");
  }

  document.getElementById("score").innerText = "Score: " + score;

  currentQuestion++;
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    document.getElementById("question").innerText = "🎉 Quiz completed!";
    document.getElementById("options").innerHTML = "";
  }
}

// --- PWA Service Worker Registration ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(() => {
    console.log("Service Worker Registered!");
  });
}

