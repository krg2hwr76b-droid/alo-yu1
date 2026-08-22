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

function playTone(freq, duration, type='sine', vol=0.2){
  const audio = getAudio();
  if(!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

const melodyNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
let melodyIndex = 0;
function resumeAudio(){ getAudio(); }
function playMelodyNote(){
  resumeAudio();
  playTone(melodyNotes[melodyIndex++ % melodyNotes.length], .35, 'triangle', .16);
}
function playBass(){
  resumeAudio();
  playTone(130, .28, 'sine', .22);
}
function playBell(){
  resumeAudio();
  playTone(880, .45, 'sine', .12);
}
function playHat(){
  resumeAudio();
  const audio=getAudio(); if(!audio) return;
  const buffer=audio.createBuffer(1, audio.sampleRate*.08, audio.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(.7-i/data.length);
  const source=audio.createBufferSource(), gain=audio.createGain();
  source.buffer=buffer; gain.gain.value=.12; source.connect(gain); gain.connect(audio.destination); source.start();
}

function playDrum(){
  const audio=getAudio(); if(!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audio.currentTime + 0.15);
  gain.gain.setValueAtTime(0.35, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.2);
}

// ---------- INTERACTIONS ----------
const armLeft = document.getElementById('armLeft');
const armRight = document.getElementById('armRight');
const legLeft = document.getElementById('legLeft');
const legRight = document.getElementById('legRight');
const head = document.getElementById('head');
const body = document.getElementById('body');
const bigTap = document.getElementById('bigTap');
const character = document.querySelector('.character');
const balancePill = document.getElementById('balancePill');

function bump(el, className, duration){
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  setTimeout(()=> el.classList.remove(className), duration);
}

function tapPart(part, sound){
  part.addEventListener('click', (event)=>{
    event.stopPropagation();
    bump(part,'hit',450); sound(); addScore(1);
  });
}
tapPart(armLeft, playMelodyNote);
tapPart(armRight, playDrum);
tapPart(legLeft, playBass);
tapPart(legRight, playHat);
tapPart(head, playBell);
tapPart(body, playDrum);

bigTap.addEventListener('click', ()=>{
  resumeAudio();
  addScore(1);
  bump(body,'hit',350); playDrum();
});

let balanceTimer;
character.addEventListener('dblclick', ()=>{
  character.classList.add('is-balanced');
  clearTimeout(balanceTimer);
  balanceTimer=setTimeout(()=>character.classList.remove('is-balanced'),1000);
});
balancePill.addEventListener('click', ()=>{
  character.classList.toggle('is-balanced');
  playBell();
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
