// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const ballSpeed = 5;
const maxBallSpeed = 8;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5.5
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed,
    radius: ballSize,
    speed: ballSpeed
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Game state
let gameRunning = false;
let gameStarted = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameStarted) {
            gameStarted = true;
            gameRunning = true;
        } else if (!gameRunning) {
            gameRunning = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Particle explosion effect
function createExplosion(x, y) {
    const particleCount = 15;
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#00ff80'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;
        const tx = Math.cos(angle) * velocity * 30;
        const ty = Math.sin(angle) * velocity * 30;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = (8 + Math.random() * 6) + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.boxShadow = `0 0 10px ${particle.style.backgroundColor}`;
        
        document.getElementById('explosionContainer').appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    }
}

// Update player paddle with mouse or arrow keys
function updatePlayer() {
    // Mouse control
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    
    // Arrow keys control
    if (keys['arrowup'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['arrowdown'] && player.y + paddleHeight < canvas.height) {
        player.y += player.speed;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + paddleHeight / 2;
    const ballCenter = ball.y;
    
    // AI difficulty - follows ball with slight delay
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }
    
    // Keep computer paddle in bounds
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        createExplosion(ball.x, ball.y);
        
        // Keep ball in bounds
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        } else {
            ball.y = canvas.height - ball.radius;
        }
    }
    
    // Collision with paddles
    checkPaddleCollision(player);
    checkPaddleCollision(computer);
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        createExplosion(ball.x, ball.y);
        resetBall(-ballSpeed);
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        createExplosion(ball.x, ball.y);
        resetBall(ballSpeed);
    }
}

// Check paddle collision
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        createExplosion(ball.x, ball.y);
        
        // Reverse ball direction
        ball.dx = -ball.dx;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy += hitPos * 3;
        
        // Increase ball speed gradually
        ball.speed = Math.min(ball.speed + 0.2, maxBallSpeed);
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
        
        // Prevent ball from getting stuck
        if (paddle === player) {
            ball.x = paddle.x + paddle.width + ball.radius;
        } else {
            ball.x = paddle.x - ball.radius;
        }
    }
}

// Reset ball to center
function resetBall(dx) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = dx;
    ball.dy = (Math.random() - 0.5) * ballSpeed * 2;
    ball.speed = ballSpeed;
    gameRunning = false;
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#00d4ff';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    drawPaddle(player);
    drawPaddle(computer);
    
    // Draw ball
    drawBall();
    
    // Draw "Press SPACE to Start" when not running
    if (!gameRunning && gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.fillText('Press SPACE to Continue', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
    }
    
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.fillText('PONG', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 + 40);
        ctx.shadowBlur = 0;
    }
}

// Draw paddle
function drawPaddle(paddle) {
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Paddle glow
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball glow
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    if (gameStarted) {
        updatePlayer();
        updateComputer();
        
        if (gameRunning) {
            updateBall();
        }
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
