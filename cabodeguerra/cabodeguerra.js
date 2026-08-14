window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const homeScreenContent = document.getElementById('homeScreenContent');
    const characterSelectionScreenContent = document.getElementById('characterSelectionScreenContent');
    const controlsScreenContent = document.getElementById('controlsScreenContent');
    const endGameContent = document.getElementById('endGameContent');
    const mainButton = document.getElementById('mainButton');
    const controlsButton = document.getElementById('controlsButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const backToHomeButton = document.getElementById('backToHomeButton');
    const backToHomeFromControls = document.getElementById('backToHomeFromControls');
    const backToHomeFromSelection = document.getElementById('backToHomeFromSelection');
    const endGameTitle = document.getElementById('endGameTitle');
    const messageBox = document.getElementById('messageBox');
    const gameContainer = document.querySelector('.game-container');
    const player1NameInput = document.getElementById('player1NameInput');
    const player2NameInput = document.getElementById('player2NameInput');
    const player1NameDisplay = document.getElementById('player1Name');
    const player2NameDisplay = document.getElementById('player2Name');
    const timerDisplay = document.getElementById('timer');
    const countdownDisplay = document.getElementById('countdownDisplay');

    const canvasWidth = 800;
    const canvasHeight = 450;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const groundY = canvasHeight - 60;
    const ropeY = canvasHeight / 2 + 10;

    // Tug of war physics
    const PULL_IMPULSE = 3.2;
    const FRICTION = 0.90;
    const ROPE_LIMIT = 220; // distância do centro que define vitória (em px)

    let ropePosition = 0; // -ROPE_LIMIT (P2 venceu) a +ROPE_LIMIT (P1 venceu)
    let ropeVelocity = 0;

    let player1Name = 'JOGADOR 1';
    let player2Name = 'JOGADOR 2';

    let selectedHeadP1 = null;
    let selectedHeadP2 = null;

    let selectedCharacters = {
        player1: null,
        player2: null,
        player1Name: '',
        player2Name: ''
    };

    const characters = [
        { name: 'Felipe Dev', img: '../images/cabeca/cabeca2.png' },
        { name: 'Thiago', img: '../images/cabeca/cabeca4.png' },
        { name: 'Marcelo', img: '../images/cabeca/cabeca3.png' },
        { name: 'Eduardo', img: '../images/cabeca/cabeca1.png' }
    ];

    let headImageP1 = null;
    let headImageP2 = null;

    let keys = {};
    let gameStarted = false;
    let gameOver = false;
    let animationFrameId;
    let countdownActive = false;
    let countdownIntervalId = null;
    let isStarting = false; // trava contra clique duplo / listeners duplicados

    let leanP1 = 0; // animação de puxão (0 a 1, decai)
    let leanP2 = 0;

    function resetRope() {
        ropePosition = 0;
        ropeVelocity = 0;
        leanP1 = 0;
        leanP2 = 0;
    }

    function runCountdown(onFinish) {
        // Limpa qualquer contagem anterior que possa ter ficado pendurada
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }

        countdownActive = true;
        keys = {}; // limpa teclas pressionadas antes da contagem

        const steps = ['3', '2', '1', 'VAI!'];
        let stepIndex = 0;

        function showCurrentStep() {
            countdownDisplay.classList.remove('pop');
            void countdownDisplay.offsetWidth; // reinicia a animação CSS
            countdownDisplay.innerText = steps[stepIndex];
            countdownDisplay.classList.add('pop');
        }

        showCurrentStep();

        countdownIntervalId = setInterval(() => {
            stepIndex++;
            if (stepIndex < steps.length) {
                showCurrentStep();
            } else {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
                countdownActive = false;
                keys = {};
                countdownDisplay.classList.remove('pop');
                countdownDisplay.innerText = '';
                if (onFinish) onFinish();
            }
        }, 700);
    }

    function initGame() {
        if (isStarting) return; // evita iniciar duas vezes se o botão for clicado/disparado 2x
        isStarting = true;

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (countdownIntervalId) { clearInterval(countdownIntervalId); countdownIntervalId = null; }

        player1Name = selectedCharacters.player1Name || player1NameInput.value.trim() || 'JOGADOR 1';
        player2Name = selectedCharacters.player2Name || player2NameInput.value.trim() || 'JOGADOR 2';
        player1NameDisplay.innerText = player1Name;
        player2NameDisplay.innerText = player2Name;

        headImageP1 = new Image();
        if (selectedHeadP1) headImageP1.src = selectedHeadP1;
        headImageP2 = new Image();
        if (selectedHeadP2) headImageP2.src = selectedHeadP2;

        resetRope();

        messageBox.style.display = 'none';
        homeScreenContent.style.display = 'none';
        characterSelectionScreenContent.style.display = 'none';
        controlsScreenContent.style.display = 'none';
        endGameContent.style.display = 'none';
        gameContainer.style.display = 'flex';

        keys = {};
        gameStarted = true;
        gameOver = false;
        timerDisplay.innerText = 'PREPARA...';

        runCountdown(() => {
            timerDisplay.innerText = 'PUXA!';
        });

        animate();
        isStarting = false;
    }

    function endGame(winnerName) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        messageBox.style.display = 'block';
        gameContainer.style.display = 'none';

        homeScreenContent.style.display = 'none';
        controlsScreenContent.style.display = 'none';
        characterSelectionScreenContent.style.display = 'none';
        endGameContent.style.display = 'block';

        endGameTitle.innerText = `${winnerName} VENCEU!`;
    }

    function showHomeScreen() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (countdownIntervalId) { clearInterval(countdownIntervalId); countdownIntervalId = null; }
        countdownActive = false;
        gameStarted = false;
        gameOver = false;
        keys = {};
        resetRope();

        selectedCharacters.player1 = null;
        selectedCharacters.player2 = null;
        selectedCharacters.player1Name = '';
        selectedCharacters.player2Name = '';
        selectedHeadP1 = null;
        selectedHeadP2 = null;

        messageBox.style.display = 'block';
        gameContainer.style.display = 'none';

        controlsScreenContent.style.display = 'none';
        endGameContent.style.display = 'none';
        characterSelectionScreenContent.style.display = 'none';
        homeScreenContent.style.display = 'block';
    }

    function showControlsScreen() {
        homeScreenContent.style.display = 'none';
        controlsScreenContent.style.display = 'block';
    }

    function showCharacterSelectionScreen() {
        const p1Name = player1NameInput.value.trim();
        const p2Name = player2NameInput.value.trim();

        selectedCharacters.player1Name = p1Name || 'JOGADOR 1';
        selectedCharacters.player2Name = p2Name || 'JOGADOR 2';

        homeScreenContent.style.display = 'none';
        characterSelectionScreenContent.style.display = 'block';

        setupCharacterSelection();
    }

    let selectionListenersAttached = false;

    function setupCharacterSelection() {
        const confirmBtn = document.getElementById('confirmSelectionBtn');

        selectedCharacters.player1 = 0;
        selectedCharacters.player2 = 1;

        if (!selectionListenersAttached) {
            document.querySelectorAll('.character-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.character);
                    const isPlayer1Selected = selectedCharacters.player1 === index;
                    const isPlayer2Selected = selectedCharacters.player2 === index;

                    if (!isPlayer1Selected && !isPlayer2Selected) {
                        if (selectedCharacters.player1 === null) {
                            selectedCharacters.player1 = index;
                        } else if (selectedCharacters.player2 === null) {
                            selectedCharacters.player2 = index;
                        }
                    } else if (isPlayer1Selected) {
                        selectedCharacters.player1 = null;
                    } else if (isPlayer2Selected) {
                        selectedCharacters.player2 = null;
                    }
                    updateCharacterSelectionUI();
                });
            });

            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    if (selectedCharacters.player1 !== null && selectedCharacters.player2 !== null) {
                        selectedHeadP1 = characters[selectedCharacters.player1].img;
                        selectedHeadP2 = characters[selectedCharacters.player2].img;
                        initGame();
                    }
                });
            }

            selectionListenersAttached = true;
        }

        updateCharacterSelectionUI();
    }

    function updateCharacterSelectionUI() {
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            card.classList.remove('player1-selected', 'player2-selected');
            card.querySelector('.selection-marker-p1').style.display = 'none';
            card.querySelector('.selection-marker-p2').style.display = 'none';
        });

        if (selectedCharacters.player1 !== null) {
            cards[selectedCharacters.player1].classList.add('player1-selected');
            cards[selectedCharacters.player1].querySelector('.selection-marker-p1').style.display = 'block';
        }
        if (selectedCharacters.player2 !== null) {
            cards[selectedCharacters.player2].classList.add('player2-selected');
            cards[selectedCharacters.player2].querySelector('.selection-marker-p2').style.display = 'block';
        }

        const confirmBtn = document.getElementById('confirmSelectionBtn');
        if (confirmBtn) {
            confirmBtn.disabled = selectedCharacters.player1 === null || selectedCharacters.player2 === null;
        }
    }

    function drawCharacter(x, headImage, bodyColor, facingRight, lean) {
        // Corpo simples: retângulo com "corda puxada" - lean inclina o corpo pra trás
        const leanAngle = facingRight ? -lean * 0.25 : lean * 0.25;
        ctx.save();
        ctx.translate(x, groundY);
        ctx.rotate(leanAngle);

        // Pernas
        ctx.strokeStyle = '#3a2b1a';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-14, -30);
        ctx.moveTo(10, 0);
        ctx.lineTo(14, -30);
        ctx.stroke();

        // Corpo
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-16, -85, 32, 55);

        // Braços esticados na direção da corda
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 8;
        const armDir = facingRight ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(0, -70);
        ctx.lineTo(armDir * 35, -60);
        ctx.stroke();

        // Cabeça
        if (headImage && headImage.complete && headImage.src) {
            ctx.drawImage(headImage, -25, -130, 50, 50);
        } else {
            ctx.beginPath();
            ctx.arc(0, -105, 22, 0, Math.PI * 2);
            ctx.fillStyle = '#f1c27d';
            ctx.fill();
        }

        ctx.restore();
    }

    function update() {
        if (countdownActive) return;

        if (keys['ShiftLeft']) {
            leanP1 = 1;
            keys['ShiftLeft'] = false; // exige nova tecla, evita segurar
            ropeVelocity += PULL_IMPULSE;
        }
        if (keys['Enter']) {
            leanP2 = 1;
            keys['Enter'] = false;
            ropeVelocity -= PULL_IMPULSE;
        }

        ropeVelocity *= FRICTION;
        ropePosition += ropeVelocity;

        leanP1 *= 0.9;
        leanP2 *= 0.9;

        if (ropePosition > ROPE_LIMIT) {
            ropePosition = ROPE_LIMIT;
            endGame(player1Name);
        } else if (ropePosition < -ROPE_LIMIT) {
            ropePosition = -ROPE_LIMIT;
            endGame(player2Name);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const centerX = canvasWidth / 2;

        // Marcações de vitória
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(centerX - ROPE_LIMIT, 0);
        ctx.lineTo(centerX - ROPE_LIMIT, canvasHeight);
        ctx.moveTo(centerX + ROPE_LIMIT, 0);
        ctx.lineTo(centerX + ROPE_LIMIT, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Linha central
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvasHeight);
        ctx.stroke();

        // Corda
        const knotX = centerX + ropePosition;
        ctx.strokeStyle = '#c68e4b';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(60, ropeY);
        ctx.lineTo(canvasWidth - 60, ropeY);
        ctx.stroke();

        // Nó da corda (marcador central)
        ctx.fillStyle = '#8b5a2b';
        ctx.beginPath();
        ctx.arc(knotX, ropeY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Personagens (posições fixas nas pontas, seguram a corda)
        drawCharacter(110, headImageP1, '#2980b9', true, leanP1);
        drawCharacter(canvasWidth - 110, headImageP2, '#9b59b6', false, leanP2);

        // Chão
        ctx.fillStyle = '#2e2210';
        ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
    }

    function animate() {
        if (gameOver) return;
        update();
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }

    document.addEventListener('keydown', (e) => {
        if (characterSelectionScreenContent.style.display === 'block') {
            if (e.key.toLowerCase() === 'a') {
                selectedCharacters.player1 = (selectedCharacters.player1 - 1 + characters.length) % characters.length;
                updateCharacterSelectionUI();
            } else if (e.key.toLowerCase() === 'd') {
                selectedCharacters.player1 = (selectedCharacters.player1 + 1) % characters.length;
                updateCharacterSelectionUI();
            } else if (e.key === 'ArrowLeft') {
                selectedCharacters.player2 = (selectedCharacters.player2 - 1 + characters.length) % characters.length;
                updateCharacterSelectionUI();
            } else if (e.key === 'ArrowRight') {
                selectedCharacters.player2 = (selectedCharacters.player2 + 1) % characters.length;
                updateCharacterSelectionUI();
            } else if (e.key === 'Enter') {
                if (selectedCharacters.player1 !== null && selectedCharacters.player2 !== null) {
                    selectedHeadP1 = characters[selectedCharacters.player1].img;
                    selectedHeadP2 = characters[selectedCharacters.player2].img;
                    initGame();
                }
            }
            return;
        }

        if (!gameStarted || e.repeat) return;
        if (e.code === 'ShiftLeft') {
            keys['ShiftLeft'] = true;
        } else if (e.code === 'Enter' || e.key === 'Enter') {
            keys['Enter'] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ShiftLeft') {
            keys['ShiftLeft'] = false;
        } else if (e.code === 'Enter' || e.key === 'Enter') {
            keys['Enter'] = false;
        }
    });

    mainButton.addEventListener('click', showCharacterSelectionScreen);
    controlsButton.addEventListener('click', showControlsScreen);
    backToHomeFromControls.addEventListener('click', showHomeScreen);
    backToHomeFromSelection.addEventListener('click', showHomeScreen);
    playAgainButton.addEventListener('click', initGame);
    backToHomeButton.addEventListener('click', showHomeScreen);

    showHomeScreen();
};