// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Game container styles
const gameStyles = `
    .game-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .game-header {
        width: 100%;
        max-width: 800px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #1a1a1a;
        border-radius: 10px 10px 0 0;
    }
    .game-header h3 {
        color: #fff;
        margin: 0;
    }
    .game-header button {
        background: #ff4444;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    }
    .game-header button:hover {
        background: #cc0000;
    }
    .game-canvas {
        background: #000;
        border-radius: 0 0 10px 10px;
    }
    .game-controls {
        width: 100%;
        max-width: 800px;
        display: flex;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        background: #1a1a1a;
        border-radius: 0 0 10px 10px;
    }
    .game-controls button {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
    }
    .game-controls button:hover {
        background: #388E3C;
    }
`;

// Add game styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = gameStyles;
document.head.appendChild(styleSheet);

// Utility functions
function createGameContainer(title) {
    const container = document.createElement('div');
    container.className = 'game-container';
    container.innerHTML = `
        <div class="game-header">
            <h3>${title}</h3>
            <button onclick="this.parentElement.parentElement.remove()">إغلاق</button>
        </div>
        <canvas class="game-canvas"></canvas>
        <div class="game-controls">
            <button onclick="resetGame()">إعادة تشغيل</button>
        </div>
    `;
    document.body.appendChild(container);
    return container;
}

// Newton's Pendulum Game
function startPendulumGame() {
    const container = createGameContainer('بندول نيوتن');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;
    
    class Pendulum {
        constructor(x, y, length, angle, mass) {
            this.x = x;
            this.y = y;
            this.length = length;
            this.angle = angle;
            this.mass = mass;
            this.angularVelocity = 0;
            this.angularAcceleration = 0;
            this.damping = 0.995;
            this.gravity = 0.5;
            this.ballRadius = 20;
            this.isDragging = false;
        }

        update() {
            if (!this.isDragging) {
                this.angularAcceleration = -this.gravity * Math.sin(this.angle) / this.length;
                this.angularVelocity += this.angularAcceleration;
                this.angularVelocity *= this.damping;
                this.angle += this.angularVelocity;
            }
            
            this.x = canvas.width/2 + Math.sin(this.angle) * this.length;
            this.y = 100 + Math.cos(this.angle) * this.length;
        }

        draw() {
            // Draw string
            ctx.beginPath();
            ctx.moveTo(canvas.width/2, 100);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw ball with gradient
            const gradient = ctx.createRadialGradient(
                this.x - 5, this.y - 5, 0,
                this.x, this.y, this.ballRadius
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#388E3C');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw shadow
            ctx.beginPath();
            ctx.ellipse(
                this.x, 
                this.y + this.ballRadius + 5, 
                this.ballRadius, 
                this.ballRadius/2, 
                0, 0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fill();
        }

        checkCollision(mouseX, mouseY) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            return Math.sqrt(dx * dx + dy * dy) < this.ballRadius;
        }
    }

    const pendulums = [
        new Pendulum(canvas.width/2, 200, 150, Math.PI/4, 1),
        new Pendulum(canvas.width/2, 200, 150, Math.PI/4, 1),
        new Pendulum(canvas.width/2, 200, 150, Math.PI/4, 1),
        new Pendulum(canvas.width/2, 200, 150, Math.PI/4, 1),
        new Pendulum(canvas.width/2, 200, 150, Math.PI/4, 1)
    ];

    let selectedPendulum = null;
    let mouseX = 0;
    let mouseY = 0;

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        pendulums.forEach(pendulum => {
            if (pendulum.checkCollision(mouseX, mouseY)) {
                selectedPendulum = pendulum;
                pendulum.isDragging = true;
            }
        });
    });

    canvas.addEventListener('mousemove', (e) => {
        if (selectedPendulum && selectedPendulum.isDragging) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            const dx = mouseX - canvas.width/2;
            const dy = mouseY - 100;
            selectedPendulum.angle = Math.atan2(dx, dy);
            selectedPendulum.angularVelocity = 0;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedPendulum) {
            selectedPendulum.isDragging = false;
            selectedPendulum = null;
        }
    });

    // Reset game function
    window.resetGame = function() {
        pendulums.forEach(pendulum => {
            pendulum.angle = Math.PI/4;
            pendulum.angularVelocity = 0;
            pendulum.isDragging = false;
        });
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw ceiling
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(canvas.width, 100);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.stroke();

        pendulums.forEach(pendulum => {
            pendulum.update();
            pendulum.draw();
        });

        // Check for collisions between pendulums
        for (let i = 0; i < pendulums.length - 1; i++) {
            const p1 = pendulums[i];
            const p2 = pendulums[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < p1.ballRadius + p2.ballRadius) {
                // Elastic collision
                const tempVel = p1.angularVelocity;
                p1.angularVelocity = p2.angularVelocity;
                p2.angularVelocity = tempVel;
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// Gravity Game
function startGravityGame() {
    const container = createGameContainer('تجربة الجاذبية');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 400;

    class Ball {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = 50;
            this.y = 50;
            this.radius = 15;
            this.velocityX = 0;
            this.velocityY = 0;
            this.gravity = 0.5;
            this.friction = 0.99;
            this.bounce = 0.7;
            this.color = '#2196F3';
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
        }

        update() {
            if (!this.isDragging) {
                this.velocityY += this.gravity;
                this.velocityX *= this.friction;
                this.velocityY *= this.friction;
                
                this.x += this.velocityX;
                this.y += this.velocityY;
                
                // Boundary collisions
                if (this.x + this.radius > canvas.width) {
                    this.x = canvas.width - this.radius;
                    this.velocityX *= -this.bounce;
                }
                if (this.x - this.radius < 0) {
                    this.x = this.radius;
                    this.velocityX *= -this.bounce;
                }
                if (this.y + this.radius > canvas.height) {
                    this.y = canvas.height - this.radius;
                    this.velocityY *= -this.bounce;
                }
                if (this.y - this.radius < 0) {
                    this.y = this.radius;
                    this.velocityY *= -this.bounce;
                }

                // Obstacle collisions
                obstacles.forEach(obstacle => {
                    if (this.checkCollision(obstacle)) {
                        this.handleCollision(obstacle);
                    }
                });
            }
        }

        checkCollision(obstacle) {
            const dx = this.x - Math.max(obstacle.x, Math.min(this.x, obstacle.x + obstacle.width));
            const dy = this.y - Math.max(obstacle.y, Math.min(this.y, obstacle.y + obstacle.height));
            return (dx * dx + dy * dy) < (this.radius * this.radius);
        }

        handleCollision(obstacle) {
            const dx = this.x - (obstacle.x + obstacle.width/2);
            const dy = this.y - (obstacle.y + obstacle.height/2);
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            
            this.velocityX = Math.cos(angle) * speed * this.bounce;
            this.velocityY = Math.sin(angle) * speed * this.bounce;

            const overlap = this.radius - Math.sqrt(dx * dx + dy * dy);
            this.x += Math.cos(angle) * overlap;
            this.y += Math.sin(angle) * overlap;
        }

        draw() {
            const gradient = ctx.createRadialGradient(
                this.x - 5, this.y - 5, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, '#1976D2');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#1976D2';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw shadow
            ctx.beginPath();
            ctx.ellipse(
                this.x, 
                this.y + this.radius + 5, 
                this.radius, 
                this.radius/2, 
                0, 0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fill();

            // Draw grab indicator when hovering
            if (this.isHovered) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            return Math.sqrt(dx * dx + dy * dy) < this.radius;
        }
    }

    class Wall {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.isResizing = false;
            this.resizeHandle = null;
        }

        draw() {
            // Draw wall with gradient
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
            gradient.addColorStop(0, '#FF5722');
            gradient.addColorStop(1, '#F44336');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Draw border
            ctx.strokeStyle = '#D32F2F';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // Draw resize handles
            if (this.isHovered) {
                const handleSize = 8;
                const handles = [
                    { x: this.x, y: this.y }, // Top-left
                    { x: this.x + this.width, y: this.y }, // Top-right
                    { x: this.x, y: this.y + this.height }, // Bottom-left
                    { x: this.x + this.width, y: this.y + this.height } // Bottom-right
                ];

                handles.forEach(handle => {
                    ctx.beginPath();
                    ctx.arc(handle.x, handle.y, handleSize/2, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFF';
                    ctx.fill();
                    ctx.strokeStyle = '#D32F2F';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            }
        }

        isPointInside(x, y) {
            return x >= this.x && x <= this.x + this.width && 
                   y >= this.y && y <= this.y + this.height;
        }

        getResizeHandle(x, y) {
            const handleSize = 8;
            const handles = [
                { pos: 'topLeft', x: this.x, y: this.y },
                { pos: 'topRight', x: this.x + this.width, y: this.y },
                { pos: 'bottomLeft', x: this.x, y: this.y + this.height },
                { pos: 'bottomRight', x: this.x + this.width, y: this.y + this.height }
            ];

            for (const handle of handles) {
                const dx = x - handle.x;
                const dy = y - handle.y;
                if (Math.sqrt(dx * dx + dy * dy) < handleSize) {
                    return handle.pos;
                }
            }
            return null;
        }
    }

    const ball = new Ball();
    const obstacles = [];
    let isPlacingWall = false;
    let wallStartX = 0;
    let wallStartY = 0;
    let selectedWall = null;
    let resizeHandle = null;

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicking on a wall
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const wall = obstacles[i];
            resizeHandle = wall.getResizeHandle(mouseX, mouseY);
            if (resizeHandle) {
                selectedWall = wall;
                wall.isResizing = true;
                return;
            }
            if (wall.isPointInside(mouseX, mouseY)) {
                selectedWall = wall;
                wall.isDragging = true;
                wall.dragOffsetX = mouseX - wall.x;
                wall.dragOffsetY = mouseY - wall.y;
                return;
            }
        }

        // Check if clicking on ball
        if (ball.isPointInside(mouseX, mouseY)) {
            ball.isDragging = true;
            ball.dragOffsetX = mouseX - ball.x;
            ball.dragOffsetY = mouseY - ball.y;
            ball.velocityX = 0;
            ball.velocityY = 0;
            return;
        }

        // Start placing a new wall
        isPlacingWall = true;
        wallStartX = mouseX;
        wallStartY = mouseY;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Update hover states
        ball.isHovered = ball.isPointInside(mouseX, mouseY);
        obstacles.forEach(wall => {
            wall.isHovered = wall.isPointInside(mouseX, mouseY);
        });

        // Handle wall resizing
        if (selectedWall && selectedWall.isResizing) {
            const minSize = 20;
            switch (resizeHandle) {
                case 'topLeft':
                    selectedWall.width = Math.max(minSize, selectedWall.x + selectedWall.width - mouseX);
                    selectedWall.x = mouseX;
                    selectedWall.height = Math.max(minSize, selectedWall.y + selectedWall.height - mouseY);
                    selectedWall.y = mouseY;
                    break;
                case 'topRight':
                    selectedWall.width = Math.max(minSize, mouseX - selectedWall.x);
                    selectedWall.height = Math.max(minSize, selectedWall.y + selectedWall.height - mouseY);
                    selectedWall.y = mouseY;
                    break;
                case 'bottomLeft':
                    selectedWall.width = Math.max(minSize, selectedWall.x + selectedWall.width - mouseX);
                    selectedWall.x = mouseX;
                    selectedWall.height = Math.max(minSize, mouseY - selectedWall.y);
                    break;
                case 'bottomRight':
                    selectedWall.width = Math.max(minSize, mouseX - selectedWall.x);
                    selectedWall.height = Math.max(minSize, mouseY - selectedWall.y);
                    break;
            }
            return;
        }

        // Handle wall dragging
        if (selectedWall && selectedWall.isDragging) {
            selectedWall.x = mouseX - selectedWall.dragOffsetX;
            selectedWall.y = mouseY - selectedWall.dragOffsetY;
            return;
        }

        // Handle ball dragging
        if (ball.isDragging) {
            ball.x = mouseX - ball.dragOffsetX;
            ball.y = mouseY - ball.dragOffsetY;
            return;
        }

        // Handle wall placement
        if (isPlacingWall) {
            // Draw preview wall
            const width = mouseX - wallStartX;
            const height = mouseY - wallStartY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawScene();
            ctx.fillStyle = 'rgba(255, 87, 34, 0.5)';
            ctx.fillRect(wallStartX, wallStartY, width, height);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Finish wall placement
        if (isPlacingWall) {
            const width = Math.abs(mouseX - wallStartX);
            const height = Math.abs(mouseY - wallStartY);
            if (width > 20 && height > 20) {
                obstacles.push(new Wall(
                    Math.min(wallStartX, mouseX),
                    Math.min(wallStartY, mouseY),
                    width,
                    height
                ));
            }
            isPlacingWall = false;
        }

        // Reset dragging states
        if (selectedWall) {
            selectedWall.isDragging = false;
            selectedWall.isResizing = false;
            selectedWall = null;
            resizeHandle = null;
        }

        if (ball.isDragging) {
            ball.isDragging = false;
        }
    });

    function drawScene() {
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw obstacles
        obstacles.forEach(wall => wall.draw());

        // Draw ball
        ball.draw();
    }

    // Reset game function
    window.resetGame = function() {
        ball.reset();
        obstacles.length = 0;
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScene();
        ball.update();
        requestAnimationFrame(animate);
    }

    animate();
}

// Rocket Game
function startRocketGame() {
    const container = createGameContainer('صاروخ الفضاء');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 400;

    class Rocket {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height - 50;
            this.width = 30;
            this.height = 50;
            this.velocityX = 0;
            this.velocityY = 0;
            this.rotation = 0;
            this.fuel = 100;
            this.thrust = 0.2;
            this.gravity = 0.1;
            this.drag = 0.99;
            this.maxSpeed = 5;
            this.acceleration = 0.2;
            this.targetX = this.x;
            this.targetY = this.y;
        }

        update() {
            // Calculate direction to target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Update rotation to face target
            this.rotation = Math.atan2(dy, dx);

            // Apply thrust if not at target
            if (distance > 5) {
                if (this.fuel > 0) {
                    // Calculate desired velocity
                    const targetVelX = (dx / distance) * this.maxSpeed;
                    const targetVelY = (dy / distance) * this.maxSpeed;

                    // Gradually adjust current velocity towards target velocity
                    this.velocityX += (targetVelX - this.velocityX) * this.acceleration;
                    this.velocityY += (targetVelY - this.velocityY) * this.acceleration;

                    // Consume fuel
                    this.fuel = Math.max(0, this.fuel - 0.05);
                }
            }

            // Apply gravity and drag
            this.velocityY += this.gravity;
            this.velocityX *= this.drag;
            this.velocityY *= this.drag;
            
            // Update position
            this.x += this.velocityX;
            this.y += this.velocityY;
            
            // Keep rocket in bounds with bounce effect
            if (this.x < 0) {
                this.x = 0;
                this.velocityX *= -0.5;
            }
            if (this.x > canvas.width) {
                this.x = canvas.width;
                this.velocityX *= -0.5;
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocityY *= -0.5;
            }
            if (this.y > canvas.height) {
                this.y = canvas.height;
                this.velocityY *= -0.5;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Draw rocket body with gradient
            const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
            gradient.addColorStop(0, '#F44336');
            gradient.addColorStop(1, '#B71C1C');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

            // Draw rocket fins
            ctx.fillStyle = '#B71C1C';
            ctx.beginPath();
            ctx.moveTo(-this.width/2, this.height/2);
            ctx.lineTo(-this.width, this.height/2 + 20);
            ctx.lineTo(-this.width/2, this.height/2 + 20);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.width/2, this.height/2);
            ctx.lineTo(this.width, this.height/2 + 20);
            ctx.lineTo(this.width/2, this.height/2 + 20);
            ctx.fill();

            // Draw rocket window
            ctx.fillStyle = '#90CAF9';
            ctx.beginPath();
            ctx.arc(0, -this.height/4, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Draw thrust effect
            if (this.fuel > 0) {
                const thrustLength = 20 + Math.random() * 10;
                ctx.beginPath();
                ctx.moveTo(
                    this.x - Math.cos(this.rotation) * this.height/2,
                    this.y - Math.sin(this.rotation) * this.height/2
                );
                ctx.lineTo(
                    this.x - Math.cos(this.rotation) * (this.height/2 + thrustLength),
                    this.y - Math.sin(this.rotation) * (this.height/2 + thrustLength)
                );
                ctx.strokeStyle = '#FF9800';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw fuel gauge
            ctx.fillStyle = '#333';
            ctx.fillRect(10, 10, 100, 10);
            ctx.fillStyle = this.fuel > 20 ? '#4CAF50' : '#FF5722';
            ctx.fillRect(10, 10, this.fuel, 10);

            // Draw target indicator
            ctx.beginPath();
            ctx.arc(this.targetX, this.targetY, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    const rocket = new Rocket();

    // Mouse movement handler
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        rocket.targetX = e.clientX - rect.left;
        rocket.targetY = e.clientY - rect.top;
    });

    // Reset game function
    window.resetGame = function() {
        rocket.reset();
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw stars with parallax effect
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() * canvas.width + rocket.velocityX * 2) % canvas.width;
            const y = (Math.random() * canvas.height + rocket.velocityY * 2) % canvas.height;
            const size = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        rocket.update();
        rocket.draw();

        requestAnimationFrame(animate);
    }

    animate();
}

// Thermodynamics Game
function startThermodynamicsGame() {
    const container = createGameContainer('الديناميكا الحرارية');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 400;

    class Particle {
        constructor(x, y, temperature) {
            this.x = x;
            this.y = y;
            this.temperature = temperature; // 0 to 1
            this.radius = 5;
            this.velocityX = (Math.random() - 0.5) * 2;
            this.velocityY = (Math.random() - 0.5) * 2;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
        }

        update(particles) {
            if (!this.isDragging) {
                // Update position
                this.x += this.velocityX;
                this.y += this.velocityY;

                // Bounce off walls
                if (this.x < this.radius || this.x > canvas.width - this.radius) {
                    this.velocityX *= -1;
                }
                if (this.y < this.radius || this.y > canvas.height - this.radius) {
                    this.velocityY *= -1;
                }

                // Heat transfer with nearby particles
                particles.forEach(other => {
                    if (other !== this) {
                        const dx = other.x - this.x;
                        const dy = other.y - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 50) {
                            const heatTransfer = 0.01 * (other.temperature - this.temperature);
                            this.temperature += heatTransfer;
                            other.temperature -= heatTransfer;
                            
                            // Clamp temperature
                            this.temperature = Math.max(0, Math.min(1, this.temperature));
                            other.temperature = Math.max(0, Math.min(1, other.temperature));
                        }
                    }
                });
            }
        }

        draw() {
            // Draw particle with temperature-based color
            const hue = (1 - this.temperature) * 240; // Blue (cold) to Red (hot)
            const color = `hsl(${hue}, 100%, 50%)`;
            
            const gradient = ctx.createRadialGradient(
                this.x - 2, this.y - 2, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, `hsl(${hue}, 100%, 30%)`);
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = `hsl(${hue}, 100%, 30%)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw temperature indicator
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(this.temperature * 100) + '°', this.x, this.y - 10);
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            return Math.sqrt(dx * dx + dy * dy) < this.radius;
        }
    }

    const particles = [];
    let selectedParticle = null;

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicking on a particle
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            if (particle.isPointInside(mouseX, mouseY)) {
                selectedParticle = particle;
                particle.isDragging = true;
                particle.dragOffsetX = mouseX - particle.x;
                particle.dragOffsetY = mouseY - particle.y;
                return;
            }
        }

        // Add new particle at click position
        const temperature = mouseY / canvas.height; // Temperature based on vertical position
        particles.push(new Particle(mouseX, mouseY, temperature));
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (selectedParticle && selectedParticle.isDragging) {
            selectedParticle.x = mouseX - selectedParticle.dragOffsetX;
            selectedParticle.y = mouseY - selectedParticle.dragOffsetY;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedParticle) {
            selectedParticle.isDragging = false;
            selectedParticle = null;
        }
    });

    function drawScene() {
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw temperature gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw particles
        particles.forEach(particle => {
            particle.update(particles);
            particle.draw();
        });
    }

    // Reset game function
    window.resetGame = function() {
        particles.length = 0;
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScene();
        requestAnimationFrame(animate);
    }

    animate();
}

function startSimpleMachinesGame() {
    const container = createGameContainer('الآلات البسيطة');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 500;

    class SimpleMachine {
        constructor(type, x, y) {
            this.type = type; // 'lever', 'pulley', 'inclinedPlane'
            this.x = x;
            this.y = y;
            this.width = 100;
            this.height = 20;
            this.angle = 0;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.load = 0;
            this.effort = 0;
            this.mechanicalAdvantage = 1;
            this.rotation = 0;
            this.isRotating = false;
        }

        update() {
            // Calculate mechanical advantage based on machine type and configuration
            switch(this.type) {
                case 'lever':
                    // Mechanical advantage = effort arm / load arm
                    const effortArm = Math.cos(this.angle) * this.width/2;
                    const loadArm = Math.sin(this.angle) * this.width/2;
                    this.mechanicalAdvantage = effortArm / (loadArm || 0.1);
                    break;
                case 'pulley':
                    // Fixed pulley has MA = 1, movable pulley has MA = 2
                    this.mechanicalAdvantage = 2;
                    break;
                case 'inclinedPlane':
                    // MA = 1/sin(angle)
                    this.mechanicalAdvantage = 1 / Math.sin(this.angle);
                    break;
            }
            
            // Calculate effort needed based on load and mechanical advantage
            this.effort = this.load / this.mechanicalAdvantage;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            // Draw machine base
            ctx.fillStyle = '#795548';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Draw machine-specific elements
            switch(this.type) {
                case 'lever':
                    // Draw fulcrum
                    ctx.beginPath();
                    ctx.arc(0, this.height/2, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#5D4037';
                    ctx.fill();
                    break;
                    
                case 'pulley':
                    // Draw pulley wheel
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, 0, Math.PI * 2);
                    ctx.strokeStyle = '#5D4037';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
                    
                case 'inclinedPlane':
                    // Draw surface texture
                    for(let i = 0; i < this.width; i += 10) {
                        ctx.beginPath();
                        ctx.moveTo(-this.width/2 + i, -this.height/2);
                        ctx.lineTo(-this.width/2 + i, this.height/2);
                        ctx.strokeStyle = '#8D6E63';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    break;
            }
            
            // Draw load indicator
            ctx.fillStyle = '#FFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`الحمل: ${this.load.toFixed(1)}N`, 0, -20);
            ctx.fillText(`القوة: ${this.effort.toFixed(1)}N`, 0, -5);
            ctx.fillText(`الميزة: ${this.mechanicalAdvantage.toFixed(1)}x`, 0, 10);
            
            ctx.restore();
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            const rotatedX = dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
            const rotatedY = dx * Math.sin(-this.angle) + dy * Math.cos(-this.angle);
            return Math.abs(rotatedX) < this.width/2 && Math.abs(rotatedY) < this.height/2;
        }
    }

    const machines = [];
    let selectedMachine = null;
    let isPlacingMachine = false;
    let machineType = 'lever';

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicking on a machine
        for (let i = machines.length - 1; i >= 0; i--) {
            const machine = machines[i];
            if (machine.isPointInside(mouseX, mouseY)) {
                selectedMachine = machine;
                machine.isDragging = true;
                machine.dragOffsetX = mouseX - machine.x;
                machine.dragOffsetY = mouseY - machine.y;
                return;
            }
        }

        // Add new machine at click position
        machines.push(new SimpleMachine(machineType, mouseX, mouseY));
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (selectedMachine && selectedMachine.isDragging) {
            selectedMachine.x = mouseX - selectedMachine.dragOffsetX;
            selectedMachine.y = mouseY - selectedMachine.dragOffsetY;
            
            // Update angle based on mouse position
            selectedMachine.angle = Math.atan2(
                mouseY - selectedMachine.y,
                mouseX - selectedMachine.x
            );
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedMachine) {
            selectedMachine.isDragging = false;
            selectedMachine = null;
        }
    });

    // Add machine type selector
    const typeSelector = document.createElement('div');
    typeSelector.className = 'machine-type-selector';
    typeSelector.innerHTML = `
        <button onclick="machineType='lever'">رافعة</button>
        <button onclick="machineType='pulley'">بكرة</button>
        <button onclick="machineType='inclinedPlane'">مستوى مائل</button>
    `;
    container.querySelector('.game-controls').appendChild(typeSelector);

    // Reset game function
    window.resetGame = function() {
        machines.length = 0;
    };

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Update and draw machines
        machines.forEach(machine => {
            machine.update();
            machine.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

function startElectricityCircuitGame() {
    const container = createGameContainer('الدوائر الكهربائية');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;

    // Fixed battery position
    const BATTERY_X = 100;
    const BATTERY_Y = 300;
    const BATTERY_VOLTAGE = 12; // 12V battery

    class CircuitComponent {
        constructor(type, x, y) {
            this.type = type;
            this.x = x;
            this.y = y;
            this.width = 60;
            this.height = 40;
            this.rotation = 0;
            this.voltage = 0;
            this.current = 0;
            this.resistance = type === 'resistor' ? 100 : 
                             type === 'variable_resistor' ? 500 : 
                             type === 'thermistor' ? 200 : 
                             type === 'light_bulb' ? 50 : 0;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.connections = [];
            this.isConnected = false;
            this.temperature = 25; // For thermistor
            this.isOn = false; // For light bulb and switch
            this.connectionPoints = [
                { x: -this.width/2, y: 0 }, // Left
                { x: this.width/2, y: 0 }   // Right
            ];
        }

        update() {
            // Update component properties based on circuit analysis
            if (this.type === 'thermistor') {
                // Thermistor resistance changes with temperature
                this.resistance = 200 * Math.exp(-0.05 * (this.temperature - 25));
            }
            
            if (this.type === 'variable_resistor') {
                // Variable resistor can be adjusted
                this.resistance = 100 + Math.sin(Date.now() * 0.001) * 400;
            }
            
            if (this.type === 'light_bulb') {
                // Light bulb turns on when current is sufficient
                this.isOn = this.current > 0.05;
            }
            
            if (this.type === 'switch') {
                // Switch controls current flow
                this.resistance = this.isOn ? 0.1 : 1000000;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Draw component based on type
            switch(this.type) {
                case 'wire':
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'resistor':
                    // Draw resistor symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(-this.width/4, 0);
                    ctx.lineTo(-this.width/4, -this.height/2);
                    ctx.lineTo(this.width/4, this.height/2);
                    ctx.lineTo(this.width/4, 0);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw resistance value
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(this.resistance)}Ω`, 0, -this.height/2 - 5);
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'variable_resistor':
                    // Draw variable resistor symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(-this.width/4, 0);
                    ctx.lineTo(-this.width/4, -this.height/2);
                    ctx.lineTo(this.width/4, this.height/2);
                    ctx.lineTo(this.width/4, 0);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw arrow for variable resistor
                    ctx.beginPath();
                    ctx.moveTo(0, -this.height/2);
                    ctx.lineTo(0, this.height/2);
                    ctx.stroke();
                    
                    // Draw resistance value
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(this.resistance)}Ω`, 0, -this.height/2 - 5);
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'thermistor':
                    // Draw thermistor symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(-this.width/4, 0);
                    ctx.lineTo(-this.width/4, -this.height/2);
                    ctx.lineTo(this.width/4, this.height/2);
                    ctx.lineTo(this.width/4, 0);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw temperature indicator
                    ctx.fillStyle = '#F44336';
                    ctx.beginPath();
                    ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw temperature value
                    ctx.fillStyle = '#000';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${Math.round(this.temperature)}°C`, 0, -this.height/2 - 5);
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'voltmeter':
                    // Draw voltmeter symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Draw V symbol
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('V', 0, 5);
                    
                    // Draw voltage value
                    ctx.font = '12px Arial';
                    ctx.fillText(`${this.voltage.toFixed(1)}V`, 0, this.height/2 + 15);
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'ammeter':
                    // Draw ammeter symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Draw A symbol
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('A', 0, 5);
                    
                    // Draw current value
                    ctx.font = '12px Arial';
                    ctx.fillText(`${(this.current * 1000).toFixed(1)}mA`, 0, this.height/2 + 15);
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'led':
                    // Draw LED symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(-this.width/4, 0);
                    ctx.lineTo(0, -this.height/2);
                    ctx.lineTo(this.width/4, 0);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw LED glow if current is flowing
                    if (this.current > 0) {
                        ctx.fillStyle = `rgba(255, 255, 0, ${Math.min(1, this.current * 10)})`;
                        ctx.beginPath();
                        ctx.arc(0, 0, this.width/3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'light_bulb':
                    // Draw light bulb
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    
                    // Draw base
                    ctx.beginPath();
                    ctx.moveTo(-this.width/4, this.height/4);
                    ctx.lineTo(this.width/4, this.height/4);
                    ctx.lineTo(this.width/6, this.height/2);
                    ctx.lineTo(-this.width/6, this.height/2);
                    ctx.closePath();
                    ctx.stroke();
                    
                    // Draw glass bulb
                    ctx.beginPath();
                    ctx.arc(0, -this.height/4, this.width/3, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Draw filament
                    ctx.beginPath();
                    ctx.moveTo(-this.width/6, -this.height/4);
                    ctx.lineTo(this.width/6, -this.height/4);
                    ctx.stroke();
                    
                    // Draw glow if on
                    if (this.isOn) {
                        // Inner glow
                        ctx.fillStyle = `rgba(255, 255, 200, ${Math.min(0.8, this.current * 5)})`;
                        ctx.beginPath();
                        ctx.arc(0, -this.height/4, this.width/3 - 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Outer glow
                        ctx.fillStyle = `rgba(255, 255, 150, ${Math.min(0.4, this.current * 2)})`;
                        ctx.beginPath();
                        ctx.arc(0, -this.height/4, this.width/2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
                    
                case 'switch':
                    // Draw switch symbol
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-this.width/2, 0);
                    ctx.lineTo(-this.width/4, 0);
                    ctx.arc(0, 0, this.width/4, 0, Math.PI);
                    ctx.lineTo(this.width/2, 0);
                    ctx.stroke();
                    
                    // Draw switch state
                    if (this.isOn) {
                        ctx.beginPath();
                        ctx.moveTo(-this.width/4, 0);
                        ctx.lineTo(this.width/4, 0);
                        ctx.stroke();
                    }
                    
                    // Draw connection points
                    this.drawConnectionPoints();
                    break;
            }
            
            ctx.restore();
        }
        
        drawConnectionPoints() {
            ctx.fillStyle = '#666';
            this.connectionPoints.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            const rotatedX = dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
            const rotatedY = dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);
            return Math.abs(rotatedX) < this.width/2 && Math.abs(rotatedY) < this.height/2;
        }
        
        getConnectionPoint(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            const rotatedX = dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
            const rotatedY = dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);
            
            // Check if near a connection point
            for (let i = 0; i < this.connectionPoints.length; i++) {
                const point = this.connectionPoints[i];
                const pointDx = point.x - rotatedX;
                const pointDy = point.y - rotatedY;
                const distance = Math.sqrt(pointDx * pointDx + pointDy * pointDy);
                
                if (distance < 10) {
                    // Convert back to canvas coordinates
                    const worldX = this.x + point.x * Math.cos(this.rotation) - point.y * Math.sin(this.rotation);
                    const worldY = this.y + point.x * Math.sin(this.rotation) + point.y * Math.cos(this.rotation);
                    return { x: worldX, y: worldY, index: i };
                }
            }
            
            return null;
        }
    }

    // Create components array
    const components = [];
    
    // Add fixed battery
    const battery = new CircuitComponent('battery', BATTERY_X, BATTERY_Y);
    battery.voltage = BATTERY_VOLTAGE;
    components.push(battery);
    
    // Add component selector
    const componentSelector = document.createElement('div');
    componentSelector.className = 'component-selector';
    componentSelector.innerHTML = `
        <div class="component-group">
            <h4>المكونات:</h4>
            <button onclick="addComponent('wire')">سلك</button>
            <button onclick="addComponent('resistor')">مقاومة</button>
            <button onclick="addComponent('variable_resistor')">مقاومة متغيرة</button>
            <button onclick="addComponent('thermistor')">مقاومة حرارية</button>
            <button onclick="addComponent('led')">LED</button>
            <button onclick="addComponent('light_bulb')">مصباح</button>
            <button onclick="addComponent('switch')">مفتاح</button>
            <button onclick="addComponent('voltmeter')">فولتميتر</button>
            <button onclick="addComponent('ammeter')">أمبيرمتر</button>
        </div>
    `;
    container.querySelector('.game-controls').appendChild(componentSelector);
    
    // Function to add a new component
    window.addComponent = function(type) {
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        components.push(new CircuitComponent(type, x, y));
    };
    
    // Mouse event handlers
    let selectedComponent = null;
    let isConnecting = false;
    let connectionStart = null;
    let connectionStartPoint = null;
    let mouseX = 0;
    let mouseY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // Check if clicking on a component
        for (let i = components.length - 1; i >= 0; i--) {
            const component = components[i];
            
            // Check if clicking on a connection point
            const connectionPoint = component.getConnectionPoint(mouseX, mouseY);
            if (connectionPoint) {
                isConnecting = true;
                connectionStart = component;
                connectionStartPoint = connectionPoint;
                return;
            }
            
            // Check if clicking on the component itself
            if (component.isPointInside(mouseX, mouseY)) {
                selectedComponent = component;
                component.isDragging = true;
                component.dragOffsetX = mouseX - component.x;
                component.dragOffsetY = mouseY - component.y;
                
                // Toggle switch if clicked
                if (component.type === 'switch') {
                    component.isOn = !component.isOn;
                }
                
                return;
            }
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        if (selectedComponent && selectedComponent.isDragging) {
            selectedComponent.x = mouseX - selectedComponent.dragOffsetX;
            selectedComponent.y = mouseY - selectedComponent.dragOffsetY;
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        if (isConnecting) {
            // Find component under mouse
            for (let i = components.length - 1; i >= 0; i--) {
                const component = components[i];
                if (component !== connectionStart) {
                    // Check if near a connection point
                    const connectionPoint = component.getConnectionPoint(mouseX, mouseY);
                    if (connectionPoint) {
                        // Connect components
                        if (!connectionStart.connections.includes(component)) {
                            connectionStart.connections.push(component);
                            connectionStart.isConnected = true;
                        }
                        if (!component.connections.includes(connectionStart)) {
                            component.connections.push(connectionStart);
                            component.isConnected = true;
                        }
                        break;
                    }
                }
            }
            isConnecting = false;
            connectionStart = null;
            connectionStartPoint = null;
        }
        
        if (selectedComponent) {
            selectedComponent.isDragging = false;
            selectedComponent = null;
        }
    });
    
    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Function to calculate circuit properties
    function calculateCircuit() {
        // Reset all components
        components.forEach(component => {
            component.voltage = 0;
            component.current = 0;
        });
        
        // Set battery voltage
        battery.voltage = BATTERY_VOLTAGE;
        
        // Simple circuit analysis
        let totalResistance = 0;
        let componentsInCircuit = [];
        
        // Find all components connected to the battery
        function findConnectedComponents(component, visited = new Set()) {
            if (visited.has(component)) return;
            visited.add(component);
            componentsInCircuit.push(component);
            
            component.connections.forEach(connected => {
                findConnectedComponents(connected, visited);
            });
        }
        
        // Start from battery
        findConnectedComponents(battery);
        
        // Calculate total resistance
        componentsInCircuit.forEach(component => {
            if (component.type === 'resistor' || 
                component.type === 'variable_resistor' || 
                component.type === 'thermistor' ||
                component.type === 'light_bulb' ||
                (component.type === 'switch' && !component.isOn)) {
                totalResistance += component.resistance;
            }
        });
        
        // Calculate current (I = V/R)
        const totalCurrent = totalResistance > 0 ? battery.voltage / totalResistance : 0;
        
        // Set current for all components in circuit
        componentsInCircuit.forEach(component => {
            component.current = totalCurrent;
            
            // Set voltage for components based on their resistance
            if (component.type === 'resistor' || 
                component.type === 'variable_resistor' || 
                component.type === 'thermistor' ||
                component.type === 'light_bulb' ||
                (component.type === 'switch' && !component.isOn)) {
                component.voltage = totalCurrent * component.resistance;
            } else if (component.type === 'voltmeter') {
                // Voltmeter measures voltage across connected components
                if (component.connections.length > 0) {
                    const connected = component.connections[0];
                    component.voltage = connected.voltage;
                }
            }
        });
    }
    
    function drawConnections() {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        
        components.forEach(component => {
            component.connections.forEach(connected => {
                ctx.beginPath();
                ctx.moveTo(component.x, component.y);
                ctx.lineTo(connected.x, connected.y);
                ctx.stroke();
            });
        });
    }
    
    function drawBattery() {
        ctx.save();
        ctx.translate(BATTERY_X, BATTERY_Y);
        
        // Draw battery body
        ctx.fillStyle = '#f0f0f0';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.fillRect(-30, -20, 60, 40);
        ctx.strokeRect(-30, -20, 60, 40);
        
        // Draw battery terminals
        ctx.fillStyle = '#333';
        ctx.fillRect(-5, -30, 10, 10);
        ctx.fillRect(-5, 20, 10, 10);
        
        // Draw + and - symbols
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', 0, -40);
        ctx.fillText('-', 0, 45);
        
        // Draw voltage
        ctx.font = '14px Arial';
        ctx.fillText(`${BATTERY_VOLTAGE}V`, 0, 0);
        
        // Draw connection points
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(-30, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(30, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw connections
        drawConnections();
        
        // Draw battery
        drawBattery();
        
        // Update and draw components
        components.forEach(component => {
            if (component.type !== 'battery') {
                component.update();
                component.draw();
            }
        });
        
        // Draw connection line while connecting
        if (isConnecting && connectionStartPoint) {
            ctx.beginPath();
            ctx.moveTo(connectionStartPoint.x, connectionStartPoint.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = '#F44336';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Calculate circuit properties
        calculateCircuit();
        
        requestAnimationFrame(animate);
    }

    animate();
}

// Wave Interference Game
function startWaveInterferenceGame() {
    const container = createGameContainer('تداخل الموجات');
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 500;

    class Wave {
        constructor(x, y, amplitude, frequency, phase, color) {
            this.x = x;
            this.y = y;
            this.amplitude = amplitude;
            this.frequency = frequency;
            this.phase = phase;
            this.color = color;
            this.isDragging = false;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.time = 0;
            this.waveType = 'transverse'; // 'transverse' or 'longitudinal'
        }

        update() {
            this.time += 0.05;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Draw wave source
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw wave circles
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            for(let r = 20; r < 200; r += 20) {
                const alpha = 1 - (r - 20) / 180;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            
            // Draw wave pattern based on type
            if (this.waveType === 'transverse') {
                this.drawTransverseWave();
            } else {
                this.drawLongitudinalWave();
            }
            
            ctx.restore();
        }

        drawTransverseWave() {
            ctx.beginPath();
            for(let x = -200; x <= 200; x += 2) {
                const y = this.amplitude * Math.sin(this.frequency * x + this.phase + this.time);
                if(x === -200) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        drawLongitudinalWave() {
            const spacing = 10;
            const numPoints = 40;
            const waveLength = 400;
            
            ctx.beginPath();
            for(let i = 0; i <= numPoints; i++) {
                const x = -waveLength/2 + (waveLength * i / numPoints);
                const displacement = this.amplitude * Math.sin(this.frequency * x + this.phase + this.time);
                
                // Draw compression and rarefaction
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, displacement, spacing/2 * (1 + Math.sin(this.frequency * x + this.phase + this.time)), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        isPointInside(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            return Math.sqrt(dx * dx + dy * dy) < 20;
        }

        getWaveHeight(x, y) {
            const dx = x - this.x;
            const dy = y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return this.amplitude * Math.sin(this.frequency * distance + this.phase + this.time) / (1 + distance * 0.01);
        }
    }

    const waves = [];
    let selectedWave = null;
    let waveType = 'sine';
    let waveColor = '#2196F3';

    // Mouse event handlers
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if clicking on a wave
        for (let i = waves.length - 1; i >= 0; i--) {
            const wave = waves[i];
            if (wave.isPointInside(mouseX, mouseY)) {
                selectedWave = wave;
                wave.isDragging = true;
                wave.dragOffsetX = mouseX - wave.x;
                wave.dragOffsetY = mouseY - wave.y;
                return;
            }
        }

        // Add new wave at click position
        const colors = ['#2196F3', '#4CAF50', '#F44336', '#FFC107', '#9C27B0'];
        waveColor = colors[waves.length % colors.length];
        waves.push(new Wave(mouseX, mouseY, 20, 0.1, 0, waveColor));
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (selectedWave && selectedWave.isDragging) {
            selectedWave.x = mouseX - selectedWave.dragOffsetX;
            selectedWave.y = mouseY - selectedWave.dragOffsetY;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (selectedWave) {
            selectedWave.isDragging = false;
            selectedWave = null;
        }
    });

    // Add wave controls
    const waveControls = document.createElement('div');
    waveControls.className = 'wave-controls';
    waveControls.innerHTML = `
        <div class="control-group">
            <label>نوع الموجة:</label>
            <select onchange="waveType=this.value">
                <option value="sine">جيبية</option>
                <option value="square">مربعة</option>
                <option value="triangle">مثلثية</option>
                <option value="sawtooth">منشارية</option>
            </select>
        </div>
        <div class="control-group">
            <label>نوع الحركة:</label>
            <select onchange="waves.forEach(w => w.waveType = this.value)">
                <option value="transverse">مستعرضة</option>
                <option value="longitudinal">طولية</option>
            </select>
        </div>
        <div class="control-group">
            <label>السعة:</label>
            <input type="range" min="5" max="50" value="20" onchange="waves.forEach(w => w.amplitude = parseInt(this.value))">
        </div>
        <div class="control-group">
            <label>التردد:</label>
            <input type="range" min="0.01" max="0.2" step="0.01" value="0.1" onchange="waves.forEach(w => w.frequency = parseFloat(this.value))">
        </div>
    `;
    container.querySelector('.game-controls').appendChild(waveControls);

    // Reset game function
    window.resetGame = function() {
        waves.length = 0;
    };

    function drawInterferencePattern() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for(let y = 0; y < canvas.height; y++) {
            for(let x = 0; x < canvas.width; x++) {
                let totalHeight = 0;
                waves.forEach(wave => {
                    totalHeight += wave.getWaveHeight(x, y);
                });
                
                // Convert wave height to color
                const intensity = Math.abs(totalHeight) / 40;
                const color = intensity > 1 ? '#FFF' : 
                             intensity > 0.5 ? '#AAA' : 
                             intensity > 0.2 ? '#555' : '#000';
                
                const index = (y * canvas.width + x) * 4;
                const rgb = color.match(/\w\w/g).map(x => parseInt(x, 16));
                data[index] = rgb[0];
                data[index + 1] = rgb[1];
                data[index + 2] = rgb[2];
                data[index + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Update and draw waves
        waves.forEach(wave => {
            wave.update();
            wave.draw();
        });

        // Draw interference pattern
        drawInterferencePattern();

        requestAnimationFrame(animate);
    }

    animate();
}

// Reveal animations on scroll
function reveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-fade-left, .reveal-fade-right');
    
    reveals.forEach((reveal, index) => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

// Add order variable to grid items for staggered animation
function addOrderToGridItems() {
    const gridItems = document.querySelectorAll('.game-card, .lesson-card, .scientist-card');
    gridItems.forEach((item, index) => {
        item.style.setProperty('--order', index);
    });
}

// Initialize reveal animations
window.addEventListener('scroll', reveal);
window.addEventListener('load', () => {
    reveal();
    addOrderToGridItems();
});

// Function to play all YouTube videos
function playAllVideos() {
    const videos = document.querySelectorAll('iframe');
    videos.forEach(video => {
        if (video.src.includes('youtube.com')) {
            // Extract video ID from the URL
            const videoId = video.src.split('/').pop().split('?')[0];
            // Create a new URL with autoplay parameter
            video.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
    });
}

// Add event listener for the play all videos button
document.addEventListener('DOMContentLoaded', function() {
    // Create and add the play all button
    const playAllButton = document.createElement('button');
    playAllButton.textContent = 'تشغيل جميع الفيديوهات';
    playAllButton.className = 'play-all-button';
    playAllButton.onclick = playAllVideos;
    
    // Add the button to the scientists section
    const scientistsSection = document.querySelector('.scientists-section');
    if (scientistsSection) {
        scientistsSection.insertBefore(playAllButton, scientistsSection.firstChild);
    }
}); 