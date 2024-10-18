const cameraButton = document.getElementById('cameraButton');
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const numberDisplay = document.getElementById('number');
let handDetector;
let camera;
let canvas;
let ctx;

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
    // console.log('Resultados recebidos do detector de mãos:', results);
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        numberDisplay.textContent = '-';
        return;
    }
    const landmarks = results.multiHandLandmarks[0];
    const fingersUp = countFingersUp(landmarks);
    numberDisplay.textContent = fingersUp;
}

// Função para contar os dedos levantados
function countFingersUp(landmarks) {
    const tips = [4, 8, 12, 16, 20]; // Índices das pontas dos dedos
    const pipJoints = [2, 6, 10, 14, 18]; // Índices das articulações PIP

    let count = -1; // Inicializa o contador em 0

    // Verifica se cada dedo está levantado
    for (let i = 0; i < tips.length; i++) {
        const tip = landmarks[tips[i]];
        const pip = landmarks[pipJoints[i]];

        // Debug: Imprime as coordenadas
        console.log(`Dedo ${i + 1}: tip.y = ${tip.y}, pip.y = ${pip.y}`);

        // Se a ponta do dedo (tip) estiver acima da articulação PIP, conta como levantado
        if (tip.y < pip.y) {
            count++; // Contabiliza o dedo levantado
        }
    }

    // Para debug: imprime a contagem final
    console.log(`Dedos contados: ${count}`);
    return count; // Retorna a contagem de dedos levantados
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

// Chama a função para iniciar a câmera quando o botão é clicado
cameraButton.addEventListener('click', startCamera);
