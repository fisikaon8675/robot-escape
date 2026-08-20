const config = {
    type: Phaser.AUTO,
    width: 960,  // <-- Diubah untuk rasio 16:9
    height: 540, // <-- Diubah untuk rasio 16:9
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// ... (sisa kode game, preload, create, update biarkan seperti sebelumnya) ...
