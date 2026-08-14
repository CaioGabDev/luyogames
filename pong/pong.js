window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const homeScreenContent = document.getElementById('homeScreenContent');
    const controlsScreenContent = document.getElementById('controlsScreenContent');
    const endGameContent = document.getElementById('endGameContent');
    const mainButton = document.getElementById('mainButton');
    const controlsButton = document.getElementById('controlsButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const backToHomeButton = document.getElementById('backToHomeButton');
    const backToHomeFromControls = document.getElementById('backToHomeFromControls');
    const endGameTitle = document.getElementById('endGameTitle');
    const messageBox = document.getElementById('messageBox');
    const gameContainer = document.querySelector('.game-container');
    const player1NameInput = document.getElementById('player1NameInput');
    const player2NameInput = document.getElementById('player2NameInput');
    const player1NameDisplay = document.getElementById('player1Name');
    const player2NameDisplay = document.getElementById('player2Name');
    const player1ScoreDisplay = document.getElementById('player1Score');
    const player2ScoreDisplay = document.getElementById('player2Score');
    const timerDisplay = document.getElementById('timer');

    // Canvas base resolution (scaled visually by CSS)
    const canvasWidth = 800;
    const canvasHeight = 450;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const WIN_SCORE = 7;
    const paddleWidth = 14;
    const paddleHeight = 90;
    const paddleSpeed = 7;
    const ballSize = 12;
    const baseBallSpeed = 5;
    const maxBallSpeed = 13;
    const speedIncrease = 0.4;

    let keys = {};
    let gameStarted = false;
    let gameOver = false;
    let animationFrameId;
    let countdown = 0;
    let countdownActive = false;

    let player1Name = 'JOGADOR 1';
    let player2Name = 'JOGADOR 2';

    let player1 = { y: canvasHeight / 2 - paddleHeight / 2, score: 0, color: '#ff3300' };
    let player2 = { y: canvasHeight / 2 - paddleHeight / 2, score: 0, color: '#00aaff' };

    let ball = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        vx: baseBallSpeed,
        vy: baseBallSpeed * 0.5,
        speed: baseBallSpeed
    };

    function resetBall(direction) {
        ball.x = canvasWidth / 2;
        ball.y = canvasHeight / 2;
        ball.speed = baseBallSpeed;
        const angle = (Math.random() * 0.6 - 0.3); // leve variação vertical
        ball.vx = direction * ball.speed * Math.cos(angle);
        ball.vy = ball.speed * Math.sin(angle) + (Math.random() < 0.5 ? -1 : 1) * 0.5;
    }

    function startCountdown(direction) {
        countdownActive = true;
        countdown = 3;
        resetBall(direction);
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownActive = false;
            }
        }, 700);
    }

    function initGame() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        player1Name = player1NameInput.value.trim() || 'JOGADOR 1';
        player2Name = player2NameInput.value.trim() || 'JOGADOR 2';
        player1NameDisplay.innerText = player1Name;
        player2NameDisplay.innerText = player2Name;

        player1.y = canvasHeight / 2 - paddleHeight / 2;
        player2.y = canvasHeight / 2 - paddleHeight / 2;
        player1.score = 0;
        player2.score = 0;
        player1ScoreDisplay.innerText = '0';
        player2ScoreDisplay.innerText = '0';
        timerDisplay.innerText = 'PRIMEIRO A ' + WIN_SCORE;

        messageBox.style.display = 'none';
        gameContainer.style.display = 'flex';

        keys = {};
        gameStarted = true;
        gameOver = false;

        startCountdown(Math.random() < 0.5 ? 1 : -1);
        animate();
    }

    function endGame(winnerName) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        messageBox.style.display = 'block';
        gameContainer.style.display = 'none';

        homeScreenContent.style.display = 'none';
        controlsScreenContent.style.display = 'none';
        endGameContent.style.display = 'block';

        endGameTitle.innerText = `${winnerName} VENCEU!`;
    }

    function showHomeScreen() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameStarted = false;
        gameOver = false;
        keys = {};

        messageBox.style.display = 'block';
        gameContainer.style.display = 'none';

        controlsScreenContent.style.display = 'none';
        endGameContent.style.display = 'none';
        homeScreenContent.style.display = 'block';
    }

    function showControlsScreen() {
        homeScreenContent.style.display = 'none';
        controlsScreenContent.style.display = 'block';
    }

    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function update() {
        // Move paddles
        if (keys['w']) player1.y -= paddleSpeed;
        if (keys['s']) player1.y += paddleSpeed;
        if (keys['arrowup']) player2.y -= paddleSpeed;
        if (keys['arrowdown']) player2.y += paddleSpeed;

        player1.y = Math.max(0, Math.min(canvasHeight - paddleHeight, player1.y));
        player2.y = Math.max(0, Math.min(canvasHeight - paddleHeight, player2.y));

        if (countdownActive) return;

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top/bottom wall collision
        if (ball.y - ballSize / 2 <= 0) {
            ball.y = ballSize / 2;
            ball.vy *= -1;
        }
        if (ball.y + ballSize / 2 >= canvasHeight) {
            ball.y = canvasHeight - ballSize / 2;
            ball.vy *= -1;
        }

        // Player 1 paddle collision (left)
        const p1X = 20;
        if (
            ball.x - ballSize / 2 <= p1X + paddleWidth &&
            ball.x - ballSize / 2 >= p1X &&
            ball.y >= player1.y &&
            ball.y <= player1.y + paddleHeight &&
            ball.vx < 0
        ) {
            const relativeY = (ball.y - (player1.y + paddleHeight / 2)) / (paddleHeight / 2);
            ball.speed = Math.min(maxBallSpeed, ball.speed + speedIncrease);
            const bounceAngle = relativeY * (Math.PI / 3.2);
            ball.vx = Math.abs(ball.speed * Math.cos(bounceAngle));
            ball.vy = ball.speed * Math.sin(bounceAngle);
            ball.x = p1X + paddleWidth + ballSize / 2;
        }

        // Player 2 paddle collision (right)
        const p2X = canvasWidth - 20 - paddleWidth;
        if (
            ball.x + ballSize / 2 >= p2X &&
            ball.x + ballSize / 2 <= p2X + paddleWidth &&
            ball.y >= player2.y &&
            ball.y <= player2.y + paddleHeight &&
            ball.vx > 0
        ) {
            const relativeY = (ball.y - (player2.y + paddleHeight / 2)) / (paddleHeight / 2);
            ball.speed = Math.min(maxBallSpeed, ball.speed + speedIncrease);
            const bounceAngle = relativeY * (Math.PI / 3.2);
            ball.vx = -Math.abs(ball.speed * Math.cos(bounceAngle));
            ball.vy = ball.speed * Math.sin(bounceAngle);
            ball.x = p2X - ballSize / 2;
        }

        // Scoring
        if (ball.x < -ballSize) {
            player2.score++;
            player2ScoreDisplay.innerText = player2.score;
            if (player2.score >= WIN_SCORE) {
                endGame(player2Name);
                return;
            }
            startCountdown(1);
        } else if (ball.x > canvasWidth + ballSize) {
            player1.score++;
            player1ScoreDisplay.innerText = player1.score;
            if (player1.score >= WIN_SCORE) {
                endGame(player1Name);
                return;
            }
            startCountdown(-1);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Paddles
        drawRect(20, player1.y, paddleWidth, paddleHeight, player1.color);
        drawRect(canvasWidth - 20 - paddleWidth, player2.y, paddleWidth, paddleHeight, player2.color);

        // Ball
        drawCircle(ball.x, ball.y, ballSize / 2, '#ffffff');

        // Countdown
        if (countdownActive) {
            ctx.fillStyle = '#FFD700';
            ctx.font = "40px 'Press Start 2P', cursive";
            ctx.textAlign = 'center';
            ctx.fillText(countdown > 0 ? countdown : 'VAI!', canvasWidth / 2, canvasHeight / 2 - 20);
        }
    }

    function animate() {
        if (gameOver) return;
        update();
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }

    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    mainButton.addEventListener('click', initGame);
    controlsButton.addEventListener('click', showControlsScreen);
    backToHomeFromControls.addEventListener('click', showHomeScreen);
    playAgainButton.addEventListener('click', initGame);
    backToHomeButton.addEventListener('click', showHomeScreen);

    showHomeScreen();
};