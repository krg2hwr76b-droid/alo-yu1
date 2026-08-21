// ---------- STATE ----------
let score = localStorage.getItem('tapboss_score') ? parseInt(localStorage.getItem('tapboss_score')) : 0;
let combo = 0;
let comboTimer = null;

const scoreVal = document.getElementById('scoreVal');
const comboPill = document.getElementById('comboPill');
const perTapPill = document.getElementById('perTapPill');
const character = document.getElementById('character');

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

// ---------- AUDIO (Web Audio API, no external files) ----------
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

const melodyNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
let melodyIndex = 0;
function playMelodyNote(){
  if(actx.state === 'suspended') actx.resume();
  playTone(melodyNotes[melodyIndex % melodyNotes.length], 0.35, 'triangle', 0.18);
  melodyIndex++;
}

function playDrum(){
  if(actx.state === 'suspended') actx.resume();
  // kick-ish thump using noise + low osc
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

// ---------- INTERACTIONS ----------
character.addEventListener('click', ()=>{
  // Random sound: melody or drum
  const r = Math.random();
  if(r < 0.5) playMelodyNote();
  else playDrum();
  
  // Animation
  character.classList.remove('tap');
  void character.offsetWidth;
  character.classList.add('tap');
  setTimeout(()=> character.classList.remove('tap'), 200);
  
  addScore(1);
});

// ---------- COUNTDOWN TO LISTING ----------
// Change this date/time to your real listing date
const listingDate = new Date();
listingDate.setDate(listingDate.getDate() + 3); // demo: 3 days from now

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
