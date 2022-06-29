"use strict";

(() => {
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Balls {
        constructor() {
            this.balls = []
            this.maxChangeUpCommandCount = rand(3, 10)
            this.changeUpCount = 0
            this.changeUpCommand()
            console.log("max change up command count: ", this.maxChangeUpCommandCount)
        }

        add(ball) {
            this.balls.push(ball)
        }

        getBalls() {
            return this.balls;
        }

        update() {
            this.balls.forEach(ball => ball.update())
        }

        changeUpCommand() {
            addEventListener("keydown", (e) => {
                if (e.code === "Space" && !e.repeat) {
                    this.balls.forEach(ball => ball.changeUpCommand(e))
                }
            });
        }

        isAllMissed() {
            const aliveBalls = this.balls.filter(ball => ball.getMissedStatus() === false)
            return aliveBalls.length === 0
        }

        draw() {
            this.balls.forEach(ball => ball.draw())
        }
    }

    class Ball {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext("2d");
            this.x = rand(30, 250);
            this.y = 30;
            this.r = 10;
            this.vx = rand(2, 4) * (Math.random() < 0.5 ? 1 : -1);
            this.vy = rand(2, 4);
            this.isMissed = false;
        }

        // スペースキー押下で下移動のボールのみ、上移動に変換する
        changeUpCommand() {
            if (!this.isMissed && this.vy > 0) {
                this.vy *= -1
            }
        }

        getMissedStatus() {
            return this.isMissed;
        }

        bounce() {
            this.vy *= -1;
        }

        reposition(paddleTop) {
            this.y = paddleTop - this.r;
        }

        getX() {
            return this.x;
        }

        getY() {
            return this.y;
        }

        getR() {
            return this.r;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.y - this.r > this.canvas.height) {
                this.isMissed = true;
            }

            if (this.x - this.r < 0 || this.x + this.r > this.canvas.width) {
                this.vx *= -1;
            }

            if (this.y - this.r < 0) {
                this.vy *= -1;
            }
        }

        draw() {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#fdfdfd";
            this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    class Paddle {
        constructor(canvas, game) {
            this.canvas = canvas;
            this.game = game;
            this.ctx = this.canvas.getContext("2d");
            this.w = 60;
            this.h = 16;
            this.x = this.canvas.width / 2 - this.w / 2;
            this.y = this.canvas.height - 32;
            this.mouseX = this.x;
            this.addHandler();
        }

        addHandler() {
            document.addEventListener("mousemove", (e) => {
                this.mouseX = e.clientX;
            });
        }

        update(ball) {
            const ballBottom = ball.getY() + ball.getR();
            const paddleTop = this.y;
            const ballTop = ball.getY() - ball.getR();
            const paddleBottom = this.y + this.h;
            const ballCenter = ball.getX();
            const paddleLeft = this.x;
            const paddleRight = this.x + this.w;

            if (
                ballBottom > paddleTop &&
                ballTop < paddleBottom &&
                ballCenter > paddleLeft &&
                ballCenter < paddleRight
            ) {
                ball.bounce();
                ball.reposition(paddleTop);
                this.game.addScore();
            }

            const rect = this.canvas.getBoundingClientRect();
            this.x = this.mouseX - rect.left - this.w / 2;

            if (this.x < 0) {
                this.x = 0;
            }
            if (this.x + this.w > this.canvas.width) {
                this.x = this.canvas.width - this.w;
            }
        }

        draw() {
            this.ctx.fillStyle = "#fdfdfd";
            this.ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext("2d");
            this.paddle = new Paddle(this.canvas, this);
            this.isGameOver = false;
            this.score = 0;

            this.balls = new Balls()
            for (let i = 0; i < rand(3, 6); i++) {
                this.balls.add(new Ball(this.canvas))
            }
        }

        addScore() {
            this.score++;
        }

        start() {
            this.loop()
        }

        loop() {
            if (this.isGameOver) {
                return;
            }

            this.update();
            this.draw();

            requestAnimationFrame(() => {
                this.loop();
            });
        }

        update() {
            this.balls.update();
            this.balls.getBalls().forEach(ball => this.paddle.update(ball));


            if (this.balls.isAllMissed()) {
                this.isGameOver = true;
            }
        }

        draw() {
            if (this.isGameOver) {
                this.drawGameOver();
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.balls.draw();
            this.paddle.draw();
            this.drawScore();
        }

        drawGameOver() {
            this.ctx.font = '28px "Arial Black"';
            this.ctx.fillStyle = "tomato";
            this.ctx.fillText("Game Over", 50, 150);
        }

        drawScore() {
            this.ctx.font = "20px Arial";
            this.ctx.fillStyle = "#fdfdfd";
            this.ctx.fillText(this.score, 10, 25);
        }
    }
    const canvas = document.querySelector("canvas");
    if (typeof canvas.getContext === "undefined") {
        return;
    }

    const game = new Game(canvas);
    game.start()
})();
