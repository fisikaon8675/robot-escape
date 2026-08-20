let robot;
let cursors; // Menangkap input keyboard

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
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

const game = new Phaser.Game(config);

function preload() {
    this.load.image('robot-sprite', 'assets/robot.png');
    this.load.image('kayu-sprite', 'assets/kayu.png');
    this.load.image('besi-sprite', 'assets/besi.png');
}

function create() {
    // 1. MEMBUAT LANTAI (GROUND)
    const groundVisual = this.add.rectangle(640, 700, 1280, 50, 0x228B22); 
    this.matter.add.gameObject(groundVisual, { 
        isStatic: true 
        
    });

    // 2. MEMBUAT ROBOT (Karakter Utama)
    const robotVisual = this.add.image(200, 100, 'robot-sprite').setDisplaySize(60, 50);
    robot = this.matter.add.gameObject(robotVisual, {
        shape: { type: 'rectangle', width: 60, height: 50 },
        mass: 1,
        restitution: 0.4,
        friction: 0.05,
        label: 'robot'
    });
    // 3. MENAMBAHKAN RINTANGAN (Eksperimen Massa)

    // Balok Kayu (Ringan)
    // Posisi X: 500, Y: 600, Ukuran: 60x60, Warna: Coklat (0x8B4513)
    const kayuVisual = this.add.image(500, 600, 'kayu-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 0.5,       // Setengah dari massa robot (Sangat ringan)
        friction: 0.05,  // Licin
        restitution: 0.2
    });

    // Balok Besi (Berat)
    // Posisi X: 800, Y: 600, Ukuran: 60x60, Warna: Abu-abu (0x808080)
    const besiVisual = this.add.image(800, 600, 'besi-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(besiVisual, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 20,        // 20x lipat massa robot (Sangat berat!)
        friction: 0.6,   // Kasar (sulit digeser)
        restitution: 0.05
    });
    
    console.log("Lantai dan Robot berhasil dibuat!");
    // (Tambahkan di baris paling bawah fungsi create)
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Memastikan robot dan keyboard sudah dimuat
    if (!robot || !cursors) return;

    const forceAmount = 0.002; // Besaran Gaya (F)

    // Bergerak ke Kiri
    if (cursors.left.isDown) {
        robot.applyForce({ x: -forceAmount, y: 0 }); // Mendorong ke kiri (X negatif)
    }
    // Bergerak ke Kanan
    else if (cursors.right.isDown) {
        robot.applyForce({ x: forceAmount, y: 0 }); // Mendorong ke kanan (X positif)
    }

    // Melompat (Hanya bisa melompat jika kecepatan Y-nya mendekati 0 / sedang di lantai)
    if (cursors.up.isDown && Math.abs(robot.body.velocity.y) < 0.1) {
        robot.setVelocityY(-10); // Memberikan dorongan instan ke atas
    }
}
