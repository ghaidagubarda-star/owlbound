
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");

let state = "ready";
let score = 0;
let best = 0;
let frame = 0;
let speed = 3;
let pipes = [];
let particles = [];

let owl = {
    x: 170,
    y: 230,
    velocity: 0,
    rotation: 0
};

const random = (min, max) =>
    Math.random() * (max - min) + min;

const stars = Array.from({ length: 100 }, () => ({
    x: random(0, W),
    y: random(0, H * 0.7),
    size: random(1, 2.5),
    phase: random(0, 6)
}));

function resetGame() {
    score = 0;
    frame = 0;
    speed = 3;
    pipes = [];
    particles = [];

    owl = {
        x: 170,
        y: 230,
        velocity: 0,
        rotation: 0
    };

    scoreText.textContent = score;
}

function startGame() {
    resetGame();
    state = "playing";
    overlay.style.display = "none";
    flap();
}

function flap() {
    if (state === "ready" || state === "over") {
        startGame();
        return;
    }

    if (state === "playing") {
        owl.velocity = -7;

        for (let i = 0; i < 5; i++) {
            particles.push({
                x: owl.x - 15,
                y: owl.y + 8,
                vx: random(-2, -0.5),
                vy: random(-1, 2),
                life: 25
            });
        }
    }
}

startButton.addEventListener("click", startGame);

canvas.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    flap();
});

window.addEventListener("keydown", function(event) {
    if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
        event.preventDefault();

        if (!event.repeat) {
            flap();
        }
    }
});

function drawBackground() {
    // Langit fantasi
    const sky = ctx.createLinearGradient(0, 0, 0, H);

    sky.addColorStop(0, "#17163e");
    sky.addColorStop(0.5, "#514078");
    sky.addColorStop(1, "#d17c91");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Bulan bercahaya
    ctx.save();
    ctx.shadowBlur = 35;
    ctx.shadowColor = "#fff0bd";
    ctx.fillStyle = "#fff0c8";

    ctx.beginPath();
    ctx.arc(650, 90, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bintang
    stars.forEach(star => {
        ctx.globalAlpha =
            0.4 + 0.5 * Math.sin(frame * 0.03 + star.phase);

        ctx.fillStyle = "#fff4d4";

        ctx.beginPath();
        ctx.arc(
            (star.x - frame * 0.1 + W) % W,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Pegunungan
    drawMountain(330, "#34305f", 0.2);
    drawMountain(390, "#28254f", 0.4);

    // Hutan ajaib
    for (let i = 0; i < 17; i++) {
        const x = (i * 65 - frame * 0.5 + W * 4) % (W + 50);
        const base = H - 35;
        const treeHeight = 50 + (i * 37 % 50);

        ctx.fillStyle = "#211d49";
        ctx.beginPath();
        ctx.moveTo(x - 25, base);
        ctx.lineTo(x, base - treeHeight);
        ctx.lineTo(x + 25, base);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#8ee7d0";
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, base - 45, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Kabut
    for (let i = 0; i < 5; i++) {
        const x = (i * 200 - frame * 0.3 + W * 3) % W;

        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#f4c5e7";

        ctx.beginPath();
        ctx.ellipse(x, H - 20, 100, 25, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function drawMountain(height, color, movement) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);

    for (let x = 0; x <= W + 100; x += 100) {
        const y =
            height +
            Math.sin(x * 0.015) * 45 +
            Math.sin(x * 0.03) * 25;

        ctx.lineTo(x - (frame * movement) % 100, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
}

function drawGate(pipe) {
    const gap = 165;
    const topHeight = pipe.gapY - gap / 2;
    const bottomY = pipe.gapY + gap / 2;

    function tower(x, y, w, h, upsideDown) {
        const gradient = ctx.createLinearGradient(x, 0, x + w, 0);

        gradient.addColorStop(0, "#413b7e");
        gradient.addColorStop(0.5, "#a08de5");
        gradient.addColorStop(1, "#51417f");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#e0d3ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 4, y + 3, w - 8, h - 6);

        // Hiasan kristal
        ctx.fillStyle = "#f5d9ff";

        for (let yy = y + 20; yy < y + h - 10; yy += 40) {
            ctx.beginPath();
            ctx.moveTo(x + w / 2, yy - 8);
            ctx.lineTo(x + w / 2 + 6, yy);
            ctx.lineTo(x + w / 2, yy + 8);
            ctx.lineTo(x + w / 2 - 6, yy);
            ctx.closePath();
            ctx.fill();
        }

        // Kristal bercahaya
        ctx.fillStyle = "#8bf4e7";
        ctx.shadowColor = "#75f8ef";
        ctx.shadowBlur = 15;

        ctx.beginPath();

        if (!upsideDown) {
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + w / 2, y - 22);
            ctx.lineTo(x + w + 8, y);
        } else {
            ctx.moveTo(x - 8, y + h);
            ctx.lineTo(x + w / 2, y + h + 22);
            ctx.lineTo(x + w + 8, y + h);
        }

        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    tower(pipe.x, 0, 65, topHeight, false);
    tower(pipe.x, bottomY, 65, H - bottomY, true);
}

function drawOwl() {
    ctx.save();
    ctx.translate(owl.x, owl.y);
    ctx.rotate(owl.rotation);

    // Ekor
    ctx.fillStyle = "#79503f";
    ctx.beginPath();
    ctx.moveTo(-20, 5);
    ctx.lineTo(-35, -2);
    ctx.lineTo(-30, 15);
    ctx.closePath();
    ctx.fill();

    // Telinga
    ctx.fillStyle = "#8c5d4b";

    ctx.beginPath();
    ctx.moveTo(-20, -16);
    ctx.lineTo(-27, -35);
    ctx.lineTo(-5, -22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(8, -22);
    ctx.lineTo(27, -35);
    ctx.lineTo(22, -13);
    ctx.closePath();
    ctx.fill();

    // Tubuh
    const body = ctx.createRadialGradient(-5, -10, 2, 0, 3, 32);
    body.addColorStop(0, "#d7a36b");
    body.addColorStop(1, "#79503f");

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 3, 27, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Perut
    ctx.fillStyle = "#f6dfb1";
    ctx.beginPath();
    ctx.ellipse(3, 12, 17, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sayap bergerak
    ctx.save();
    ctx.translate(-9, 4);
    ctx.rotate(Math.sin(frame * 0.45) * 0.35);

    ctx.fillStyle = "#9b684b";
    ctx.beginPath();
    ctx.ellipse(-7, 2, 17, 9, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Mata
    ctx.fillStyle = "#f7e6c4";
    ctx.beginPath();
    ctx.ellipse(-10, -9, 12, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -9, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#2b2342";
    ctx.beginPath();
    ctx.arc(-8, -8, 5, 0, Math.PI * 2);
    ctx.arc(12, -8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Kilauan mata
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-9, -10, 1.7, 0, Math.PI * 2);
    ctx.arc(11, -10, 1.7, 0, Math.PI * 2);
    ctx.fill();

    // Paruh
    ctx.fillStyle = "#f6b84e";
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(5, -1);
    ctx.lineTo(1, 6);
    ctx.closePath();
    ctx.fill();

    // Kaki
    ctx.strokeStyle = "#e9a94b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, 28);
    ctx.lineTo(-8, 32);
    ctx.lineTo(-13, 32);
    ctx.moveTo(8, 28);
    ctx.lineTo(8, 32);
    ctx.lineTo(13, 32);
    ctx.stroke();

    // Topi penyihir
    ctx.fillStyle = "#40366f";
    ctx.beginPath();
    ctx.moveTo(-20, -22);
    ctx.lineTo(-5, -51);
    ctx.lineTo(10, -21);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#f5d98e";
    ctx.beginPath();
    ctx.ellipse(-5, -22, 18, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life / 25);
        ctx.fillStyle = "#ffe3a0";

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function gameOver() {
    if (state !== "playing") return;

    state = "over";

    best = Math.max(best, score);
    bestText.textContent = best;

    overlay.style.display = "flex";
    gameTitle.textContent = "The Magic Fades...";
    gameDescription.textContent =
        `Kamu berhasil melewati ${score} gerbang kristal! ` +
        "Coba lagi dan terbang lebih jauh.";

    startButton.textContent = "Terbang Lagi ✨";
}

function update() {
    frame++;

    if (state === "playing") {
        owl.velocity += 0.35;
        owl.y += owl.velocity;

        owl.rotation = Math.min(
            0.7,
            Math.max(-0.5, owl.velocity * 0.07)
        );

        // Membuat rintangan
        if (frame % 95 === 0) {
            pipes.push({
                x: W + 20,
                gapY: random(155, H - 155),
                passed: false
            });
        }

        pipes.forEach(pipe => {
            pipe.x -= speed;

            // Menambah skor
            if (!pipe.passed && pipe.x + 65 < owl.x) {
                pipe.passed = true;
                score++;
                scoreText.textContent = score;
                speed = Math.min(4.8, 3 + score * 0.035);
            }

            // Deteksi tabrakan
            const gap = 165;
            const topHeight = pipe.gapY - gap / 2;
            const bottomY = pipe.gapY + gap / 2;

            if (
                owl.x + 20 > pipe.x &&
                owl.x - 20 < pipe.x + 65 &&
                (
                    owl.y - 22 < topHeight ||
                    owl.y + 22 > bottomY
                )
            ) {
                gameOver();
            }
        });

        pipes = pipes.filter(pipe => pipe.x > -100);

        if (owl.y > H - 25 || owl.y < 0) {
            gameOver();
        }

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });

        particles = particles.filter(p => p.life > 0);

    } else if (state === "ready") {
        owl.y = 230 + Math.sin(frame * 0.045) * 9;
        owl.rotation = Math.sin(frame * 0.045) * 0.04;
    }
}

function draw() {
    drawBackground();

    pipes.forEach(drawGate);

    // Kabut di bawah
    const mist = ctx.createLinearGradient(0, H - 80, 0, H);
    mist.addColorStop(0, "#b1a1db00");
    mist.addColorStop(1, "#d6b4e744");

    ctx.fillStyle = mist;
    ctx.fillRect(0, H - 80, W, 80);

    drawParticles();
    drawOwl();

    if (state === "ready") {
        ctx.fillStyle = "#fff3d0";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";

        ctx.fillText(
            "KLIK ATAU TEKAN SPACE UNTUK TERBANG",
            W / 2,
            H - 25
        );
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

bestText.textContent = best;
gameLoop();
    