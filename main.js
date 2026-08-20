const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Menyesuaikan otomatis dengan layar tanpa merusak rasio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Membuat canvas selalu berada di tengah layar
        width: 1280, // Resolusi dasar lebar
        height: 720  // Resolusi dasar tinggi
    },
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
