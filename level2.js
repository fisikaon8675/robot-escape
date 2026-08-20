const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    backgroundColor: '#2F4F4F', // Warna abu-abu kehijauan (gelap) agar terasa seperti ruangan baru
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: true // KITA NYALAKAN DEBUG LAGI untuk membantu merakit bidang miring!
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Kosong untuk saat ini
}

function create() {
    console.log("Mesin Level 2 dan Matter.js siap dirakit!");
}

function update() {
    // Kosong untuk saat ini
}
