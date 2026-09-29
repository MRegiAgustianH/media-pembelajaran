const questions = [
    {
        question: "Jantung manusia memiliki 4 ruang utama. Ruang yang bertugas memompa darah ke seluruh tubuh adalah?",
        options: ["Serambi Kanan", "Serambi Kiri", "Bilik Kanan", "Bilik Kiri"],
        answer: 3
    },
    {
        question: "Apa fungsi utama Paru-paru dalam sistem peredaran darah?",
        options: ["Memompa darah", "Tempat pertukaran oksigen dan karbon dioksida", "Menyaring racun", "Menghasilkan sel darah merah"],
        answer: 1
    },
    {
        question: "Pembuluh darah yang tebal, elastis, dan membawa darah KELUAR dari jantung disebut?",
        options: ["Vena", "Kapiler", "Arteri (Nadi)", "Aorta saja"],
        answer: 2
    },
    {
        question: "Komponen darah yang berfungsi mengangkut oksigen adalah?",
        options: ["Sel darah putih (Leukosit)", "Keping darah (Trombosit)", "Plasma darah", "Sel darah merah (Eritrosit)"],
        answer: 3
    },
    {
        question: "Darah yang kembali dari seluruh tubuh menuju jantung kaya akan zat apa?",
        options: ["Oksigen", "Karbon Dioksida", "Nutrisi", "Air"],
        answer: 1
    }
];
let currentQuestionIndex = 0;
let score = 0;

// UI Elements
const uiQuizScreen = document.getElementById('quiz-screen');
const uiResultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const quizFeedback = document.getElementById('quiz-feedback');
const quizProgress = document.getElementById('quiz-progress');
const scoreDisplay = document.getElementById('score-display');
const scoreMessage = document.getElementById('score-message');
const sfxCorrect = new Audio('assets/audio/dragon-studio-correct-472358.mp3');
const sfxWrong = new Audio('assets/audio/freesound_community-wrong-47985.mp3');
const sfxClick = new Audio('assets/audio/mixkit-select-click-1109.wav');

export function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    uiQuizScreen.classList.add('active');
}

function loadQuestion() {
    const currentQ = questions[currentQuestionIndex];
    questionText.textContent = currentQ.question;
    optionsContainer.innerHTML = '';
    quizFeedback.classList.add('hidden');
    quizFeedback.className = ''; // reset classes

    currentQ.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = opt;
        btn.onclick = () => {
            sfxClick.currentTime = 0;
            sfxClick.play().catch(e=>{});
            handleAnswer(index, btn);
        };
        optionsContainer.appendChild(btn);
    });

    quizProgress.textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${questions.length}`;
}

function handleAnswer(selectedIndex, btnElement) {
    // Disable all buttons
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');

    const correctIndex = questions[currentQuestionIndex].answer;
    
    quizFeedback.classList.remove('hidden');

    if (selectedIndex === correctIndex) {
        sfxCorrect.currentTime = 0;
        sfxCorrect.play().catch(e=>{});
        btnElement.classList.add('correct');
        quizFeedback.textContent = 'Benar!';
        quizFeedback.classList.add('correct-text');
        score += 20; // 5 questions * 20 = 100
    } else {
        sfxWrong.currentTime = 0;
        sfxWrong.play().catch(e=>{});
        btnElement.classList.add('wrong');
        buttons[correctIndex].classList.add('correct');
        quizFeedback.textContent = 'Salah!';
        quizFeedback.classList.add('wrong-text');
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }, 1500);
}

function showResult() {
    uiQuizScreen.classList.remove('active');
    uiResultScreen.classList.add('active');
    
    scoreDisplay.textContent = score;
    
    if (score === 100) {
        scoreMessage.textContent = 'Sempurna! Kamu sangat paham sistem peredaran darah.';
    } else if (score >= 60) {
        scoreMessage.textContent = 'Bagus! Sedikit lagi belajar pasti bisa 100.';
    } else {
        scoreMessage.textContent = 'Jangan menyerah! Ayo pelajari lagi materinya.';
    }
}

document.getElementById('btn-retry-quiz').addEventListener('click', startQuiz);
