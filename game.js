let score = 0;
const scoreEl = document.getElementById('score');
const boss = document.getElementById('boss');

boss.addEventListener('click', function() {
    score = score + 1;
    scoreEl.textContent = score;
});
