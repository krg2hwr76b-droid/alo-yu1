const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

function triggerHaptic(style = 'medium') {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
}

let score = parseInt(localStorage.getItem('tap_boss_score')) || 0;
let combo = 0;
let comboTimer = null;

const scoreVal = document.getElementById('scoreVal');
const comboPill = document.getElementById('comboPill');

scoreVal.textContent = score.toLocaleString('ru-RU');

function addScore(amount){
  score += amount;
  scoreVal.textContent = score.toLocaleString('ru-RU');
  localStorage.setItem('tap_boss_score', score);

  combo++;
  comboPill.textContent = 'Комбо: ' + combo;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(()=>{ combo = 0; comboPill.textContent = 'Комбо: 0'; }, 1500);
}

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;

function initAudio() {
  if (!actx) actx = new AudioCtx();
  if (actx.state === 'suspended') actx.resume();
}

function playTone(freq, duration, type='sine', vol=0.2){
  initAudio();
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
  playTone(melodyNotes[melodyIndex % melodyNotes.length], 0.35, 'triangle', 0.18);
  melodyIndex++;
}

function playDrum(){
  initAudio();
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

const armLeft = document.getElementById('armLeft');
const armRight = document.getElementById('armRight');
const legs = document.getElementById('legs');
const bigTap = document.getElementById('bigTap');

function bump(el, className, duration){
  el.classList.remove(className);
  void el.offsetWidth; 
  el.classList.add(className);
  setTimeout(()=> el.classList.remove(className), duration);
}

function checkTouchElement(touch, element) {
  const rect = element.getBoundingClientRect();
  return (
    touch.clientX >= rect.left &&
    touch.clientX <= rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY <= rect.bottom
  );
}

let legsDanceTimeout = null;

window.addEventListener('touchstart', (e) => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    let triggered = false;

    if (checkTouchElement(touch, armLeft)) {
      bump(armLeft, 'hit', 350);
      playMelodyNote();
      triggered = true;
    } else if (checkTouchElement(touch, armRight)) {
      bump(armRight, 'hit', 350);
      playDrum();
      triggered = true;
    } else if (checkTouchElement(touch, legs)) {
      legs.classList.add('dancing');
      playDrum();
      clearTimeout(legsDanceTimeout);
      legsDanceTimeout = setTimeout(()=> legs.classList.remove('dancing'), 1200);
      triggered = true;
    } else if (checkTouchElement(touch, bigTap)) {
      const r = Math.random();
      if(r < 0.34){ bump(armLeft,'hit',350); playMelodyNote(); }
      else if(r < 0.67){ bump(armRight,'hit',350); playDrum(); }
      else { 
        legs.classList.add('dancing'); 
        playDrum(); 
        setTimeout(()=>legs.classList.remove('dancing'),1200); 
      }
      triggered = true;
    }

    if (triggered) {
      addScore(1);
      triggerHaptic('medium');
    }
  }
}, { passive: true });

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
