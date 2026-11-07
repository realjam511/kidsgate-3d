// 🌐 KidsGate コアロジック (ゲーム描画・フィルタリング・起動・家族専用ロック)

class KidsGateApp {
    constructor() {
        this.currentAge = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        // 登録済みゲーム ＋ 画面から追加されたカスタムゲームを統合
        const baseGames = window.KIDS_GAMES_REGISTRY || [];
        const customGames = JSON.parse(localStorage.getItem('kids_custom_games') || '[]');
        this.games = [...customGames, ...baseGames];
        
        // ページ固有の優先ゲームファイル指定があれば先頭に並べる（10パターンの個性を出すため）
        const preferredFile = document.body.dataset.featuredGame;
        if (preferredFile) {
            this.games.sort((a, b) => {
                if (a.file === preferredFile) return -1;
                if (b.file === preferredFile) return 1;
                return 0;
            });
        }
        
        // 家族限定パスワード保護（初回またはロック時に起動）
        const isAuthPassed = localStorage.getItem('kidsgate_auth_passed') === 'true';
        this.requireAuth = localStorage.getItem('kidsgate_auth_required') !== 'false'; // デフォルトで保護有効
        this.isLocked = !isAuthPassed && this.requireAuth;

        this.init();
    }

    init() {
        this.checkAuth();
        this.renderHero();
        this.updateCategoryCounts();
        this.renderGames();
        this.bindEvents();
    }

    // 家族専用ロック（合言葉・暗証番号で外出先でも部外者を完全ブロック）
    checkAuth() {
        const pinModal = document.getElementById('pin-lock-modal');
        if (!pinModal) return;

        if (this.isLocked) {
            pinModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            pinModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    unlockWithPin(inputPin, remember = true) {
        const savedPin = localStorage.getItem('kidsgate_family_pin') || '1234';
        if (inputPin && inputPin.trim() === savedPin.trim()) {
            this.isLocked = false;
            if (remember) {
                localStorage.setItem('kidsgate_auth_passed', 'true');
            }
            const pinModal = document.getElementById('pin-lock-modal');
            if (pinModal) pinModal.style.display = 'none';
            document.body.style.overflow = '';
            alert('🎉 あいことばOK！ようこそ もくいくゲートへ！');
        } else {
            alert('❌ あいことばがちがうよ！\n（※初期あいことばは「1234」です）');
        }
    }

    renderHero() {
        const heroContainer = document.getElementById('portal-hero-box');
        if (!heroContainer) return;

        const heroGame = this.games.find(g => g.isHero) || this.games[0];
        if (!heroGame) return;

        heroContainer.innerHTML = `
            <div class="hero-left">
                <span class="hero-tag-badge">🌲 北海道の自然とあそぶ 3D知育</span>
                <h2>${heroGame.icon} ${heroGame.title}</h2>
                <p>${heroGame.desc}</p>
                <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                    <button class="btn-launch-hero" onclick="app.launchGame('${heroGame.file}', '${heroGame.title}')">
                        今すぐあそぶ！ ▶
                    </button>
                    <span style="font-size:0.84rem; opacity:0.92; font-weight:800; color:#3a5a40;">🎯 ${heroGame.ageLabel || '全年齢'}</span>
                </div>
            </div>
            <div class="hero-graphic">${heroGame.icon}</div>
        `;
    }

    normalizeAge(age) {
        if (!age) return 'all';
        if (age === 'all') return 'all';
        if (age === 'baby' || age === '0-2') return 'baby';
        if (age === 'mid' || age === '3-4') return 'mid';
        if (age === 'high' || age === '5-6') return 'high';
        return age;
    }

    updateCategoryCounts() {
        const total = this.games.length;
        const babyCount = this.games.filter(g => this.normalizeAge(g.age) === 'baby').length;
        const midCount = this.games.filter(g => this.normalizeAge(g.age) === 'mid').length;
        const highCount = this.games.filter(g => this.normalizeAge(g.age) === 'high').length;

        const setCount = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setCount('count-all', total);
        setCount('count-baby', babyCount);
        setCount('count-mid', midCount);
        setCount('count-high', highCount);
    }

    renderGames() {
        const grid = document.getElementById('portal-games-grid');
        if (!grid) return;

        const targetAge = this.normalizeAge(this.currentAge);

        let filtered = this.games.filter(g => {
            const gAge = this.normalizeAge(g.age);
            const matchAge = (targetAge === 'all') || (gAge === targetAge);
            const matchCat = (this.currentCategory === 'all') || (g.category === this.currentCategory);
            const matchSearch = !this.searchQuery || 
                (g.title && g.title.includes(this.searchQuery)) || 
                (g.desc && g.desc.includes(this.searchQuery));
            return matchAge && matchCat && matchSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; opacity: 0.8;">
                    <div style="font-size:3.5rem; margin-bottom:12px;">🔍</div>
                    <p style="font-size:1.1rem; font-weight:800; margin-bottom:6px;">あてはまるゲームがみつからなかったよ</p>
                    <p style="font-size:0.85rem;">左のメニューから「ぜんぶのゲーム」をおしてみてね！</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map((g, idx) => `
            <div class="portal-card" onclick="app.launchGameById('${g.id}')" title="${g.title} であそぶ">
                <div class="card-header-row">
                    <div class="card-icon-badge">
                        <span>${g.icon}</span>
                    </div>
                    <div class="card-status-tags">
                        <span class="micro-tag age-tag">🎯 ${g.ageLabel || '幼児向け'}</span>
                        <span class="card-tag-badge">${idx === 0 ? '★ イチオシ' : (g.tag || '人気')}</span>
                    </div>
                </div>
                <div class="card-content-wrap">
                    <h4 class="card-title">${g.title}</h4>
                </div>
                <div class="card-footer-tags">
                    <span class="micro-tag cat-tag">${g.categoryLabel || '3D知育'}</span>
                    <span class="card-play-hint">あそぶ ▶</span>
                </div>
            </div>
        `).join('');
    }

    resolveGamePath(fileUrl) {
        if (!fileUrl) return '';
        let target = fileUrl;
        const isRoot = !location.pathname.includes('/site/');
        if (isRoot && target.startsWith('games/')) {
            target = 'site/' + target;
        }
        return target.split('/').map(part => encodeURIComponent(part)).join('/');
    }

    launchGameById(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            this.launchGame(game.file, game.title, game.rawHtml);
        }
    }

    launchGame(fileUrl, title, rawHtml = null) {
        const modal = document.getElementById('game-modal') || document.getElementById('game-play-modal');
        const frame = document.getElementById('game-iframe') || document.getElementById('game-play-frame');
        const titleEl = document.getElementById('modal-game-title') || document.getElementById('game-modal-title');

        if (modal && frame) {
            if (rawHtml) {
                // ファイル不要！貼り付けられた生HTMLコードを即座に全画面実行
                frame.removeAttribute('src');
                frame.srcdoc = rawHtml;
            } else {
                frame.removeAttribute('srcdoc');
                frame.src = this.resolveGamePath(fileUrl);
            }
            if (titleEl) titleEl.textContent = '🎮 ' + title;
            modal.style.display = 'flex';
        } else {
            if (fileUrl) location.href = this.resolveGamePath(fileUrl);
        }
    }

    closeModal() {
        this.closeGameModal();
    }

    closeGameModal() {
        const modal = document.getElementById('game-modal') || document.getElementById('game-play-modal');
        const frame = document.getElementById('game-iframe') || document.getElementById('game-play-frame');
        if (modal) {
            modal.style.display = 'none';
        }
        if (frame) {
            frame.src = 'about:blank';
        }
    }

    setAge(ageKey) {
        this.currentAge = ageKey;
        const normTarget = this.normalizeAge(ageKey);

        document.querySelectorAll('#age-filter-list .cat-item, [data-filter-age], [data-age]').forEach(el => {
            const item = el.classList.contains('cat-item') ? el : el.closest('.cat-item');
            if (!item) return;
            const itemAge = this.normalizeAge(item.dataset.age || item.dataset.filterAge);
            item.classList.toggle('active', itemAge === normTarget);
        });
        this.renderGames();
    }

    setCategory(catKey) {
        this.currentCategory = catKey;
        document.querySelectorAll('#category-filter-list .cat-item, [data-filter-cat], [data-cat]').forEach(el => {
            const item = el.classList.contains('cat-item') ? el : el.closest('.cat-item');
            if (!item) return;
            const itemCat = item.dataset.cat || item.dataset.filterCat;
            item.classList.toggle('active', itemCat === catKey);
        });
        this.renderGames();
    }

    bindEvents() {
        const searchInput = document.getElementById('search-games-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.renderGames();
            });
        }

        const ageList = document.getElementById('age-filter-list');
        if (ageList) {
            ageList.addEventListener('click', (e) => {
                const item = e.target.closest('.cat-item');
                if (item && item.dataset.age) {
                    this.setAge(item.dataset.age);
                }
            });
        }

        const catList = document.getElementById('category-filter-list');
        if (catList) {
            catList.addEventListener('click', (e) => {
                const item = e.target.closest('.cat-item');
                if (item && item.dataset.cat) {
                    this.setCategory(item.dataset.cat);
                }
            });
        }
    }
}
