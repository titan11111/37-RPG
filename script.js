// ゲームの状態管理
let gameState = {
    currentScreen: 'title',
    player: {
        name: 'カケル',
        gender: 'boy',
        x: 200,
        y: 250,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        level: 1,
        exp: 0,
        direction: 'down'
    },
    messages: [],
    currentMessageIndex: 0,
    inBattle: false,
    currentEnemy: null,
    gameVolume: 0.5,
    currentBgm: null
};

// 敵データ（画像付き）
const enemies = {
    slime: {
        name: 'スライム',
        image: 'images/slime.png',
        hp: 30,
        maxHp: 30,
        attack: 8,
        exp: 15
    },
    goblin: {
        name: 'ゴブリン',
        image: 'images/goblin.png',
        hp: 45,
        maxHp: 45,
        attack: 12,
        exp: 25
    },
    demon: {
        name: 'まおう',
        image: 'images/demon.png',
        hp: 150,
        maxHp: 150,
        attack: 25,
        exp: 100
    }
};

// フィールドイベント（新しい地形を含む）
const fieldEvents = [
    // 街のイベント
    { x: 80, y: 80, type: 'town', message: 'ヒカリの街へようこそ！\nここは平和な街です。' },
    { x: 100, y: 80, type: 'shop', message: 'よろず屋です！\n回復アイテムを手に入れた！' },
    { x: 120, y: 80, type: 'church', message: 'ここは教会です。\nHPとMPが全回復しました！' },
    
    // 山のイベント
    { x: 300, y: 60, type: 'mountain', message: '高い山です。\n見晴らしがとてもいいですね！' },
    { x: 320, y: 60, type: 'cave', message: '山の洞窟を発見！\n中は暗くて怖そうです...' },
    
    // 橋のイベント
    { x: 200, y: 210, type: 'bridge', message: 'きれいな石の橋です。\n川を渡ることができます。' },
    
    // 洞窟のイベント
    { x: 350, y: 280, type: 'dungeon', enemy: 'demon' },
    
    // 森のイベント
    { x: 220, y: 300, type: 'forest', message: '深い森です。\n小鳥の鳴き声が聞こえます。' },
    
    // 戦闘イベント
    { x: 120, y: 160, type: 'battle', enemy: 'slime' },
    { x: 280, y: 140, type: 'battle', enemy: 'goblin' },
    { x: 80, y: 320, type: 'battle', enemy: 'slime' },
    
    // 宝箱イベント
    { x: 50, y: 50, type: 'treasure', message: 'きらきら光る宝箱を見つけた！\nやる気が10回復した！' },
    { x: 380, y: 320, type: 'treasure', message: '古い宝箱を発見！\nHPが20回復した！' }
];

// BGM管理
const bgmManager = {
    fieldBgm: null,
    battleBgm: null,
    currentBgm: null,
    
    init() {
        this.fieldBgm = document.getElementById('fieldBgm');
        this.battleBgm = document.getElementById('battleBgm');
        
        // 音量設定
        this.fieldBgm.volume = gameState.gameVolume;
        this.battleBgm.volume = gameState.gameVolume;
        
        // BGMが読み込めない場合のエラーハンドリング
        this.fieldBgm.onerror = () => console.log('フィールドBGMが読み込めませんでした');
        this.battleBgm.onerror = () => console.log('戦闘BGMが読み込めませんでした');
    },
    
    playField() {
        this.stopAll();
        try {
            this.fieldBgm.currentTime = 0;
            this.fieldBgm.play().catch(e => console.log('フィールドBGM再生エラー:', e));
            this.currentBgm = 'field';
        } catch (e) {
            console.log('フィールドBGM再生エラー:', e);
        }
    },
    
    playBattle() {
        this.stopAll();
        try {
            this.battleBgm.currentTime = 0;
            this.battleBgm.play().catch(e => console.log('戦闘BGM再生エラー:', e));
            this.currentBgm = 'battle';
        } catch (e) {
            console.log('戦闘BGM再生エラー:', e);
        }
    },
    
    stopAll() {
        try {
            this.fieldBgm.pause();
            this.battleBgm.pause();
        } catch (e) {
            console.log('BGM停止エラー:', e);
        }
    },
    
    setVolume(volume) {
        gameState.gameVolume = volume / 100;
        this.fieldBgm.volume = gameState.gameVolume;
        this.battleBgm.volume = gameState.gameVolume;
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    setupKeyboardControls();
    bgmManager.init();
});

function initGame() {
    showScreen('titleScreen');
    updatePlayerDisplay();
    createFieldEvents();
    updatePlayerDirection();
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    gameState.currentScreen = screenId;
    
    // BGM管理
    if (screenId === 'gameScreen' && !gameState.inBattle) {
        bgmManager.playField();
    } else if (screenId === 'titleScreen') {
        bgmManager.stopAll();
    }
}

// ゲーム開始
function startGame() {
    showScreen('gameScreen');
    bgmManager.playField();
    showMessage(['ある日の授業中...', 'タブレットが光った！', 'あなたは異世界に転送されました！', 'さあ、冒険の始まりです！']);
}

// 設定画面
function showSettings() {
    showScreen('settingsScreen');
    document.getElementById('nameInput').value = gameState.player.name;
    document.getElementById('genderSelect').value = gameState.player.gender;
    document.getElementById('volumeSlider').value = gameState.gameVolume * 100;
    document.getElementById('volumeValue').textContent = Math.round(gameState.gameVolume * 100) + '%';
}

function saveSettings() {
    gameState.player.name = document.getElementById('nameInput').value || 'カケル';
    gameState.player.gender = document.getElementById('genderSelect').value;
    
    const volume = document.getElementById('volumeSlider').value;
    bgmManager.setVolume(volume);
    
    updatePlayerDisplay();
    updatePlayerGender();
    backToTitle();
}

function backToTitle() {
    showScreen('titleScreen');
}

// 音量スライダーのイベント
document.addEventListener('DOMContentLoaded', function() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    volumeSlider.addEventListener('input', function() {
        const volume = this.value;
        volumeValue.textContent = volume + '%';
        bgmManager.setVolume(volume);
    });
});

// プレイヤー表示更新
function updatePlayerDisplay() {
    document.getElementById('playerName').textContent = gameState.player.name;
    document.getElementById('playerHP').textContent = gameState.player.hp;
    document.getElementById('playerMaxHP').textContent = gameState.player.maxHp;
    document.getElementById('playerMP').textContent = gameState.player.mp;
    document.getElementById('playerMaxMP').textContent = gameState.player.maxMp;
    document.getElementById('playerLevel').textContent = gameState.player.level;
}

// プレイヤーの性別更新
function updatePlayerGender() {
    const playerSvg = document.getElementById('playerSvg');
    if (gameState.player.gender === 'girl') {
        // 女の子の場合、髪を長くして色を変える
        playerSvg.querySelector('path').setAttribute('d', 'M8 12 Q20 3 32 12 Q28 6 20 6 Q12 6 8 12 Q10 15 20 16 Q30 15 32 12');
        playerSvg.querySelector('path').setAttribute('fill', '#4a2c2a');
    } else {
        // 男の子の場合（デフォルト）
        playerSvg.querySelector('path').setAttribute('d', 'M10 12 Q20 5 30 12 Q25 8 20 8 Q15 8 10 12');
        playerSvg.querySelector('path').setAttribute('fill', '#8b4513');
    }
}

// プレイヤーの向き更新
function updatePlayerDirection() {
    const player = document.getElementById('player');
    const playerSvg = document.getElementById('playerSvg');
    
    player.className = 'character';
    
    switch(gameState.player.direction) {
        case 'up':
            player.classList.add('face-up');
            break;
        case 'down':
            player.classList.add('face-down');
            break;
        case 'left':
            player.classList.add('face-left');
            break;
        case 'right':
            player.classList.add('face-right');
            break;
    }
}

// フィールドイベント作成
function createFieldEvents() {
    const field = document.getElementById('field');
    
    fieldEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'field-event';
        eventElement.style.left = event.x + 'px';
        eventElement.style.top = event.y + 'px';
        
        switch(event.type) {
            case 'town':
                eventElement.textContent = '🏠';
                break;
            case 'shop':
                eventElement.textContent = '🏪';
                break;
            case 'church':
                eventElement.textContent = '⛪';
                break;
            case 'mountain':
                eventElement.textContent = '⛰️';
                break;
            case 'cave':
                eventElement.textContent = '🕳️';
                break;
            case 'bridge':
                eventElement.textContent = '🌉';
                break;
            case 'dungeon':
                eventElement.textContent = '🏰';
                break;
            case 'forest':
                eventElement.textContent = '🌲';
                break;
            case 'battle':
                eventElement.textContent = '⚔️';
                break;
            case 'treasure':
                eventElement.textContent = '💎';
                break;
        }
        
        eventElement.onclick = () => triggerEvent(event);
        field.appendChild(eventElement);
    });
}

// キーボード操作
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        if (gameState.currentScreen !== 'gameScreen') return;
        if (gameState.inBattle) return;
        if (!document.getElementById('messageWindow').classList.contains('hidden')) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                movePlayer('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                movePlayer('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                movePlayer('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                movePlayer('right');
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                checkEvent();
                break;
        }
    });
}

// プレイヤー移動
function movePlayer(direction) {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const stepSize = 40;
    
    let newX = gameState.player.x;
    let newY = gameState.player.y;
    
    // 向きを更新
    gameState.player.direction = direction;
    
    switch(direction) {
        case 'up':
            newY = Math.max(0, newY - stepSize);
            break;
        case 'down':
            newY = Math.min(gameArea.clientHeight - 40, newY + stepSize);
            break;
        case 'left':
            newX = Math.max(0, newX - stepSize);
            break;
        case 'right':
            newX = Math.min(gameArea.clientWidth - 40, newX + stepSize);
            break;
    }
    
    // 川の当たり判定（橋以外では渡れない）
    if (newY >= 200 && newY <= 240 && !(newX >= 160 && newX <= 240)) {
        showMessage(['川を渡れません！', '橋を探してみましょう。']);
        return;
    }
    
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    player.style.left = newX + 'px';
    player.style.top = newY + 'px';
    
    // 向きを更新
    updatePlayerDirection();
    
    // ランダムエンカウント（低確率）
    if (Math.random() < 0.05) {
        startRandomBattle();
    }
    
    // 移動音
    playMoveSound();
}

// イベントチェック
function checkEvent() {
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    
    fieldEvents.forEach(event => {
        const distance = Math.sqrt(
            Math.pow(playerX - event.x, 2) + Math.pow(playerY - event.y, 2)
        );
        
        if (distance < 50) {
            triggerEvent(event);
        }
    });
}

// イベント発生
function triggerEvent(event) {
    switch(event.type) {
        case 'town':
        case 'mountain':
        case 'bridge':
        case 'forest':
            showMessage([event.message]);
            break;
        case 'shop':
            gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 15);
            updatePlayerDisplay();
            showMessage([event.message]);
            break;
        case 'church':
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.mp = gameState.player.maxMp;
            updatePlayerDisplay();
            showMessage([event.message]);
            break;
        case 'cave':
            showMessage([event.message, '勇気を出して入ってみますか？']);
            break;
        case 'treasure':
            if (event.message.includes('やる気')) {
                gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 10);
            } else {
                gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 20);
            }
            updatePlayerDisplay();
            showMessage([event.message]);
            // 宝箱は一度開いたら消す
            const treasureElement = document.querySelector(`[style*="left: ${event.x}px"][style*="top: ${event.y}px"]`);
            if (treasureElement) treasureElement.style.display = 'none';
            break;
        case 'battle':
        case 'dungeon':
            startBattle(event.enemy);
            break;
    }
}

// メッセージ表示
function showMessage(messages) {
    gameState.messages = messages;
    gameState.currentMessageIndex = 0;
    
    const messageWindow = document.getElementById('messageWindow');
    const messageText = document.getElementById('messageText');
    
    messageWindow.classList.remove('hidden');
    messageText.textContent = messages[0];
}

function nextMessage() {
    gameState.currentMessageIndex++;
    
    if (gameState.currentMessageIndex < gameState.messages.length) {
        document.getElementById('messageText').textContent = 
            gameState.messages[gameState.currentMessageIndex];
    } else {
        document.getElementById('messageWindow').classList.add('hidden');
        gameState.messages = [];
        gameState.currentMessageIndex = 0;
    }
}

// ランダム戦闘
function startRandomBattle() {
    const enemyTypes = ['slime', 'goblin'];
    const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    startBattle(randomEnemy);
}

// 戦闘開始
function startBattle(enemyType) {
    gameState.inBattle = true;
    gameState.currentEnemy = { ...enemies[enemyType] };
    
    // BGMを戦闘用に切り替え
    bgmManager.playBattle();
    
    const battleScreen = document.getElementById('battleScreen');
    const enemyImage = document.getElementById('enemyImage');
    const enemyName = document.getElementById('enemyName');
    const enemyHP = document.getElementById('enemyHP');
    
    battleScreen.classList.remove('hidden');
    enemyImage.src = gameState.currentEnemy.image;
    enemyImage.alt = gameState.currentEnemy.name;
    enemyName.textContent = gameState.currentEnemy.name;
    enemyHP.textContent = gameState.currentEnemy.hp;
    
    showMessage([`${gameState.currentEnemy.name}があらわれた！`]);
}

// 戦闘アクション
function attack() {
    if (!gameState.inBattle) return;
    
    const damage = Math.floor(Math.random() * 15) + 10;
    gameState.currentEnemy.hp -= damage;
    
    let messages = [`${gameState.player.name}のこうげき！`, `${damage}のダメージ！`];
    
    if (gameState.currentEnemy.hp <= 0) {
        messages.push(`${gameState.currentEnemy.name}をたおした！`);
        messages.push(`けいけんちを${gameState.currentEnemy.exp}てにいれた！`);
        
        gameState.player.exp += gameState.currentEnemy.exp;
        
        if (gameState.player.exp >= gameState.player.level * 100) {
            levelUp();
            messages.push('レベルアップ！');
        }
        
        // 魔王を倒した場合
        if (gameState.currentEnemy.name === 'まおう') {
            messages.push('やったね！魔王をたおした！');
            messages.push('ヒカリノオウコクに平和がもどった！');
            setTimeout(() => gameComplete(), 3000);
        }
        
        endBattle();
    } else {
        // 敵の攻撃
        setTimeout(() => {
            enemyAttack();
        }, 2000);
    }
    
    document.getElementById('enemyHP').textContent = Math.max(0, gameState.currentEnemy.hp);
    showMessage(messages);
    playAttackSound();
}

function useSkill() {
    if (gameState.player.mp < 5) {
        showMessage(['やる気がたりない！']);
        return;
    }
    
    gameState.player.mp -= 5;
    const damage = Math.floor(Math.random() * 20) + 15;
    gameState.currentEnemy.hp -= damage;
    
    updatePlayerDisplay();
    
    let messages = [`${gameState.player.name}のひらめきビーム！`, `${damage}のダメージ！`];
    
    if (gameState.currentEnemy.hp <= 0) {
        messages.push(`${gameState.currentEnemy.name}をたおした！`);
        messages.push(`けいけんちを${gameState.currentEnemy.exp}てにいれた！`);
        
        gameState.player.exp += gameState.currentEnemy.exp;
        
        if (gameState.player.exp >= gameState.player.level * 100) {
            levelUp();
            messages.push('レベルアップ！');
        }
        
        // 魔王を倒した場合
        if (gameState.currentEnemy.name === 'まおう') {
            messages.push('やったね！魔王をたおした！');
            messages.push('ヒカリノオウコクに平和がもどった！');
            setTimeout(() => gameComplete(), 3000);
        }
        
        endBattle();
    } else {
        // 敵の攻撃
        setTimeout(() => {
            enemyAttack();
        }, 2000);
    }
    
    document.getElementById('enemyHP').textContent = Math.max(0, gameState.currentEnemy.hp);
    showMessage(messages);
    playAttackSound();
}

function useItem() {
    // 回復アイテム使用
    const healAmount = 20;
    gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
    updatePlayerDisplay();
    
    showMessage([`おやつを食べた！`, `HPが${healAmount}回復した！`]);
    
    // 敵の攻撃
    setTimeout(() => {
        enemyAttack();
    }, 2000);
}

function runAway() {
    if (Math.random() < 0.7) {
        showMessage(['うまく逃げることができた！']);
        endBattle();
    } else {
        showMessage(['逃げられなかった！']);
        setTimeout(() => {
            enemyAttack();
        }, 2000);
    }
}

// 敵の攻撃
function enemyAttack() {
    if (!gameState.inBattle) return;
    
    const damage = Math.floor(Math.random() * gameState.currentEnemy.attack) + 5;
    gameState.player.hp -= damage;
    
    updatePlayerDisplay();
    
    let messages = [`${gameState.currentEnemy.name}のこうげき！`, `${damage}のダメージをうけた！`];
    
    if (gameState.player.hp <= 0) {
        messages.push('たおれてしまった...', 'でも、友達の応援で復活！');
        gameState.player.hp = 1;
        updatePlayerDisplay();
        endBattle();
    }
    
    showMessage(messages);
}

// レベルアップ
function levelUp() {
    gameState.player.level++;
    gameState.player.maxHp += 20;
    gameState.player.maxMp += 10;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.mp = gameState.player.maxMp;
    gameState.player.exp = 0;
    updatePlayerDisplay();
    playVictorySound();
}

// 戦闘終了
function endBattle() {
    gameState.inBattle = false;
    gameState.currentEnemy = null;
    
    // BGMをフィールド用に戻す
    setTimeout(() => {
        bgmManager.playField();
    }, 1000);
    
    setTimeout(() => {
        document.getElementById('battleScreen').classList.add('hidden');
    }, 1000);
}

// ゲームクリア
function gameComplete() {
    showMessage([
        'やったね！魔王をたおした！',
        'ヒカリノオウコクに平和がもどった！',
        'でも一番大切なのは...',
        'みんなとの友情だったね！',
        '～ゲームクリア～',
        'あそんでくれてありがとう！'
    ]);
    
    setTimeout(() => {
        showScreen('titleScreen');
        // ゲームリセット
        gameState.player = {
            name: gameState.player.name,
            gender: gameState.player.gender,
            x: 200,
            y: 250,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            level: 1,
            exp: 0,
            direction: 'down'
        };
        updatePlayerDisplay();
    }, 8000);
}

// 音効果（Web Audio API）
function playSound(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1 * gameState.gameVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // 音が出せない環境では無視
        console.log('Audio not supported');
    }
}

function playMoveSound() {
    playSound(220, 0.1);
}

function playAttackSound() {
    playSound(440, 0.2);
}

function playVictorySound() {
    playSound(523, 0.5);
}

// タッチイベント（スマホ対応）
let touchStartX = 0;
let touchStartY = 0;

document.getElementById('gameArea').addEventListener('touchstart', function(e) {
    if (gameState.currentScreen !== 'gameScreen') return;
    if (gameState.inBattle) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

document.getElementById('gameArea').addEventListener('touchend', function(e) {
    if (gameState.currentScreen !== 'gameScreen') return;
    if (gameState.inBattle) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                movePlayer('right');
            } else {
                movePlayer('left');
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                movePlayer('down');
            } else {
                movePlayer('up');
            }
        }
    }
    
    e.preventDefault();
});

// ダブルタップでイベントチェック
let lastTap = 0;
document.getElementById('gameArea').addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
        checkEvent();
    }
    
    lastTap = currentTime;
});

// チートコード（開発用）
let cheatCode = '';
document.addEventListener('keydown', function(e) {
    cheatCode += e.key;
    if (cheatCode.includes('boss')) {
        cheatCode = '';
        if (gameState.currentScreen === 'gameScreen' && !gameState.inBattle) {
            startBattle('demon');
        }
    }
    if (cheatCode.includes('heal')) {
        cheatCode = '';
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.mp = gameState.player.maxMp;
        updatePlayerDisplay();
    }
    if (cheatCode.includes('win')) {
        cheatCode = '';
        gameComplete();
    }
    
    // チートコードをリセット（長すぎる場合）
    if (cheatCode.length > 20) {
        cheatCode = '';
    }
});

// ヘルプボタンを追加（スマホ用）
document.addEventListener('DOMContentLoaded', function() {
    const helpButton = document.createElement('button');
    helpButton.textContent = '？';
    helpButton.style.position = 'fixed';
    helpButton.style.top = '10px';
    helpButton.style.right = '10px';
    helpButton.style.width = '40px';
    helpButton.style.height = '40px';
    helpButton.style.borderRadius = '50%';
    helpButton.style.background = '#3498db';
    helpButton.style.color = 'white';
    helpButton.style.border = 'none';
    helpButton.style.fontSize = '20px';
    helpButton.style.cursor = 'pointer';
    helpButton.style.zIndex = '1000';
    
    helpButton.onclick = () => {
        const hints = [
            'スペースキーで近くのものを調べられるよ！',
            'スワイプして移動できるよ！',
            '川は橋以外では渡れないよ！',
            '「boss」と入力すると魔王と戦えるよ！',
            '「heal」と入力すると回復するよ！',
            '教会ではHP・MPが全回復するよ！',
            'よろず屋でやる気を回復できるよ！'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        showMessage([`💡 ヒント: ${randomHint}`]);
    };
    
    document.body.appendChild(helpButton);
});

// オートセーブ機能
function saveGame() {
    try {
        const saveData = {
            player: gameState.player,
            timestamp: new Date().getTime()
        };
        window.gameData = saveData;
    } catch (e) {
        console.log('Save failed');
    }
}

function loadGame() {
    try {
        if (window.gameData) {
            gameState.player = { ...window.gameData.player };
            updatePlayerDisplay();
            return true;
        }
    } catch (e) {
        console.log('Load failed');
    }
    return false;
}

// 定期的にオートセーブ
setInterval(saveGame, 30000); // 30秒ごと

// ゲーム初期化完了
console.log('ヒカリノオウコク - ゲーム読み込み完了！');
console.log('チートコード: boss, heal, win');
console.log('操作方法: 矢印キー/WASD/スワイプで移動、スペース/ダブルタップで調べる');
console.log('BGMファイルの配置: audio/fi-rudo.mp3, audio/senntou.mp3');
console.log('敵画像の配置: images/goblin.png, images/demon.png, images/slime.png');