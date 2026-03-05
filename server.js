<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>JDZ</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>

/* ---------- GLOBAL ---------- */

body {
    margin: 0;
    background: #000;
    font-family: 'Segoe UI', sans-serif;
    color: #d6d6d6;
    overflow-x: hidden;
}

section {
    padding: 100px 8%;
}

/* Neon gradient */
:root {
    --blue: #3A7BFF;
    --purple: #A259FF;
    --grad: linear-gradient(90deg, var(--blue), var(--purple));
}

/* ---------- HERO ---------- */

.hero {
    text-align: center;
    padding-top: 140px;
    padding-bottom: 160px;
    background: radial-gradient(circle at center, #0a0a15 0%, #000 70%);
}

.hero-title {
    font-size: 140px;
    font-weight: 700;
    letter-spacing: 4px;
    color: transparent;
    -webkit-text-stroke: 3px;
    -webkit-text-stroke-color: var(--blue);
    background: var(--grad);
    background-clip: text;
    -webkit-background-clip: text;
    filter: drop-shadow(0 0 12px var(--blue));
    animation: glowShift 6s ease-in-out infinite;
}

@keyframes glowShift {
    0% { filter: drop-shadow(0 0 12px var(--blue)); }
    50% { filter: drop-shadow(0 0 16px var(--purple)); }
    100% { filter: drop-shadow(0 0 12px var(--blue)); }
}

.hero-tagline {
    margin-top: 20px;
    font-size: 22px;
    color: var(--blue);
    opacity: 0.9;
}

.hero-line {
    width: 180px;
    height: 3px;
    margin: 40px auto 0;
    background: var(--grad);
    box-shadow: 0 0 12px var(--blue);
    animation: lineDrift 5s linear infinite;
}

@keyframes lineDrift {
    0% { filter: drop-shadow(0 0 8px var(--blue)); }
    50% { filter: drop-shadow(0 0 12px var(--purple)); }
    100% { filter: drop-shadow(0 0 8px var(--blue)); }
}

/* ---------- DIVIDER ---------- */

.divider {
    width: 100%;
    height: 2px;
    background: var(--grad);
    box-shadow: 0 0 10px var(--blue);
    animation: lineDrift 5s linear infinite;
    margin: 0 auto;
}

/* ---------- ABOUT ---------- */

.about {
    text-align: center;
    max-width: 800px;
    margin: auto;
    line-height: 1.7;
    font-size: 20px;
}

/* ---------- SHOWCASE GRID ---------- */

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 40px;
    margin-top: 80px;
}

.card {
    background: #0a0a12;
    border: 2px solid transparent;
    border-image: var(--grad) 1;
    padding: 40px 30px;
    text-align: center;
    transition: 0.35s;
    box-shadow: 0 0 12px rgba(58,123,255,0.15);
}

.card:hover {
    transform: translateY(-6px);
    box-shadow: 0 0 22px rgba(162,89,255,0.45);
    animation: pulse 0.7s ease-out;
}

@keyframes pulse {
    0% { box-shadow: 0 0 12px rgba(58,123,255,0.2); }
    50% { box-shadow: 0 0 26px rgba(162,89,255,0.6); }
    100% { box-shadow: 0 0 12px rgba(58,123,255,0.2); }
}

.card-title {
    font-size: 26px;
    margin-bottom: 12px;
    background: var(--grad);
    -webkit-background-clip: text;
    color: transparent;
}

.card-desc {
    font-size: 16px;
    opacity: 0.8;
}

/* ---------- FOOTER ---------- */

footer {
    text-align: center;
    padding: 80px 0;
}

.footer-title {
    font-size: 60px;
    font-weight: 700;
    color: transparent;
    -webkit-text-stroke: 2px;
    -webkit-text-stroke-color: var(--blue);
    background: var(--grad);
    background-clip: text;
    -webkit-background-clip: text;
    filter: drop-shadow(0 0 8px var(--blue));
    animation: glowShift 6s ease-in-out infinite;
}

</style>
</head>
<body>

<!-- HERO -->
<section class="hero">
    <div class="hero-title">JDZ</div>
    <div class="hero-tagline">A space for what’s next.</div>
    <div class="hero-line"></div>
</section>

<div class="divider"></div>

<!-- ABOUT -->
<section>
    <div class="about">
        JDZ is built for ideas that move fast. A place where technology and creativity meet, shift, and evolve.<br><br>
        It’s a space shaped by signals, patterns, and the quiet momentum of what comes next.
    </div>
</section>

<div class="divider"></div>

<!-- SHOWCASE -->
<section>
    <div class="grid">

        <div class="card">
            <div class="card-title">Signal</div>
            <div class="card-desc">Early concepts and emerging ideas.</div>
        </div>

        <div class="card">
            <div class="card-title">Pulse</div>
            <div class="card-desc">Experiments in motion.</div>
        </div>

        <div class="card">
            <div class="card-title">Frame</div>
            <div class="card-desc">Visuals, sketches, and prototypes.</div>
        </div>

        <div class="card">
            <div class="card-title">Core</div>
            <div class="card-desc">Tools, systems, and foundations.</div>
        </div>

        <div class="card">
            <div class="card-title">Shift</div>
            <div class="card-desc">Explorations that push boundaries.</div>
        </div>

        <div class="card">
            <div class="card-title">Trace</div>
            <div class="card-desc">Notes, fragments, and patterns.</div>
        </div>

    </div>
</section>

<div class="divider"></div>

<!-- FOOTER -->
<footer>
    <div class="footer-title">JDZ</div>
</footer>

</body>
</html>
