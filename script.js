// ---------- PERSISTENT DATA WITH LOCALSTORAGE ----------
let score = localStorage.getItem('tapboss_score') ? parseInt(localStorage.getItem('tapboss_score')) : 0;
let balance = localStorage.getItem('tapboss_balance') ? parseInt(localStorage.getItem('tapboss_balance')) : 0;
let combo = 0;
let comboTimer = null;

const scoreVal = document.getElementById('scoreVal');
const comboVal = document.getElementById('comboVal');
const balanceFill = document.getElementById('balanceFill');
const balancePercent = document.getElementById('balancePercent');

scoreVal.textContent = score.toLocaleString('ru-RU');
comboVal.textContent = combo;
updateBalance();

function addScore(amount){
  score += amount;
  balance = Math.min(100, balance + 5); // max 100%
  
  scoreVal.textContent = score.toLocaleString('ru-RU');
  localStorage.setItem('tapboss_score', score);
  localStorage.setItem('tapboss_balance', balance);
  
  updateBalance();
  
  combo++;
  comboVal.textContent = combo;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(()=>{ combo = 0; comboVal.textContent = '0'; }, 1500);
}

function updateBalance(){
  const percent = Math.min(100, Math.max(0, balance));
  balanceFill.style.width = percent + '%';
  balancePercent.textContent = Math.round(percent) + '%';
}

// ---------- AUDIO ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getAudio(){
  if(!actx && AudioCtx) actx = new AudioCtx();
  if(actx && actx.state === 'suspended') actx.resume();
  return actx;
}

function playNote(freq, duration=0.4, vol=0.3){
  const audio = getAudio();
  if(!audio) return;
  
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration);
}

// Яркие ноты мажорной гаммы
const notes = {
  sol: 392.00,    // голова - Соль
  mi: 329.63,     // тело - Ми
  re: 293.66,     // левая рука - Ре
  la: 440.00,     // правая рука - Ля
  do: 261.63,     // левая нога - До
  fa: 349.23      // правая нога - Фа
};

function playHead(){getAudio(); playNote(notes.sol, 0.35, 0.32)}
function playBody(){getAudio(); playNote(notes.mi, 0.4, 0.30)}
function playArmLeft(){getAudio(); playNote(notes.re, 0.38, 0.31)}
function playArmRight(){getAudio(); playNote(notes.la, 0.36, 0.29)}
function playLegLeft(){getAudio(); playNote(notes.do, 0.42, 0.33)}
function playLegRight(){getAudio(); playNote(notes.fa, 0.40, 0.30)}

// ---------- INTERACTIONS ----------
const parts = {
  head: {el: document.getElementById('head'), sound: playHead},
  body: {el: document.getElementById('body'), sound: playBody},
  armLeft: {el: document.getElementById('armLeft'), sound: playArmLeft},
  armRight: {el: document.getElementById('armRight'), sound: playArmRight},
  legLeft: {el: document.getElementById('legLeft'), sound: playLegLeft},
  legRight: {el: document.getElementById('legRight'), sound: playLegRight}
};

function bump(el){
  el.classList.remove('hit');
  void el.offsetWidth;
  el.classList.add('hit');
  setTimeout(()=> el.classList.remove('hit'), 300);
}

Object.values(parts).forEach(part => {
  part.el.addEventListener('click', (e) => {
    e.stopPropagation();
    bump(part.el);
    part.sound();
    addScore(1);
  });
});

// ---------- PERSISTENT TIMER (45 DAYS / 1.5 MONTHS) ----------
function initializeTimer(){
  let listingDate = localStorage.getItem('tapboss_listing_date');
  
  if(!listingDate){
    // Первый запуск - устанавливаем дату на полтора месяца вперед
    const now = new Date();
    const futureDate = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
    listingDate = futureDate.getTime();
    localStorage.setItem('tapboss_listing_date', listingDate);
  }
  
  return parseInt(listingDate);
}

const listingTimestamp = initializeTimer();
const timerVal = document.getElementById('timerVal');

function updateTimer(){
  const now = new Date().getTime();
  let diff = listingTimestamp - now;
  
  if(diff <= 0){
    timerVal.textContent = '00:00:00';
    return;
  }
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  
  timerVal.textContent =
    String(days).padStart(2,'0') + ':' +
    String(hours).padStart(2,'0') + ':' +
    String(mins).padStart(2,'0');
}

updateTimer();
setInterval(updateTimer, 1000);

// ---------- AVATAR UPLOAD ----------
document.getElementById('avatarSlot').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (event) => {
        const slot = document.getElementById('avatarSlot');
        slot.innerHTML = `<img src="${event.target.result}" alt="avatar">`;
        localStorage.setItem('tapboss_avatar', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
});

// Загрузить аватарку при старте, если она была сохранена
window.addEventListener('load', () => {
  const savedAvatar = localStorage.getItem('tapboss_avatar');
  if(savedAvatar){
    const slot = document.getElementById('avatarSlot');
    slot.innerHTML = `<img src="${savedAvatar}" alt="avatar">`;
  }
});