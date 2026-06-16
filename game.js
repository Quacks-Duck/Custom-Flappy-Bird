const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const homeScoreEl = document.querySelector("#homeScore");
const homeEyebrowEl = document.querySelector("#homeEyebrow");
const homeTitleEl = document.querySelector("#homeTitle");
const homeScreen = document.querySelector("#homeScreen");
const settingsPanel = document.querySelector("#settingsPanel");
const settingsEyebrowEl = document.querySelector("#settingsEyebrow");
const settingsTitleEl = document.querySelector("#settingsTitle");
const message = document.querySelector("#message");
const startBtn = document.querySelector("#startBtn");
const messageHomeBtn = document.querySelector("#messageHomeBtn");
const playMenuBtn = document.querySelector("#playMenuBtn");
const settingsMenuBtn = document.querySelector("#settingsMenuBtn");
const homeBtn = document.querySelector("#homeBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const soundBtn = document.querySelector("#soundBtn");
const resetAssetsBtn = document.querySelector("#resetAssetsBtn");
const downloadSaveBtn = document.querySelector("#downloadSaveBtn");
const clearSaveBtn = document.querySelector("#clearSaveBtn");
const saveUpload = document.querySelector("#saveUpload");
const speedRange = document.querySelector("#speedRange");
const speedValue = document.querySelector("#speedValue");
const jumpRange = document.querySelector("#jumpRange");
const jumpValue = document.querySelector("#jumpValue");
const birdScaleRange = document.querySelector("#birdScaleRange");
const birdScaleValue = document.querySelector("#birdScaleValue");
const pipeScaleRange = document.querySelector("#pipeScaleRange");
const pipeScaleValue = document.querySelector("#pipeScaleValue");
const groundScaleRange = document.querySelector("#groundScaleRange");
const groundScaleValue = document.querySelector("#groundScaleValue");
const deathScaleRange = document.querySelector("#deathScaleRange");
const deathScaleValue = document.querySelector("#deathScaleValue");
const backgroundScaleRange = document.querySelector("#backgroundScaleRange");
const backgroundScaleValue = document.querySelector("#backgroundScaleValue");
const homeAfterDeathToggle = document.querySelector("#homeAfterDeathToggle");

const menuTextInputs = {
  homeEyebrow: document.querySelector("#homeEyebrowText"),
  homeTitle: document.querySelector("#homeTitleText"),
  playButton: document.querySelector("#playButtonText"),
  customizeButton: document.querySelector("#customizeButtonText"),
  gameOverTitle: document.querySelector("#gameOverTitleText"),
  gameOverMessage: document.querySelector("#gameOverMessageText"),
  restartButton: document.querySelector("#restartButtonText"),
  homeButton: document.querySelector("#homeButtonText"),
  settingsEyebrow: document.querySelector("#settingsEyebrowText"),
  settingsTitle: document.querySelector("#settingsTitleText")
};

const menuColorInputs = {
  menuText: document.querySelector("#menuTextColor"),
  button: document.querySelector("#buttonColor"),
  homeTop: document.querySelector("#homeTopColor"),
  homeBottom: document.querySelector("#homeBottomColor"),
  panel: document.querySelector("#panelColor"),
  overlay: document.querySelector("#overlayColor")
};

const iconUploads = {
  play: document.querySelector("#playIconUpload"),
  customize: document.querySelector("#customizeIconUpload"),
  restart: document.querySelector("#restartIconUpload"),
  home: document.querySelector("#homeIconUpload"),
  reset: document.querySelector("#resetIconUpload"),
  pause: document.querySelector("#pauseIconUpload"),
  sound: document.querySelector("#soundIconUpload")
};

const iconButtons = {
  play: [playMenuBtn],
  customize: [settingsMenuBtn],
  restart: [startBtn],
  home: [homeBtn, messageHomeBtn],
  reset: [resetAssetsBtn],
  pause: [pauseBtn],
  sound: [soundBtn]
};

const defaultHomeIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23171717' d='M3 10.8 12 3l9 7.8-1.4 1.6-1.1-1V21h-5v-6h-3v6h-5v-9.6l-1.1 1L3 10.8Z'/%3E%3C/svg%3E";

const uploads = {
  background: document.querySelector("#backgroundUpload"),
  ground: document.querySelector("#groundUpload"),
  pipe: document.querySelector("#pipeUpload"),
  bird: document.querySelector("#birdUpload"),
  death: document.querySelector("#deathUpload")
};

const soundUploads = {
  flap: document.querySelector("#flapSoundUpload"),
  score: document.querySelector("#scoreSoundUpload"),
  crash: document.querySelector("#crashSoundUpload"),
  music: document.querySelector("#musicUpload")
};

const world = {
  width: canvas.width,
  height: canvas.height,
  ground: 88,
  gravity: 0.34,
  lift: -8.6,
  speed: 1.9,
  pipeGap: 178,
  pipeWidth: 74,
  pipeEvery: 140,
  baseGround: 88,
  basePipeWidth: 74,
  baseBirdRadius: 20
};

const state = {
  running: false,
  paused: false,
  gameOver: false,
  frame: 0,
  score: 0,
  best: Number(localStorage.getItem("flappy-remix-best") || 0),
  pipes: [],
  bird: { x: 96, y: 250, radius: 20, velocity: 0, angle: 0 },
  deathEffect: 0,
  returnHomeAfterDeath: false,
  menuText: {},
  scales: { background: 1, ground: 1, pipe: 1, bird: 1, death: 1 },
  images: { background: null, ground: null, pipe: null, bird: null, death: null },
  imageUrls: { background: null, ground: null, pipe: null, bird: null, death: null },
  assetData: { background: null, ground: null, pipe: null, bird: null, death: null },
  iconData: { play: null, customize: null, restart: null, home: null, reset: null, pause: null, sound: null },
  iconUrls: { play: null, customize: null, restart: null, home: null, reset: null, pause: null, sound: null },
  audio: {
    context: null,
    muted: false,
    custom: { flap: null, score: null, crash: null, music: null },
    urls: { flap: null, score: null, crash: null, music: null },
    data: { flap: null, score: null, crash: null, music: null }
  }
};

bestEl.textContent = state.best;
homeScoreEl.textContent = `Best ${state.best}`;

function resetGame() {
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.frame = 0;
  state.score = 0;
  state.pipes = [];
  state.deathEffect = 0;
  state.bird.y = 250;
  state.bird.velocity = world.lift;
  state.bird.angle = 0;
  scoreEl.textContent = "0";
  pauseBtn.textContent = "Pause";
  pauseBtn.dataset.icon = "Ⅱ";
  homeScreen.hidden = true;
  settingsPanel.hidden = true;
  message.hidden = true;
  addPipe();
  playSound("flap");
  playMusic();
}

function addPipe() {
  const minTop = 78;
  const maxTop = world.height - world.ground - world.pipeGap - 90;
  const safeMaxTop = Math.max(minTop + 1, maxTop);
  const top = Math.floor(minTop + Math.random() * (safeMaxTop - minTop));
  state.pipes.push({ x: world.width + 20, top, passed: false });
}

function flap() {
  if (!state.running || state.gameOver) {
    resetGame();
    return;
  }

  if (!state.paused) {
    state.bird.velocity = world.lift;
    playSound("flap");
  }
}

function endGame() {
  if (state.gameOver) return;
  state.running = false;
  state.gameOver = true;
  state.deathEffect = 90;
  playSound("crash");
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem("flappy-remix-best", String(state.best));
    bestEl.textContent = state.best;
  }
  homeScoreEl.textContent = `Score ${state.score} | Best ${state.best}`;
  message.querySelector("h1").textContent = state.menuText.gameOverTitle;
  message.querySelector("p").textContent = state.menuText.gameOverMessage;
  startBtn.textContent = state.menuText.restartButton;
  startBtn.dataset.icon = "↻";
  pauseMusic();
  if (state.returnHomeAfterDeath) {
    message.hidden = true;
    window.setTimeout(() => {
      if (state.gameOver && state.returnHomeAfterDeath) {
        showHome();
      }
    }, 850);
  } else {
    message.hidden = false;
  }
}

function update() {
  if (!state.running || state.paused) return;

  state.frame += 1;
  state.bird.velocity += world.gravity;
  state.bird.y += state.bird.velocity;
  state.bird.angle = Math.max(-0.55, Math.min(1.05, state.bird.velocity / 10));

  if (state.frame % world.pipeEvery === 0) addPipe();

  for (const pipe of state.pipes) {
    pipe.x -= world.speed;
    if (!pipe.passed && pipe.x + world.pipeWidth < state.bird.x) {
      pipe.passed = true;
      state.score += 1;
      scoreEl.textContent = state.score;
      playSound("score");
    }
  }

  state.pipes = state.pipes.filter(pipe => pipe.x + world.pipeWidth > -20);

  const floorY = world.height - world.ground;
  if (state.bird.y + state.bird.radius > floorY || state.bird.y - state.bird.radius < 0) {
    endGame();
    return;
  }

  for (const pipe of state.pipes) {
    const inPipeX = state.bird.x + state.bird.radius > pipe.x && state.bird.x - state.bird.radius < pipe.x + world.pipeWidth;
    const inGap = state.bird.y - state.bird.radius > pipe.top && state.bird.y + state.bird.radius < pipe.top + world.pipeGap;
    if (inPipeX && !inGap) {
      endGame();
      return;
    }
  }
}

function drawBackground() {
  const img = state.images.background;
  if (img) {
    drawCover(img, 0, 0, world.width, world.height, state.scales.background);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, world.height);
  sky.addColorStop(0, "#63d3ff");
  sky.addColorStop(0.58, "#b9efff");
  sky.addColorStop(1, "#80d891");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  drawCloud(80, 100, 34);
  drawCloud(310, 170, 42);
  drawCloud(220, 62, 26);
}

function drawCloud(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
  ctx.arc(x + size * 0.42, y - size * 0.16, size * 0.7, 0, Math.PI * 2);
  ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  const y = world.height - world.ground;
  const img = state.images.ground;
  if (img) {
    drawScrollingImage(img, 0, y, world.width, world.ground, state.frame * world.speed);
    ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
    ctx.fillRect(0, y, world.width, 4);
    return;
  }

  ctx.fillStyle = "#d6a04c";
  ctx.fillRect(0, y, world.width, world.ground);
  ctx.fillStyle = "#6cc45d";
  ctx.fillRect(0, y, world.width, 18);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let x = -40 + ((state.frame * world.speed) % 40); x < world.width; x += 40) {
    ctx.fillRect(x, y + 16, 22, 6);
  }
}

function getAudioContext() {
  if (state.audio.muted) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audio.context) {
    state.audio.context = new AudioContext();
  }
  if (state.audio.context.state === "suspended") {
    state.audio.context.resume();
  }
  return state.audio.context;
}

function playTone({ frequency, duration, type = "sine", volume = 0.08, endFrequency = frequency, delay = 0 }) {
  const audio = getAudioContext();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playSound(name) {
  const customSound = state.audio.custom[name];
  if (!state.audio.muted && customSound) {
    const sound = customSound.cloneNode();
    sound.volume = 0.75;
    sound.play().catch(() => {});
    return;
  }

  if (name === "flap") {
    playTone({ frequency: 420, endFrequency: 760, duration: 0.09, type: "triangle", volume: 0.075 });
  }
  if (name === "score") {
    playTone({ frequency: 660, endFrequency: 880, duration: 0.08, type: "sine", volume: 0.07 });
    playTone({ frequency: 880, endFrequency: 1180, duration: 0.1, type: "sine", volume: 0.06, delay: 0.075 });
  }
  if (name === "crash") {
    playTone({ frequency: 190, endFrequency: 72, duration: 0.22, type: "sawtooth", volume: 0.08 });
  }
}

function playMusic() {
  const music = state.audio.custom.music;
  if (state.audio.muted || !music) return;
  music.loop = true;
  music.volume = 0.35;
  music.play().catch(() => {});
}

function pauseMusic() {
  const music = state.audio.custom.music;
  if (music) music.pause();
}

function drawPipes() {
  for (const pipe of state.pipes) {
    drawPipe(pipe.x, 0, world.pipeWidth, pipe.top, true);
    drawPipe(pipe.x, pipe.top + world.pipeGap, world.pipeWidth, world.height - world.ground - pipe.top - world.pipeGap, false);
  }
}

function drawPipe(x, y, width, height, flipped) {
  const img = state.images.pipe;
  if (img) {
    ctx.save();
    if (flipped) {
      ctx.translate(x, y + height);
      ctx.scale(1, -1);
      drawCover(img, 0, 0, width, height);
    } else {
      drawCover(img, x, y, width, height);
    }
    ctx.restore();
    return;
  }

  const pipeGradient = ctx.createLinearGradient(x, 0, x + width, 0);
  pipeGradient.addColorStop(0, "#247a38");
  pipeGradient.addColorStop(0.45, "#72df64");
  pipeGradient.addColorStop(1, "#176328");
  ctx.fillStyle = pipeGradient;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#134d24";
  ctx.fillRect(x - 5, flipped ? y + height - 24 : y, width + 10, 24);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
}

function drawBird() {
  const { x, y, radius, angle } = state.bird;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const img = state.images.bird;
  if (img) {
    drawContain(img, -radius * 1.35, -radius * 1.15, radius * 2.7, radius * 2.3);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.18, radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f77f00";
  ctx.beginPath();
  ctx.moveTo(radius * 0.92, -4);
  ctx.lineTo(radius * 1.62, 2);
  ctx.lineTo(radius * 0.92, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(radius * 0.42, -radius * 0.32, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(radius * 0.55, -radius * 0.32, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.4, 3, radius * 0.45, radius * 0.25, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDeathEffect() {
  if (state.deathEffect <= 0 || !state.images.death) return;

  const alpha = Math.min(1, state.deathEffect / 12);
  const size = (132 + (90 - state.deathEffect) * 1.4) * state.scales.death;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawContain(state.images.death, state.bird.x - size / 2, state.bird.y - size / 2, size, size);
  ctx.restore();
  state.deathEffect -= 1;
}

function drawCover(img, x, y, width, height, zoom = 1) {
  const scale = Math.max(width / img.width, height / img.height) * zoom;
  const drawnWidth = img.width * scale;
  const drawnHeight = img.height * scale;
  ctx.drawImage(img, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight);
}

function drawContain(img, x, y, width, height) {
  const scale = Math.min(width / img.width, height / img.height);
  const drawnWidth = img.width * scale;
  const drawnHeight = img.height * scale;
  ctx.drawImage(img, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight);
}

function drawScrollingImage(img, x, y, width, height, offset) {
  const scale = height / img.height;
  const tileWidth = Math.max(1, img.width * scale);
  const startX = x - (offset % tileWidth);
  for (let tileX = startX - tileWidth; tileX < x + width + tileWidth; tileX += tileWidth) {
    ctx.drawImage(img, tileX, y, tileWidth, height);
  }
}

function draw() {
  ctx.clearRect(0, 0, world.width, world.height);
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
  drawDeathEffect();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      type: file.type,
      dataUrl: reader.result
    });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImageFromData(asset, key) {
  if (!asset || !asset.dataUrl) return;
  if (state.imageUrls[key]) {
    URL.revokeObjectURL(state.imageUrls[key]);
  }
  const image = new Image();
  image.onload = () => {
    state.images[key] = image;
    draw();
  };
  state.assetData[key] = asset;
  state.imageUrls[key] = asset.dataUrl;
  image.src = asset.dataUrl;
}

async function loadImageFromFile(file, key) {
  if (!file) return;
  loadImageFromData(await fileToDataUrl(file), key);
}

function loadSoundFromData(asset, key) {
  if (!asset || !asset.dataUrl) return;
  const audio = new Audio(asset.dataUrl);
  audio.preload = "auto";
  if (key === "music") {
    audio.loop = true;
    audio.volume = 0.35;
  }
  state.audio.custom[key] = audio;
  state.audio.urls[key] = asset.dataUrl;
  state.audio.data[key] = asset;
  if (key === "music" && state.running && !state.gameOver) {
    playMusic();
  }
}

async function loadSoundFromFile(file, key) {
  if (!file) return;
  loadSoundFromData(await fileToDataUrl(file), key);
}

function applyIconData(key, asset) {
  state.iconData[key] = asset;
  state.iconUrls[key] = asset ? asset.dataUrl : null;
  for (const button of iconButtons[key]) {
    if (asset && asset.dataUrl) {
      button.classList.add("has-custom-icon");
      button.style.setProperty("--icon-image", `url("${asset.dataUrl}")`);
    } else {
      button.classList.remove("has-custom-icon");
      button.style.removeProperty("--icon-image");
    }
  }
}

async function loadIconFromFile(file, key) {
  if (!file) return;
  applyIconData(key, await fileToDataUrl(file));
}

function updateSpeed(value) {
  world.speed = Number(value);
  speedValue.textContent = world.speed.toFixed(1);
}

function updateJump(value) {
  world.lift = -Number(value);
  jumpValue.textContent = Math.abs(world.lift).toFixed(1);
}

function updateScale(name, value, output) {
  const scale = Number(value);
  state.scales[name] = scale;
  output.textContent = `${scale.toFixed(1)}x`;

  if (name === "bird") {
    state.bird.radius = world.baseBirdRadius * scale;
  }
  if (name === "pipe") {
    world.pipeWidth = world.basePipeWidth * scale;
  }
  if (name === "ground") {
    world.ground = world.baseGround * scale;
  }
  draw();
}

function readMenuText() {
  Object.entries(menuTextInputs).forEach(([key, input]) => {
    state.menuText[key] = input.value.trim() || input.defaultValue;
  });
}

function applyMenuText() {
  readMenuText();
  homeEyebrowEl.textContent = state.menuText.homeEyebrow;
  homeTitleEl.textContent = state.menuText.homeTitle;
  playMenuBtn.textContent = state.menuText.playButton;
  settingsMenuBtn.textContent = state.menuText.customizeButton;
  settingsEyebrowEl.textContent = state.menuText.settingsEyebrow;
  settingsTitleEl.textContent = state.menuText.settingsTitle;
  homeBtn.textContent = state.menuText.homeButton;
  messageHomeBtn.textContent = state.menuText.homeButton;
  startBtn.textContent = state.menuText.restartButton;

  if (state.gameOver) {
    message.querySelector("h1").textContent = state.menuText.gameOverTitle;
    message.querySelector("p").textContent = state.menuText.gameOverMessage;
  }
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function readableInk(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#171717" : "#f8fbff";
}

function applyMenuColors() {
  const root = document.documentElement;
  const overlay = hexToRgb(menuColorInputs.overlay.value);
  const panel = hexToRgb(menuColorInputs.panel.value);
  root.style.setProperty("--ink", menuColorInputs.menuText.value);
  root.style.setProperty("--accent", menuColorInputs.button.value);
  root.style.setProperty("--button-ink", readableInk(menuColorInputs.button.value));
  root.style.setProperty("--home-top", menuColorInputs.homeTop.value);
  root.style.setProperty("--home-bottom", menuColorInputs.homeBottom.value);
  root.style.setProperty("--panel", menuColorInputs.panel.value);
  root.style.setProperty("--panel-2", `rgb(${Math.min(panel.r + 14, 255)} ${Math.min(panel.g + 14, 255)} ${Math.min(panel.b + 14, 255)})`);
  root.style.setProperty("--overlay-panel", `rgba(${overlay.r}, ${overlay.g}, ${overlay.b}, 0.72)`);
}

function buildSaveData() {
  readMenuText();
  return {
    version: 1,
    menuText: state.menuText,
    colors: Object.fromEntries(Object.entries(menuColorInputs).map(([key, input]) => [key, input.value])),
    feel: {
      speed: speedRange.value,
      jump: jumpRange.value,
      birdScale: birdScaleRange.value,
      pipeScale: pipeScaleRange.value,
      groundScale: groundScaleRange.value,
      deathScale: deathScaleRange.value,
      backgroundScale: backgroundScaleRange.value,
      returnHomeAfterDeath: homeAfterDeathToggle.checked
    },
    assets: state.assetData,
    audio: state.audio.data,
    icons: state.iconData
  };
}

function downloadCustomSave() {
  const blob = new Blob([JSON.stringify(buildSaveData(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `flappy-remix-save-${stamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applySaveData(save) {
  if (!save || typeof save !== "object") return;

  Object.entries(save.menuText || {}).forEach(([key, value]) => {
    if (menuTextInputs[key]) menuTextInputs[key].value = value;
  });
  Object.entries(save.colors || {}).forEach(([key, value]) => {
    if (menuColorInputs[key]) menuColorInputs[key].value = value;
  });

  const feel = save.feel || {};
  if (feel.speed) speedRange.value = feel.speed;
  if (feel.jump) jumpRange.value = feel.jump;
  if (feel.birdScale) birdScaleRange.value = feel.birdScale;
  if (feel.pipeScale) pipeScaleRange.value = feel.pipeScale;
  if (feel.groundScale) groundScaleRange.value = feel.groundScale;
  if (feel.deathScale) deathScaleRange.value = feel.deathScale;
  if (feel.backgroundScale) backgroundScaleRange.value = feel.backgroundScale;
  homeAfterDeathToggle.checked = Boolean(feel.returnHomeAfterDeath);
  state.returnHomeAfterDeath = homeAfterDeathToggle.checked;

  Object.entries(save.assets || {}).forEach(([key, asset]) => {
    if (key in state.images) loadImageFromData(asset, key);
  });
  Object.entries(save.audio || {}).forEach(([key, asset]) => {
    if (key in state.audio.custom) loadSoundFromData(asset, key);
  });
  Object.entries(save.icons || {}).forEach(([key, asset]) => {
    if (key in iconButtons) applyIconData(key, asset);
  });

  updateSpeed(speedRange.value);
  updateJump(jumpRange.value);
  applyMenuText();
  applyMenuColors();
  updateScale("bird", birdScaleRange.value, birdScaleValue);
  updateScale("pipe", pipeScaleRange.value, pipeScaleValue);
  updateScale("ground", groundScaleRange.value, groundScaleValue);
  updateScale("death", deathScaleRange.value, deathScaleValue);
  updateScale("background", backgroundScaleRange.value, backgroundScaleValue);
}

async function loadSaveFromFile(file) {
  if (!file) return;
  const text = await file.text();
  applySaveData(JSON.parse(text));
}

function showHome() {
  state.running = false;
  state.paused = false;
  state.gameOver = false;
  pauseMusic();
  message.hidden = true;
  settingsPanel.hidden = true;
  homeScreen.hidden = false;
  homeScoreEl.textContent = `Best ${state.best}`;
  pauseBtn.textContent = "Pause";
  pauseBtn.dataset.icon = "Ⅱ";
  draw();
}

function showSettings() {
  state.running = false;
  state.paused = false;
  pauseMusic();
  message.hidden = true;
  homeScreen.hidden = true;
  settingsPanel.hidden = false;
  draw();
}

uploads.background.addEventListener("change", event => loadImageFromFile(event.target.files[0], "background"));
uploads.ground.addEventListener("change", event => loadImageFromFile(event.target.files[0], "ground"));
uploads.pipe.addEventListener("change", event => loadImageFromFile(event.target.files[0], "pipe"));
uploads.bird.addEventListener("change", event => loadImageFromFile(event.target.files[0], "bird"));
uploads.death.addEventListener("change", event => loadImageFromFile(event.target.files[0], "death"));

soundUploads.flap.addEventListener("change", event => loadSoundFromFile(event.target.files[0], "flap"));
soundUploads.score.addEventListener("change", event => loadSoundFromFile(event.target.files[0], "score"));
soundUploads.crash.addEventListener("change", event => loadSoundFromFile(event.target.files[0], "crash"));
soundUploads.music.addEventListener("change", event => loadSoundFromFile(event.target.files[0], "music"));

speedRange.addEventListener("input", event => updateSpeed(event.target.value));
jumpRange.addEventListener("input", event => updateJump(event.target.value));
birdScaleRange.addEventListener("input", event => updateScale("bird", event.target.value, birdScaleValue));
pipeScaleRange.addEventListener("input", event => updateScale("pipe", event.target.value, pipeScaleValue));
groundScaleRange.addEventListener("input", event => updateScale("ground", event.target.value, groundScaleValue));
deathScaleRange.addEventListener("input", event => updateScale("death", event.target.value, deathScaleValue));
backgroundScaleRange.addEventListener("input", event => updateScale("background", event.target.value, backgroundScaleValue));
homeAfterDeathToggle.addEventListener("change", event => {
  state.returnHomeAfterDeath = event.target.checked;
});

Object.values(menuTextInputs).forEach(input => {
  input.addEventListener("input", applyMenuText);
});

Object.values(menuColorInputs).forEach(input => {
  input.addEventListener("input", applyMenuColors);
});

resetAssetsBtn.addEventListener("click", () => {
  Object.keys(state.images).forEach(key => {
    state.images[key] = null;
    if (state.imageUrls[key]) URL.revokeObjectURL(state.imageUrls[key]);
    state.imageUrls[key] = null;
  });
  Object.keys(state.audio.custom).forEach(key => {
    state.audio.custom[key] = null;
    if (state.audio.urls[key]) URL.revokeObjectURL(state.audio.urls[key]);
    state.audio.urls[key] = null;
  });
  Object.values(uploads).forEach(input => {
    input.value = "";
  });
  Object.values(soundUploads).forEach(input => {
    input.value = "";
  });
  pauseMusic();
  draw();
});

pauseBtn.addEventListener("click", () => {
  if (!state.running || state.gameOver) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  pauseBtn.dataset.icon = state.paused ? "▶" : "Ⅱ";
});

soundBtn.addEventListener("click", () => {
  state.audio.muted = !state.audio.muted;
  soundBtn.textContent = state.audio.muted ? "Sound Off" : "Sound On";
  soundBtn.dataset.icon = state.audio.muted ? "×" : "♪";
  if (state.audio.muted) {
    pauseMusic();
  } else {
    playSound("score");
    if (state.running && !state.gameOver) playMusic();
  }
});

startBtn.addEventListener("click", resetGame);
messageHomeBtn.addEventListener("click", showHome);
playMenuBtn.addEventListener("click", resetGame);
settingsMenuBtn.addEventListener("click", showSettings);
homeBtn.addEventListener("click", showHome);
canvas.addEventListener("pointerdown", flap);

window.addEventListener("keydown", event => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    flap();
  }
});

updateSpeed(speedRange.value);
updateJump(jumpRange.value);
applyMenuText();
applyMenuColors();
updateScale("bird", birdScaleRange.value, birdScaleValue);
updateScale("pipe", pipeScaleRange.value, pipeScaleValue);
updateScale("ground", groundScaleRange.value, groundScaleValue);
updateScale("death", deathScaleRange.value, deathScaleValue);
updateScale("background", backgroundScaleRange.value, backgroundScaleValue);
draw();
loop();
