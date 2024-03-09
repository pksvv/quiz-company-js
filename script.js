document.getElementById('csvFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const rows = parseCSV(e.target.result);
        generateQuestions(rows);
        if(document.getElementById('timerDuration').value) {
            startTimer();
        }
    };
    reader.readAsText(file);
});

function parseCSV(text) {
    let rows = text.split('\n').filter(row => row.trim());
    let parsedRows = rows.map(row => {
        let entries = [];
        let currentEntry = [];
        let insideQuote = false;
        
        for (let char of row) {
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                entries.push(currentEntry.join(''));
                currentEntry = [];
            } else {
                currentEntry.push(char);
            }
        }
        if (currentEntry.length > 0) {
            entries.push(currentEntry.join(''));
        }
        return entries;
    });
    
    return parsedRows.slice(1); // Skipping the header row
}

function generateQuestions(rows) {
    const container = document.getElementById('questionContainer');
    container.innerHTML = '';
    rows.forEach((row, index) => {
        if (row.length < 7) {
            console.error('Invalid row:', row);
            return;
        }
        const [sno, question, a, b, c, d, correct] = row;
        const questionHtml = `
            <div class="question" data-correct="${correct.trim()}">
                <div class="question-header">${question}</div>
                <label><input type="radio" name="question${index}" value="a"> ${a}</label>
                <label><input type="radio" name="question${index}" value="b"> ${b}</label>
                <label><input type="radio" name="question${index}" value="c"> ${c}</label>
                <label><input type="radio" name="question${index}" value="d"> ${d}</label>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', questionHtml);
    });
}


function generateQuestions(rows) {
    const container = document.getElementById('questionContainer');
    container.innerHTML = ''; // Clear previous questions

    rows.forEach((row, index) => {
        if (row.length < 7) {
            console.error('Invalid row:', row);
            return;
        }

        const [sno, question, a, b, c, d, correct] = row;
        const questionHtml = `
            <div class="question">
                <div class="question-header">Question ${sno}: ${question}</div>
                <label><input type="radio" name="question${sno}" value="a"> ${a}</label>
                <br><label><input type="radio" name="question${sno}" value="b"> ${b}</label>
                <br><label><input type="radio" name="question${sno}" value="c"> ${c}</label>
                <br><label><input type="radio" name="question${sno}" value="d"> ${d}</label>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', questionHtml);
    });
}


document.getElementById('scoreButton').addEventListener('click', function() {
    const questions = document.querySelectorAll('#questionContainer .question');
    let score = 0;
    questions.forEach(question => {
        const correctAnswer = question.dataset.correct;
        const selectedAnswer = question.querySelector('input[type="radio"]:checked');
        
        // Reset background for all options
        question.querySelectorAll('label').forEach(label => {
            label.style.backgroundColor = ""; // Reset to default
        });

        if (selectedAnswer) {
            if (selectedAnswer.value === correctAnswer) {
                score++;
                selectedAnswer.parentElement.style.backgroundColor = "#ccffcc"; // Correct attempt in green
            } else {
                selectedAnswer.parentElement.style.backgroundColor = "#ffcccc"; // Incorrect attempt in red
            }
        }
    });

    document.getElementById('result').textContent = `Your score is: ${score}/${questions.length}`;
});

function startTimer() {
    const timerInput = document.getElementById('timerDuration').value.split(':');
    let duration = (parseInt(timerInput[0], 10) || 0) * 60 + (parseInt(timerInput[1], 10) || 0); // Convert mm:ss to total seconds
    const timerDisplay = document.getElementById('timer');

    const interval = setInterval(() => {
        if (duration < 0) {
            clearInterval(interval);
            timerDisplay.textContent = "Time's up!";
            playHighPitchTone();
            alert('Time is up!');
            document.getElementById('scoreButton').click(); // Automatically check the score when time is up
            return;
        }

        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        duration--;
    }, 1000);
}

function playHighPitchTone() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = 'sine'; // This creates a sine wave sound
    oscillator.frequency.setValueAtTime(1000, context.currentTime); // Set frequency to 1000Hz
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 2); // Stop after 2 seconds
}
