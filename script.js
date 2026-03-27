let waves = [];
let numWaves = 30;
let pointsPerWave = 200;
let mouseInfluenceRadius = 150;
let mouseStrength = 40;
let waveSpeed = 0.03;
let waveAmplitude = 25;

function setup() {
    let canvas = createCanvas(windowWidth, 3580);
    clear();
    smooth();
    initWaves();
}

function draw() {
    clear();
    stroke(245);
    strokeWeight(1.3);
    noFill();
    
    for (let w = 0; w < waves.length; w++) {
        beginShape();
        for (let p = 0; p < waves[w].length; p++) {
            let point = waves[w][p];
            
            let waveOffset = 0;
            waveOffset += sin(p * 0.08 + w * 0.6 + frameCount * waveSpeed) * waveAmplitude;
            waveOffset += sin(p * 0.25 + w * 1.1 + frameCount * 0.015) * (waveAmplitude * 0.4);
            
            let x = point.baseX + waveOffset;
            let y = point.baseY;
            
            let mouseDist = dist(mouseX, mouseY, x, y);
            if (mouseDist < mouseInfluenceRadius && mouseY > 0 && mouseY < 3580) {
                let force = map(mouseDist, 0, mouseInfluenceRadius, mouseStrength, 0);
                let dir = (x > mouseX) ? 1 : -1;
                x += force * dir;
            }
            vertex(x, y);
        }
        endShape();
    }
}

function initWaves() {
    waves = [];
    let margin = 80;
    let stepX = (width - margin * 2) / (numWaves - 1);
    
    for (let w = 0; w < numWaves; w++) {
        let wave = [];
        let baseX = margin + w * stepX;
        
        for (let p = 0; p <= pointsPerWave; p++) {
            let y = map(p, 0, pointsPerWave, margin, 3580 - margin);
            wave.push({
                baseX: baseX,
                baseY: y
            });
        }
        waves.push(wave);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, 3580);
    initWaves();
}

document.addEventListener('DOMContentLoaded', () => {

    const pieces = document.querySelectorAll('.piece');
    const dropZone = document.getElementById('drop-zone');
    const skullComplete = document.getElementById('skull-complete');
    let droppedCount = 0;
    const totalPieces = pieces.length;
    const cherepModal = document.getElementById('cherep-modal');

    pieces.forEach(piece => {
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
    });

    if(dropZone) {
        dropZone.addEventListener('dragover', (e) => e.preventDefault());

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text');
            const draggedPiece = document.getElementById(id);
            
            if (draggedPiece && !draggedPiece.classList.contains('dropped')) {
                draggedPiece.classList.add('dropped'); 
                droppedCount++;

                if (droppedCount === totalPieces) {
                    dropZone.style.border = 'none'; 
                    if(skullComplete)
                    {
                        skullComplete.classList.remove('hidden'); 
                        cherepModal.classList.remove('hidden');

                        setTimeout(() => {
                            cherepModal.classList.add('hidden');
                            skullComplete.classList.add('hidden');
                            dropZone.style.border = '';
                            pieces.forEach(p => p.classList.remove('dropped'));
                            droppedCount = 0;
                        }, 7000);
                    }
                }
            }
        });
    }

    const items = Array.from(document.querySelectorAll('.game-item-smooth'));
    const modal = document.getElementById('game-modal');
    const taskText = document.getElementById('game-task');
    const startBtn = document.getElementById('start-game-btn');
    
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultTextBody = document.getElementById('result-text');
    
    let targetItem = '';
    let isPlaying = false;
    
    const positions = ['10%', '40%', '70%']; 

    items.forEach((item, index) => {
        item.style.left = positions[index];
    });

    function startShellGame() {
        items.forEach(item => {
            item.classList.remove('is-blurred', 'is-guessing');
        });

        const targets = ['cat', 'lamp', 'hat'];
        const names = {'cat': 'Кота', 'lamp': 'Лампу', 'hat': 'Шляпу'};


targetItem = targets[Math.floor(Math.random() * targets.length)];
        
        if(taskText) taskText.innerText = `Найди: ${names[targetItem]}`;
        if(modal) modal.classList.remove('hidden');
    }

    const screen3 = document.querySelector('.screen-3');
    if(screen3) {
        const observer = new IntersectionObserver((entries) => {
            let isResultHidden = resultModal ? resultModal.classList.contains('hidden') : true;
            if(entries[0].isIntersecting && !isPlaying && modal && modal.classList.contains('hidden') && isResultHidden) {
                startShellGame();
            }
        }, { threshold: 0.3 });
        observer.observe(screen3);
    }

    if(startBtn) {
        startBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            isPlaying = true;
            
            items.forEach(item => item.classList.add('is-blurred'));

            let shuffles = 0;
            const shuffleInterval = setInterval(() => {
                let shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
                
                items.forEach((item, index) => {
                    item.style.left = shuffledPositions[index];
                });
                shuffles++;

                if(shuffles >= 6) { 
                    clearInterval(shuffleInterval);
                    setTimeout(() => {
                        items.forEach(item => {
                            item.classList.remove('is-blurred');
                            item.classList.add('is-guessing');
                            item.addEventListener('click', checkWin);
                        });
                    }, 600);
                }
            }, 800);
        });
    }

    function checkWin(e) {
        if(!isPlaying) return;
        isPlaying = false; 

        items.forEach(item => {
            item.classList.remove('is-guessing');
            item.removeEventListener('click', checkWin);
        });

        const isCorrect = e.currentTarget.getAttribute('data-id') === targetItem;
        
        setTimeout(() => {
            if(isCorrect) {
                if(resultTitle) {
                    resultTitle.innerText = 'Верно!';
                    resultTitle.style.color = '#2ecc71';
                }
            } else {
                if(resultTitle) {
                    resultTitle.innerText = 'Ошибка!';
                    resultTitle.style.color = '#e74c3c';
                }
            }
            
            if(resultTextBody) {
                resultTextBody.innerText = 'Знаменитый случай невролога Оливера Сакса. Музыкант-профессионал с агнозией (неспособностью узнавать объекты) пытался надеть на голову собственную жену, приняв её за головной убор.';
            }
            
            if(resultModal) resultModal.classList.remove('hidden');
            
            setTimeout(() => {
                if(resultModal) resultModal.classList.add('hidden');
                startShellGame();
            }, 6000);
        }, 300);
    }

    const tangleContainer = document.getElementById('tangle-container');
    const therapyModal = document.getElementById('therapy-modal');
    if(tangleContainer) {
        const tangleSketch = (p) => {
            let points = [];
            let numPoints = 200; 
            let pullProgress = 0;   
            let targetProgress = 0; 
            
            let clickCount = 0;
            const maxClicks = 3;    
            let modalShown = false;
            let resetTimerStarted = false;

            p.setup = () => {
                let h = tangleContainer.clientHeight > 0 ? tangleContainer.clientHeight : 400;
                p.createCanvas(tangleContainer.clientWidth, h);
                p.stroke(0); 
                p.strokeWeight(4); 
                p.noFill();
                p.strokeJoin(p.ROUND);
                generatePoints();
            };

            function generatePoints() {
                points = [];
                for (let i = 0; i < numPoints; i++) {
                    let t = p.map(i, 0, numPoints, 0, p.TWO_PI * 10);
                    let tangleX = p.width / 2 + p.sin(t * 1.3) * (p.width * 0.3) + p.noise(i * 0.1) * 50 - 25;
                    let tangleY = p.height / 2 + p.cos(t * 1.7) * (p.height * 0.4) + p.noise(i * 0.1 + 100) * 50 - 25;
                    
                    let straightX = p.map(i, 0, numPoints, 20, p.width - 20);
                    let straightY = p.height / 2 + p.sin(i * 0.1) * 20;

                    points.push({
                        tX: tangleX, tY: tangleY,
                        sX: straightX, sY: straightY
                    });
                }
            }

            p.draw = () => {
                p.clear();
                
                pullProgress = p.lerp(pullProgress, targetProgress, 0.08);

                p.beginShape();
                for (let i = 0; i < points.length; i++) {
                    let pt = points[i];
                    let noiseX = (1 - pullProgress) * (p.noise(i * 0.1, p.frameCount * 0.01) * 20 - 10);
                    let noiseY = (1 - pullProgress) * (p.noise(i * 0.1 + 100, p.frameCount * 0.01) * 20 - 10);

                    let x = p.lerp(pt.tX + noiseX, pt.sX, pullProgress);
                    let y = p.lerp(pt.tY + noiseY, pt.sY, pullProgress);
                    p.vertex(x, y);
                }
                p.endShape();

                if (targetProgress === 1 && pullProgress > 0.99) {
                    if (!modalShown) {
                        modalShown = true;
                        if (therapyModal) therapyModal.classList.remove('hidden');
                    }
                    if (!resetTimerStarted) {
                        resetTimerStarted = true;
                        setTimeout(() => {
                            clickCount = 0;
                            targetProgress = 0;
                            modalShown = false;
                            resetTimerStarted = false;
                            if (therapyModal) therapyModal.classList.add('hidden');
                            generatePoints();
                        }, 5000);
                    }
                }
            };

            p.mousePressed = () => {
                if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
                    if (clickCount < maxClicks) {
                        clickCount++;
                        targetProgress = clickCount / maxClicks;
                    }
                }
            };
            
            p.windowResized = () => {
                if (tangleContainer.clientWidth > 0) {
                    let h = tangleContainer.clientHeight > 0 ? tangleContainer.clientHeight : 400;
                    p.resizeCanvas(tangleContainer.clientWidth, h);
                    generatePoints();
                }
            };
        };
        new p5(tangleSketch, tangleContainer);
    }
});
