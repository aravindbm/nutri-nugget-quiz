// *** CONFIGURATION ***
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi9_iDsZRnTaprOQZ4p1l-WcILO_cOKWS-hk7PeHXUIzZsEbzQF5iWcdy9HfqxeS9AyA/exec"; 

const questions = [
    { q: "NIN 2024: Salt intake limit for adults to prevent hypertension?", o: ["< 10 g/day", "< 5 g/day", "< 2 g/day", "< 7 g/day"], a: "< 5 g/day" },
    { q: "NIN 2024 'My Plate': Proportion of vegetables and fruits?", o: ["Quarter (25%)", "Half (50%)", "One-third (33%)", "Two-thirds (66%)"], a: "Half (50%)" },
    { q: "Ref Body Weight (NIN 2020/24) for Indian Man & Woman?", o: ["60 kg & 50 kg", "65 kg & 55 kg", "70 kg & 60 kg", "60 kg & 55 kg"], a: "65 kg & 55 kg" },
    { q: "WHO: 'Free Sugars' should be less than what % of energy?", o: ["5%", "10%", "15%", "20%"], a: "5%" },
    { q: "NIN 2024: Cereal:Pulse ratio of 3:1 improves what?", o: ["Essential Fatty Acids", "Essential Amino Acids", "Complex Carbs", "Fiber"], a: "Essential Amino Acids" },
    { q: "Best indicator for protein quality in research?", o: ["PER", "Net Protein Utilization (NPU)", "Biological Value", "Amino Acid Score"], a: "Net Protein Utilization (NPU)" },
    { q: "Goiter Survey Recall Period?", o: ["Current Status", "Last 2 weeks", "Last 1 year", "Last 5 years"], a: "Current Status" },
    { q: "Deficiency associated with Bitot’s Spots?", o: ["Vit D", "Vit C", "Vit A", "Vit B12"], a: "Vit A" },
    { q: "Vit A dose for children 1-5 years (prevention)?", o: ["100,000 IU", "200,000 IU", "50,000 IU", "10,000 IU"], a: "200,000 IU" },
    { q: "Lathyrism is caused by consumption of:", o: ["Khesari Dhal", "Argemone Oil", "Moldy Maize", "Polished Rice"], a: "Khesari Dhal" },
    { q: "BMI of 28.5 kg/m2 is classified as:", o: ["Normal", "Pre-obese (Overweight)", "Obese Class I", "Obese Class II"], a: "Pre-obese (Overweight)" },
    { q: "Anemia Mukt Bharat: IFA dose for adolescents?", o: ["20mg Fe + 100mcg FA", "45mg Fe + 400mcg FA", "60mg Fe + 500mcg FA", "100mg Fe + 500mcg FA"], a: "60mg Fe + 500mcg FA" },
    { q: "Which is NOT a direct nutritional assessment method?", o: ["Anthropometry", "Biochemical tests", "Clinical exam", "Vital Statistics"], a: "Vital Statistics" },
    { q: "Maize/Corn dependent diet causes:", o: ["Beriberi", "Pellagra", "Scurvy", "Rickets"], a: "Pellagra" },
    { q: "Aflatoxins primarily affect which organ?", o: ["Lungs", "Liver", "Kidneys", "Stomach"], a: "Liver" }
];

let currentQ = 0;
let totalScore = 0;
let userData = {};
let timePerQuestion = []; 
let individualScores = []; 
let questionStartTime = 0;
let overallStartTime = 0;
let timerInterval;

// Helper: Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    userData.name = document.getElementById('username').value;
    userData.college = document.getElementById('college').value;
    userData.email = document.getElementById('email').value;
    loginScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    startQuiz();
});

function startQuiz() {
    overallStartTime = Date.now();
    startTimer(15 * 60); 
    loadQuestion();
}

function loadQuestion() {
    if (currentQ >= questions.length) {
        finishQuiz();
        return;
    }
    questionStartTime = Date.now();
    const qData = questions[currentQ];
    document.getElementById('progress-display').innerText = `Q: ${currentQ + 1}/${questions.length}`;
    document.getElementById('question-text').innerText = qData.q;
    
    const optsDiv = document.getElementById('options-container');
    optsDiv.innerHTML = ''; 

    // Create a copy of options and Shuffle them!
    let shuffledOptions = shuffle([...qData.o]);

    shuffledOptions.forEach((optText) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = optText;
        // Compare the text of the clicked button to the correct answer string
        btn.onclick = () => submitAnswer(optText, qData.a);
        optsDiv.appendChild(btn);
    });
}

function submitAnswer(selectedText, correctText) {
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    timePerQuestion.push(timeTaken.toFixed(2));

    // Compare Text instead of Index
    if (selectedText === correctText) {
        totalScore++;
        individualScores.push(1);
    } else {
        individualScores.push(0);
    }

    currentQ++;
    loadQuestion();
}

function finishQuiz() {
    clearInterval(timerInterval);
    const totalTime = (Date.now() - overallStartTime) / 1000;
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('score-message').innerText = `You scored ${totalScore} out of 15!`;
    sendDataToSheet(totalTime);
}

function sendDataToSheet(totalTime) {
    const payload = {
        name: userData.name,
        college: userData.college,
        email: userData.email,
        score: totalScore,
        totalTime: totalTime,
        timePerQuestion: timePerQuestion,
        individualScores: individualScores
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(() => {
        document.getElementById('upload-status').innerText = "✅ Result saved successfully!";
        document.getElementById('upload-status').style.color = "green";
    }).catch(err => {
        console.error(err);
        document.getElementById('upload-status').innerText = "⚠️ Error. Check internet.";
    });
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('timer-display');
    timerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = "⏱ " + minutes + ":" + seconds;
        if (--timer < 0) finishQuiz(); 
    }, 1000);

}
