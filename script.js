class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.apple = { x: 15, y: 15 };
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;

        this.initializeElements();
        this.updateDisplay();
        this.setupEventListeners();
        this.generateApple();
    }

    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.lengthElement = document.getElementById('length');
        this.bestScoreElement = document.getElementById('bestScore');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayText = document.getElementById('overlayText');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
    }

    setupEventListeners() {
        // Tangentbordsstyrning
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (!this.gameRunning) {
                    this.startGame();
                } else if (this.gamePaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
                return;
            }

            if (!this.gameRunning || this.gamePaused) return;

            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    break;
            }
        });

        // Knappar
        if (this.startBtn) {
            this.startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.gameRunning) {
                    this.startGame();
                }
            });
        }

        this.pauseBtn.addEventListener('click', () => {
            if (this.gamePaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });

        // Overlay klick
        this.gameOverlay.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });

        // Mobilkontroller
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                if (!this.gameRunning || this.gamePaused) return;

                switch(direction) {
                    case 'up':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: -1 };
                        }
                        break;
                    case 'down':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: 1 };
                        }
                        break;
                    case 'left':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: -1, y: 0 };
                        }
                        break;
                    case 'right':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: 1, y: 0 };
                        }
                        break;
                }
            });
        });
    }

    startGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.generateApple();
        this.updateDisplay();
        this.hideOverlay();
        if (this.startBtn) {
            this.startBtn.style.display = 'none';
        }
        if (this.pauseBtn) {
            this.pauseBtn.style.display = 'inline-block';
        }
        this.draw(); // Rita spelet direkt
        this.gameLoop = setInterval(() => this.update(), 150);
    }

    pauseGame() {
        if (!this.gameRunning) return;
        this.gamePaused = true;
        if (this.overlayTitle) {
            this.overlayTitle.textContent = 'Pausad';
        }
        if (this.overlayText) {
            this.overlayText.textContent = 'Tryck på SPACE eller klicka för att fortsätta';
        }
        if (this.gameOverlay) {
            this.gameOverlay.classList.remove('hidden');
        }
    }

    resumeGame() {
        this.gamePaused = false;
        this.hideOverlay();
        this.draw(); // Rita spelet när man fortsätter
    }

    gameOver() {
        this.gameRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.overlayTitle) {
            this.overlayTitle.textContent = 'Game Over!';
        }
        if (this.overlayText) {
            this.overlayText.textContent = `Poäng: ${this.score} | Längd: ${this.snake.length}`;
            
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore.toString());
                this.overlayText.textContent += ' 🎉 Nytt rekord!';
            }
        }

        if (this.gameOverlay) {
            this.gameOverlay.classList.remove('hidden');
        }
        if (this.startBtn) {
            this.startBtn.style.display = 'inline-block';
        }
        if (this.pauseBtn) {
            this.pauseBtn.style.display = 'none';
        }
        this.updateDisplay();
    }

    hideOverlay() {
        if (this.gameOverlay) {
            this.gameOverlay.classList.add('hidden');
        }
    }

    update() {
        if (!this.gameRunning || this.gamePaused) return;

        // Uppdatera riktning
        this.direction = { ...this.nextDirection };

        // Flytta huvudet
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Kolla kollision med väggar
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Kolla kollision med sig själv
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Kolla om ormen äter äpplet
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score += 10;
            this.generateApple();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    generateApple() {
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => 
            segment.x === newApple.x && segment.y === newApple.y
        ));
        this.apple = newApple;
    }

    draw() {
        // Rensa canvas
        this.ctx.fillStyle = '#1a3d0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Rita rutnät
        this.ctx.strokeStyle = '#2d5016';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Rita ormen
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Huvudet
                this.ctx.fillStyle = '#6b8e23';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
                // Ögon
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                const eyeOffset = 5;
                if (this.direction.x === 1) {
                    // Höger
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.direction.x === -1) {
                    // Vänster
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.direction.y === -1) {
                    // Upp
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 5, eyeSize, eyeSize);
                } else if (this.direction.y === 1) {
                    // Ner
                    this.ctx.fillRect(segment.x * this.gridSize + 5, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                }
            } else {
                // Kroppen
                this.ctx.fillStyle = '#8fbc8f';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
            }
        });

        // Rita äpplet
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.apple.x * this.gridSize + this.gridSize / 2,
            this.apple.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        // Äppelstjälk
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(
            this.apple.x * this.gridSize + this.gridSize / 2 - 1,
            this.apple.y * this.gridSize + 2,
            2,
            4
        );
    }

    updateDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.lengthElement) {
            this.lengthElement.textContent = this.snake.length;
        }
        if (this.bestScoreElement) {
            this.bestScoreElement.textContent = this.bestScore;
        }
    }
}

// Starta spelet när sidan laddas
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SnakeGame();
    game.draw();
});