const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    backgroundColor: '#0a0a0a',
    scene: [Boot, Village, Forest, SettingsCave, Workshop],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    render: {
        pixelArt: false,
        antialias: false
    }
};

const game = new Phaser.Game(config);

let planetActive = false;

window.onPlanetActivate = function() {
    planetActive = true;
    game.scene.scenes.forEach(scene => {
        if (scene.sys.isActive()) {
            scene.input.enabled = true;
        }
    });
};

window.onPlanetDeactivate = function() {
    planetActive = false;
    game.scene.scenes.forEach(scene => {
        if (scene.sys.isActive()) {
            scene.input.enabled = false;
        }
    });
};
