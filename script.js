// ---------- STATE WITH LOCALSTORAGE ----------
let score = localStorage.getItem('tapboss_score') ? parseInt(localStorage.getItem('tapboss_score')) : 0;
let combo = 0;
let comboTimer = null;

const scoreVal = document.getElementById('scoreVal');
const comboPill = document.getElementById('comboPill');

scoreVal.textContent = score.toLocaleString('ru-RU');

function addScore(amount){
  score += amount;
  scoreVal.textContent = score.toLocaleString('ru-RU');
  localStorage.setItem('tapboss_score', score);
  combo++;
  comboPill.textContent = 'Комбо: ' + combo;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(()=>{ combo = 0; comboPill.textContent = 'Комбо: 0'; }, 1500);
}

// ---------- AUDIO (Web Audio API) ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getAudio(){
  if(!actx && AudioCtx) actx = new AudioCtx();
  if(actx && actx.state === 'suspended') actx.resume();
  return actx;
}

function playNote(freq, duration=0.4, vol=0.25){
  const audio = getAudio();
  if(!audio) return;
  
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  // Яркий envelope - быстрый атака, медленный декей
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.05); // быстрый атак
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration); // плавный декей
  
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// Мажорная гамма До - яркие звуки, легко комбинировать в мелодии
// До (C4) = 261.63, Ре (D4) = 293.66, Ми (E4) = 329.63, Фа (F4) = 349.23, Соль (G4) = 392.00, Ля (A4) = 440.00, Си (B4) = 493.88
const notes = {
  do: 261.63,     // голова (самая низкая)
  re: 293.66,     // левая рука
  mi: 329.63,     // правая рука
  fa: 349.23,     // левая нога
  sol: 392.00,    // правая нога
  la: 440.00,     // бонус
  si: 493.88      // бонус
};

function playHead(){
  getAudio();
  playNote(notes.sol, 0.35, 0.28); // Соль - яркий и высокий для головы
}

function playBody(){
  getAudio();
  playNote(notes.mi, 0.4, 0.26); // Ми - средний-высокий для тела
}

function playArmLeft(){
  getAudio();
  playNote(notes.re, 0.38, 0.27); // Ре - средний для левой руки
}

function playArmRight(){
  getAudio();
  playNote(notes.la, 0.36, 0.25); // Ля - высокий для правой руки
}

function playLegs(){
  getAudio();
  playNote(notes.do, 0.42, 0.29); // До - низкий для ног
}

// ---------- INTERACTIONS ----------
const parts = {
  head: {el: document.getElementById('head'), sound: playHead},
  body: {el: document.getElementById('body'), sound: playBody},
  armLeft: {el: document.getElementById('armLeft'), sound: playArmLeft},
  armRight: {el: document.getElementById('armRight'), sound: playArmRight},
  legs: {el: document.getElementById('legs'), sound: playLegs}
};

function bump(el){
  el.classList.remove('hit');
  void el.offsetWidth;
  el.classList.add('hit');
  setTimeout(()=> el.classList.remove('hit'), 250);
}

Object.values(parts).forEach(part => {
  part.el.addEventListener('click', (e) => {
    e.stopPropagation();
    bump(part.el);
    part.sound();
    addScore(1);
  });
});

// ---------- COUNTDOWN TO LISTING ----------
const listingDate = new Date();
listingDate.setDate(listingDate.getDate() + 3);

const timerVal = document.getElementById('timerVal');
function updateTimer(){
  const now = new Date();
  let diff = listingDate - now;
  if(diff <= 0){
    timerVal.textContent = 'ЛИСТИНГ!';
    return;
  }
  const h = Math.floor(diff / 3600000);
  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);
  diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  timerVal.textContent =
    String(h).padStart(2,'0') + ':' +
    String(m).padStart(2,'0') + ':' +
    String(s).padStart(2,'0');
}
updateTimer();
setInterval(updateTimer, 1000);
