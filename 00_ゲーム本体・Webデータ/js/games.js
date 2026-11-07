// 幼児向けミニゲームロジック
document.addEventListener('DOMContentLoaded', () => {
    initBalloonGame();
    initAnimalConcert();
    initMemoryGame();
    initStarCatchGame();
    initCapsuleToy();
    initAgeFilter();
    initSoundToggle();
});

// 1. ぽんぽん！ふうせんわり
function initBalloonGame() {
    const area = document.getElementById('balloon-area');
    const scoreElem = document.getElementById('balloon-score');
    if (!area) return;

    let score = 0;
    const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#FF9F1C'];
    const emojis = ['🎈', '✨', '⭐', '🎈', '🎈'];

    function createBalloon() {
        if (!area || area.children.length >= 8) return;
        const b = document.createElement('div');
        b.className = 'balloon-item';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = 5 + Math.random() * 85;
        const dur = 4 + Math.random() * 3;
        const size = 50 + Math.random() * 25;

        b.style.left = `${left}%`;
        b.style.animationDuration = `${dur}s`;
        b.style.width = `${size}px`;
        b.style.height = `${size * 1.25}px`;
        b.style.backgroundColor = color;

        // タップ・クリック時
        b.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (window.kidsSound) window.kidsSound.playPop();
            createStars(e.clientX, e.clientY);
            score++;
            if (scoreElem) scoreElem.textContent = score;
            b.classList.add('popped');
            setTimeout(() => b.remove(), 200);
        });

        area.appendChild(b);

        // 画面上部に到達したら削除
        b.addEventListener('animationend', () => {
            b.remove();
        });
    }

    // 定期的に風船生成
    setInterval(createBalloon, 1200);
    // 初回に3個生成
    for (let i = 0; i < 3; i++) setTimeout(createBalloon, i * 400);

    const resetBtn = document.getElementById('balloon-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            score = 0;
            if (scoreElem) scoreElem.textContent = score;
            if (window.kidsSound) window.kidsSound.playTap();
        });
    }
}

// 星の飛び散るパーティクル
function createStars(x, y) {
    for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.className = 'pop-star';
        star.textContent = ['⭐', '✨', '🎉', '💖'][Math.floor(Math.random() * 4)];
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        const vx = (Math.random() - 0.5) * 120;
        const vy = (Math.random() - 0.7) * 120;
        star.style.setProperty('--vx', `${vx}px`);
        star.style.setProperty('--vy', `${vy}px`);
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 600);
    }
}

// 2. どうぶつ なきごえコンサート
function initAnimalConcert() {
    const cards = document.querySelectorAll('.animal-card');
    cards.forEach(card => {
        card.addEventListener('pointerdown', () => {
            const animal = card.dataset.animal;
            if (window.kidsSound) {
                window.kidsSound.playAnimal(animal);
            }
            card.classList.add('jump-anim');
            setTimeout(() => card.classList.remove('jump-anim'), 500);

            // 音符エフェクト
            const rect = card.getBoundingClientRect();
            spawnMusicNote(rect.left + rect.width / 2, rect.top);
        });
    });
}

function spawnMusicNote(x, y) {
    const note = document.createElement('div');
    note.className = 'music-note';
    note.textContent = ['🎵', '🎶', '✨', '🐾'][Math.floor(Math.random() * 4)];
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 700);
}

// 3. えあわせ カードめくり
function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const msg = document.getElementById('memory-message');
    const resetBtn = document.getElementById('memory-reset');
    if (!grid) return;

    const items = ['🍎', '🍌', '🍓']; // 3ペア (計6枚) で幼児が簡単に遊べる枚数
    let deck = [...items, ...items];
    let flippedCards = [];
    let matchedCount = 0;
    let lock = false;

    function render() {
        grid.innerHTML = '';
        flippedCards = [];
        matchedCount = 0;
        lock = false;
        if (msg) msg.textContent = 'おなじ えを みつけてね！';

        // シャッフル
        deck.sort(() => Math.random() - 0.5);

        deck.forEach((item, idx) => {
            const card = document.createElement('button');
            card.className = 'memory-card';
            card.dataset.val = item;
            card.dataset.idx = idx;
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">❓</div>
                    <div class="card-back">${item}</div>
                </div>
            `;

            card.addEventListener('pointerdown', () => {
                if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;

                if (window.kidsSound) window.kidsSound.playTap(520);
                card.classList.add('flipped');
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    lock = true;
                    const [c1, c2] = flippedCards;
                    if (c1.dataset.val === c2.dataset.val) {
                        setTimeout(() => {
                            if (window.kidsSound) window.kidsSound.playSuccess();
                            c1.classList.add('matched');
                            c2.classList.add('matched');
                            flippedCards = [];
                            matchedCount++;
                            if (matchedCount === items.length) {
                                if (msg) msg.textContent = '🎉 ぜんぶ そろったよ！すごい！ 🎉';
                                if (window.kidsSound) window.kidsSound.playFanfare();
                            }
                            lock = false;
                        }, 400);
                    } else {
                        setTimeout(() => {
                            c1.classList.remove('flipped');
                            c2.classList.remove('flipped');
                            flippedCards = [];
                            lock = false;
                        }, 900);
                    }
                }
            });

            grid.appendChild(card);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (window.kidsSound) window.kidsSound.playTap();
            render();
        });
    }

    render();
}

// 4. ぴかぴか おほしさまキャッチ
function initStarCatchGame() {
    const playArea = document.getElementById('star-game-area');
    const starCountElem = document.getElementById('star-count');
    const startBtn = document.getElementById('star-start-btn');
    if (!playArea || !startBtn) return;

    let count = 0;
    let timer = null;

    function dropStar() {
        if (!playArea) return;
        const star = document.createElement('div');
        star.className = 'falling-star';
        const icons = ['⭐', '🌟', '🍭', '🍓', '🧸'];
        star.textContent = icons[Math.floor(Math.random() * icons.length)];
        const left = 5 + Math.random() * 85;
        star.style.left = `${left}%`;

        star.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (window.kidsSound) window.kidsSound.playTap(700 + count * 40);
            createStars(e.clientX, e.clientY);
            count++;
            if (starCountElem) starCountElem.textContent = count;
            star.remove();

            if (count >= 10) {
                if (window.kidsSound) window.kidsSound.playFanfare();
                alert('🌟 10こ あつめたよ！おめでとう！ 🌟');
                clearInterval(timer);
                timer = null;
                startBtn.textContent = 'もういちど あそぶ';
            }
        });

        playArea.appendChild(star);
        setTimeout(() => {
            if (star.parentNode) star.remove();
        }, 3200);
    }

    startBtn.addEventListener('click', () => {
        count = 0;
        if (starCountElem) starCountElem.textContent = count;
        if (window.kidsSound) window.kidsSound.playTap();
        if (timer) clearInterval(timer);
        timer = setInterval(dropStar, 900);
        startBtn.textContent = 'あつめてね！';
    });
}

// 5. まいにち ガチャポン
function initCapsuleToy() {
    const lever = document.getElementById('capsule-lever');
    const resultBox = document.getElementById('capsule-result');
    if (!lever || !resultBox) return;

    const animals = [
        { icon: '🦁', name: 'げんき ライオン', desc: 'きょうは いっぱい はしろう！' },
        { icon: '🐰', name: 'にこにこ うさぎ', desc: 'ぴょんぴょん たのしい いちにち！' },
        { icon: '🐻', name: 'やさしい くまさん', desc: 'おともだちと なかよくしよう！' },
        { icon: '🐼', name: 'のんびり パンダ', desc: 'ごはんを おいしく たべようね！' },
        { icon: '🐬', name: 'すいすい いるか', desc: 'みずあそび＆てあらい ばっちり！' }
    ];

    lever.addEventListener('click', () => {
        if (lever.classList.contains('spinning')) return;
        lever.classList.add('spinning');
        if (window.kidsSound) window.kidsSound.playTap(350);

        setTimeout(() => {
            lever.classList.remove('spinning');
            const chosen = animals[Math.floor(Math.random() * animals.length)];
            resultBox.innerHTML = `
                <div class="result-capsule pop-in">
                    <span class="capsule-icon">${chosen.icon}</span>
                    <div class="capsule-name">${chosen.name}</div>
                    <div class="capsule-desc">${chosen.desc}</div>
                </div>
            `;
            if (window.kidsSound) window.kidsSound.playSuccess();
        }, 800);
    });
}

// 年齢フィルタータブ
function initAgeFilter() {
    const tabs = document.querySelectorAll('.age-tab');
    const cards = document.querySelectorAll('.game-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (window.kidsSound) window.kidsSound.playTap();

            const targetAge = tab.dataset.age;
            cards.forEach(card => {
                const cardAge = card.dataset.ageGroup;
                if (targetAge === 'all' || cardAge === 'all' || cardAge === targetAge) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// サウンドON/OFF切り替え
function initSoundToggle() {
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', () => {
        if (window.kidsSound) {
            const isMuted = !window.kidsSound.toggleMute();
            soundBtn.textContent = isMuted ? '🔇 おと OFF' : '🔊 おと ON';
            soundBtn.classList.toggle('muted', isMuted);
        }
    });
}
