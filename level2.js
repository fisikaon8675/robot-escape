let robot;
let kayu;
let cursors;
let isLeftDown = false;
let isRightDown = false;
let isJumpDown = false;

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
    // Kita bisa menggunakan ulang gambar dari Level 1!
    this.load.image('robot-sprite', 'assets/robot.png');
    this.load.image('kayu-sprite', 'assets/kayu.png');
}

function create() {
    // 1. MEMBUAT LANTAI DASAR DAN PANGGUNG TENGAH
    const lantai = this.add.rectangle(640, 700, 1280, 50, 0x654321);
    this.matter.add.gameObject(lantai, { isStatic: true });

    const panggungTengah = this.add.rectangle(640, 300, 300, 20, 0xaaaaaa);
    this.matter.add.gameObject(panggungTengah, { isStatic: true });

    // 2. TANJAKAN KARET (KIRI) - GAYA GESEK TINGGI
    const tanjakanKaret = this.add.rectangle(350, 500, 600, 20, 0x333333);
    this.matter.add.gameObject(tanjakanKaret, { 
        isStatic: true, 
        angle: 0.6,    // Dimiringkan (dalam radian)
        friction: 0.8  // Gesekan sangat tinggi (kasar)
    });
    this.add.text(350, 550, "JALUR KARET (Friction: 0.8)", { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);

    // 3. TANJAKAN ES (KANAN) - GAYA GESEK RENDAH
    const tanjakanEs = this.add.rectangle(930, 500, 600, 20, 0xADD8E6);
    this.matter.add.gameObject(tanjakanEs, { 
        isStatic: true, 
        angle: -0.6,   // Dimiringkan ke arah berlawanan
        friction: 0.01 // Sangat licin
    });
    this.add.text(930, 550, "JALUR ES (Friction: 0.01)", { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);

    // 4. MENAMBAHKAN ROBOT DAN KOTAK KAYU
    const kayuVisual = this.add.image(150, 600, 'kayu-sprite').setDisplaySize(50, 50);
    kayu = this.matter.add.gameObject(kayuVisual, { // <-- HAPUS kata 'let' di sini
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 0.1
    });

    const robotVisual = this.add.image(50, 600, 'robot-sprite').setDisplaySize(50, 50);
    robot = this.matter.add.gameObject(robotVisual, { // <-- HAPUS kata 'let' di sini
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 1,
        friction: 0.05
    }).setFixedRotation();

    // --- TAMBAHKAN KODE DI BAWAH INI SEBELUM KURUNG KURAWAL PENUTUP create() ---

    // 6. KONTROL KEYBOARD & TOUCHSCREEN
    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2); // Mengizinkan multi-touch

    const btnLeft = this.add.rectangle(100, 600, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(100, 600, '<', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnLeft.on('pointerdown', () => isLeftDown = true).on('pointerup', () => isLeftDown = false).on('pointerout', () => isLeftDown = false);

    const btnRight = this.add.rectangle(200, 600, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(200, 600, '>', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnRight.on('pointerdown', () => isRightDown = true).on('pointerup', () => isRightDown = false).on('pointerout', () => isRightDown = false);

    const btnJump = this.add.rectangle(1180, 600, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(1180, 600, '^', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnJump.on('pointerdown', () => isJumpDown = true)
        .on('pointerup', () => isJumpDown = false)
        .on('pointerout', () => isJumpDown = false);

    // 5. TEKS MISI LEVEL 2
    this.add.text(640, 100, "MISI: Dorong kotak kayu ke atas panggung abu-abu!\nPilih jalur yang paling mudah dilewati.", { 
        fontSize: '24px', fill: '#ffffff', align: 'center' 
    }).setOrigin(0.5);
}
function update() {
    const gayaDorong = 0.005; // Kekuatan dorongan robot

    // Bergerak ke Kiri
    if (cursors.left.isDown || isLeftDown) {
        robot.applyForce({ x: -gayaDorong, y: 0 });
    }
    // Bergerak ke Kanan
    else if (cursors.right.isDown || isRightDown) {
        robot.applyForce({ x: gayaDorong, y: 0 });
    }

    // Melompat (hanya bisa jika robot sedang menyentuh tanah/kecepatan Y mendekati 0)
    if ((cursors.up.isDown || isJumpDown) && Math.abs(robot.body.velocity.y) < 0.5) {
        robot.setVelocityY(-10);
        isJumpDown = false; // Mencegah lompat terus-menerus
    }
}
