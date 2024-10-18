const cameraButton = document.getElementById('cameraButton');
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const numberDisplay = document.getElementById('number');
const mathProblem = document.getElementById('mathProblem');
const successMessage = document.getElementById('successMessage');
const tryAgainMessage = document.getElementById('tryAgainMessage');
let handDetector;
let camera;
let canvas;
let ctx;
let currentAnswer;

// Função para inicializar o detector de mãos com MediaPipe
async function initializeHandDetector() {
    console.log('Inicializando o detector de mãos...');
    handDetector = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    handDetector.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    handDetector.onResults(onResults);
    console.log('Detector de mãos inicializado.');
}

// Função para lidar com os resultados do MediaPipe
function onResults(results) {
    console.log('Resultados recebidos do detector de mãos:', results);
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        numberDisplay.textContent = '-';
        return;
    }
    const landmarks = results.multiHandLandmarks[0];
    const fingersUp = countFingersUp(landmarks);
    numberDisplay.textContent = fingersUp;

    // Verifica se a resposta está correta
    if (fingersUp === currentAnswer) {
        showSuccessMessage();
        setTimeout(() => {
            hideSuccessMessage();
            generateMathProblem();
        }, 2000);
    } else if (fingersUp !== '-') {
        showTryAgainMessage();
        setTimeout(() => {
            hideTryAgainMessage();
        }, 2000);
    }
}

// Função para contar os dedos levantados
function countFingersUp(landmarks) {
    const tips = [4, 8, 12, 16, 20];
    const pipJoints = [2, 6, 10, 14, 18];
    let count = -1;

    // Verifica se cada dedo está levantado
    for (let i = 0; i < tips.length; i++) {
        const tip = landmarks[tips[i]];
        const pip = landmarks[pipJoints[i]];
        if (tip.y < pip.y) {
            count++;
        }
    }

    return count;
}

// Função para configurar a câmera e canvas
async function startCamera() {
    video.width = 320;
    video.height = 240;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        videoContainer.style.display = 'block';
        cameraButton.style.display = 'none';
        console.log('Câmera iniciada.');

        // Inicializa o detector de mãos
        await initializeHandDetector();

        // Configura o canvas
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 640;
        canvas.height = 480;

        // Inicia a captura do vídeo
        video.addEventListener('loadeddata', () => {
            console.log('Vídeo carregado. Iniciando processamento...');
            processVideo();
        });

        // Gera o primeiro problema de matemática
        generateMathProblem();
    } catch (err) {
        alert('Não foi possível acessar a câmera. Verifique as permissões.');
        console.error('Erro ao iniciar a câmera:', err);
    }
}

// Função para processar o vídeo
async function processVideo() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    await handDetector.send({ image: canvas });
    requestAnimationFrame(processVideo);
}

// Função para gerar uma conta matemática
function generateMathProblem() {
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;

    do {
        num1 = Math.floor(Math.random() * 6);
        num2 = Math.floor(Math.random() * 6);
        switch (operation) {
            case '+':
                currentAnswer = num1 + num2;
                break;
            case '-':
                currentAnswer = num1 - num2;
                break;
            case '*':
                currentAnswer = num1 * num2;
                break;
            case '/':
                currentAnswer = Math.floor(num1 / num2);
                break;
        }
    } while (currentAnswer < 0 || currentAnswer > 5);

    mathProblem.textContent = `${num1} ${operation} ${num2} = ?`;
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage() {
    successMessage.style.display = 'block';
}

// Função para esconder mensagem de sucesso
function hideSuccessMessage() {
    successMessage.style.display = 'none';
}

// Função para mostrar mensagem de "tente outra vez"
function showTryAgainMessage() {
    tryAgainMessage.style.display = 'block';
}

// Função para esconder mensagem de "tente outra vez"
function hideTryAgainMessage() {
    tryAgainMessage.style.display = 'none';
}

// Chama a função para iniciar a câmera quando o botão é clicado
cameraButton.addEventListener('click', startCamera);
