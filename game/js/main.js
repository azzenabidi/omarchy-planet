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
    },
    input: {
        activePointers: 3
    }
};

const game = new Phaser.Game(config);

window.onPlanetActivate = function() {};
window.onPlanetDeactivate = function() {};
