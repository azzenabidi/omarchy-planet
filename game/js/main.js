// Omarchy Planet - Phaser.js Game
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

window.onPlanetActivate = function() {
    if (game && game.scene) {
        game.scene.scenes.forEach(scene => {
            if (scene.sys && scene.sys.isActive()) {
                scene.sys.resume();
            }
        });
    }
};

window.onPlanetDeactivate = function() {
    if (game && game.scene) {
        game.scene.scenes.forEach(scene => {
            if (scene.sys && scene.sys.isActive()) {
                scene.sys.pause();
            }
        });
    }
};
