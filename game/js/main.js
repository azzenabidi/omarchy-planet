// Omarchy Planet - Phaser.js Game
(function () {
if (typeof Phaser === 'undefined') {
    // Engine missing or blocked by integrity check: fail closed.
    // Do not boot the game and do not expose any page-side wiring.
    const btn = document.getElementById('music-toggle');
    if (btn) btn.style.display = 'none';
    console.error('[omarchy-planet] game engine unavailable; refusing to start');
    return;
}

const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#0a0a0a',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Boot, Village, Forest, SettingsCave, Workshop],
    audio: {
        noAudio: true
    }
};

const game = new Phaser.Game(config);

// Start chiptune on first interaction (autoplay policy requires a gesture)
window.addEventListener('pointerdown', () => Chiptune.unlock(), true);

window.onPlanetActivate = function() {
    if (game && game.scene) {
        game.scene.scenes.forEach(scene => {
            if (scene.sys && scene.sys.isActive()) {
                scene.sys.resume();
            }
        });
    }
    Chiptune.resume();
};

window.onPlanetDeactivate = function() {
    if (game && game.scene) {
        game.scene.scenes.forEach(scene => {
            if (scene.sys && scene.sys.isActive()) {
                scene.sys.pause();
            }
        });
    }
    Chiptune.suspend();
};
})();
