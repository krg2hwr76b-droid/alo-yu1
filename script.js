// ---------- STATE ----------
let score = localStorage.getItem('tapboss_score') ? parseInt(localStorage.getItem('tapboss_score')) : 0;
let combo = 0;
let comboTimer = null;

const scoreVal = document.getElementById('scoreVal');
const comboPill = document.getElementById('comboPill');
const perTapPill = document.getElementById('perTapPill');
const bodyParts = document.querySelectorAll('.body-part');

// Load score on page load
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
const actx = new AudioCtx();

function playTone(freq, duration, type='sine', vol=0.2){
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + duration);
}

// ---------- ИНСТРУМЕНТЫ ДЛЯ КАЖДОЙ ЧАСТИ ТЕЛА ----------

// 🎹 ГОЛОВА - ПИАНИНО
const pianoNotes = [262, 294, 330, 349, 392, 440, 494, 523]; // до, ре, ми, фа, соль, ля, си, до
let pianoIndex = 0;
function playPiano(){
  if(actx.state === 'suspended') actx.resume();
  playTone(pianoNotes[pianoIndex % pianoNotes.length], 0.4, 'sine', 0.25);
  pianoIndex++;
}

// 🎸 ЛЕВАЯ РУКА - ГИТАРА
const guitarNotes = [196, 220, 247, 262, 294]; // более низкие ноты
let guitarIndex = 0;
function playGuitar(){
  if(actx.state === 'suspended') actx.resume();
  playTone(guitarNotes[guitarIndex % guitarNotes.length], 0.5, 'triangle', 0.22);
  guitarIndex++;
}

// 🪈 ПРАВАЯ РУКА - ФЛЕЙТА
const fluteNotes = [587, 659, 698, 784, 880]; // высокие ноты
let fluteIndex = 0;
function playFlute(){
  if(actx.state === 'suspended') actx.resume();
  playTone(fluteNotes[fluteIndex % fluteNotes.length], 0.35, 'sine', 0.2);
  fluteIndex++;
}

// 🥁 ЛЕВАЯ НОГА - БАСС
function playBass(){
  if(actx.state === 'suspended') actx.resume();
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, actx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, actx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.4, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + 0.3);
}

// 🎶 ПРАВАЯ НОГА - БАРАБАНЫ (бит)
function playDrums(){
  if(actx.state === 'suspended') actx.resume();
  // kick-ish thump
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, actx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.35, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + 0.2);
}

// ---------- ОБРАБОТКА КЛИКОВ НА ЧАСТИ ТЕЛА ----------
bodyParts.forEach(part => {
  part.addEventListener('click', (e) => {
    e.stopPropagation();
    
    const partType = part.dataset.part;
    
    // Анимация
    part.classList.remove('tap-anim');
    void part.offsetWidth;
    part.classList.add('tap-anim');
    setTimeout(() => part.classList.remove('tap-anim'), 200);
    
    // Звуки
    if(partType === 'head'){
      playPiano();
    } else if(partType === 'left-arm'){
      playGuitar();
    } else if(partType === 'right-arm'){
      playFlute();
    } else if(partType === 'left-leg'){
      playBass();
    } else if(partType === 'right-leg'){
      playDrums();
    }
    
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