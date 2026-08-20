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

    // 4. MENAMBAHKAN ROBOT DAN KOTAK KAYU (Di kiri bawah)
    const kayuVisual = this.add.image(150, 600, 'kayu-sprite').setDisplaySize(50, 50);
    let kayu = this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 0.1
    });

    const robotVisual = this.add.image(50, 600, 'robot-sprite').setDisplaySize(50, 50);
    let robot = this.matter.add.gameObject(robotVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 1,
        friction: 0.05
    }).setFixedRotation(); // Mencegah robot berguling

    // 5. TEKS MISI LEVEL 2
    this.add.text(640, 100, "MISI: Dorong kotak kayu ke atas panggung abu-abu!\nPilih jalur yang paling mudah dilewati.", { 
        fontSize: '24px', fill: '#ffffff', align: 'center' 
    }).setOrigin(0.5);
}
function update() {
    // Kosong untuk saat ini
}
