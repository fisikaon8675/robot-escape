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
    // 1. LANTAI DASAR (Tempat memikirkan pilihan)
    const lantai = this.add.rectangle(640, 700, 1280, 50, 0x4a4a4a);
    this.matter.add.gameObject(lantai, { isStatic: true, friction: 0.1 });

    // 2. DESAIN TANJAKAN KARET (KIRI) - KASAR & GELAP
    const tanjakanKaret = this.add.rectangle(300, 550, 600, 25, 0x3a2f2f);
    this.matter.add.gameObject(tanjakanKaret, { 
        isStatic: true, 
        angle: 0.5,    
        friction: 1,        // <-- UBAH KE 1 (Batas maksimal kasar di Matter.js)
        frictionStatic: 10  // Ini boleh tinggi agar butuh tenaga ekstra untuk mulai bergerak
    });
    // UI Label Karet
    this.add.text(300, 620, "⚠️ JALUR KARET\nSangat Kasar!", { 
        fontSize: '22px', fill: '#ff6666', align: 'center', fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 3. DESAIN TANJAKAN ES (KANAN) - LICIN & CERAH
    // Posisi X di 980, miring ke kanan atas
    const tanjakanEs = this.add.rectangle(980, 550, 600, 25, 0xaaddff);
    this.matter.add.gameObject(tanjakanEs, { 
        isStatic: true, 
        angle: -0.5,   
        friction: 0.0008, // Sangat licin (hampir nol)
        frictionStatic: 0.001
    });
    // UI Label Es
    this.add.text(980, 620, "❄️ JALUR ES\nSangat Licin!", { 
        fontSize: '22px', fill: '#66ccff', align: 'center', fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 4. MEMBUAT DUA ZONA FINISH (Kiri dan Kanan)
    // Zona Kiri (Bagi yang nekat lewat Karet)
    this.add.rectangle(100, 350, 150, 150, 0xff0000, 0.3); // Zona Merah
    // Zona Kanan (Jalur Cerdas lewat Es)
    this.add.rectangle(1180, 350, 150, 150, 0x00ff00, 0.3); // Zona Hijau

   // 5. KAYU
    const kayuVisual = this.add.image(700, 600, 'kayu-sprite').setDisplaySize(50, 50);
    kayu = this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 1,        // <-- SAMAKAN JADI 1
        frictionStatic: 10
    });  // <-- TAMBAHKAN INI! (Agar kayu murni meluncur, bukan terguling)
    
    // 6. MERAKIT KERANGKA GABUNGAN ROBOT
  const M = Phaser.Physics.Matter.Matter;

// 1. BADAN ROBOT (Massa disesuaikan)
const badan = M.Bodies.rectangle(580, 600, 50, 35, { 
    mass: 5,
    collisionFilter: { group: -1 }
}); 

// Turunkan Pusat Massa (Center of Mass) ke arah bawah sasis
M.Body.setCentre(badan, { x: 0, y: 12 }, true);

// 2. RODA (Lebih berat dari badan sebagai pemberat bawah & sumbu lebih lebar)
const rodaKiri = M.Bodies.circle(560, 615, 8, { 
    friction: 0.8, 
    mass: 8,
    collisionFilter: { group: -1 }
});
const rodaKanan = M.Bodies.circle(600, 615, 8, { 
    friction: 0.8, 
    mass: 8,
    collisionFilter: { group: -1 }
});

// 3. ENGSEL (Stiffness diturunkan sedikit ke 0.9 agar elastis)
const engselKiri = M.Constraint.create({
    bodyA: badan,
    pointA: { x: -20, y: 15 },
    bodyB: rodaKiri,
    pointB: { x: 0, y: 0 },
    stiffness: 0.9,
    length: 0
});

const engselKanan = M.Constraint.create({
    bodyA: badan,
    pointA: { x: 20, y: 15 },
    bodyB: rodaKanan,
    pointB: { x: 0, y: 0 },
    stiffness: 0.9,
    length: 0
});

this.matter.world.add([badan, rodaKiri, rodaKanan, engselKiri, engselKanan]);

// Simpan referensi ke variabel scene
this.badanRobot = badan;

// 4. SPRITE VISUAL TERPISAH (Bebas di-flip tanpa merusak sistem fisika)
this.robotVisual = this.add.image(580, 600, 'robot-sprite').setScale(0.32);
this.robotVisual.setOrigin(0.5, 0.55);


    // 8. TEKS MISI (Header UI)
    const panelHeader = this.add.rectangle(640, 50, 800, 80, 0x000000, 0.7);
    this.add.text(640, 50, "MISI: Dorong kotak ke salah satu zona kotak di atas!\nUji kemampuan gesekan (friction) benda.", { 
        fontSize: '24px', fill: '#ffffff', align: 'center' 
    }).setOrigin(0.5);

    // --- KONTROL (Biarkan kode kontrol tombol HP dan Keyboard Anda di bawah sini) ---
    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2);

    const btnLeft = this.add.rectangle(100, 640, 80, 80, 0xffffff, 0.5).setInteractive(); // Y digeser sedikit ke bawah agar tidak menutupi teks
    this.add.text(100, 640, '<', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnLeft.on('pointerdown', () => isLeftDown = true).on('pointerup', () => isLeftDown = false).on('pointerout', () => isLeftDown = false);

    const btnRight = this.add.rectangle(200, 640, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(200, 640, '>', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnRight.on('pointerdown', () => isRightDown = true).on('pointerup', () => isRightDown = false).on('pointerout', () => isRightDown = false);

    const btnJump = this.add.rectangle(1180, 640, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(1180, 640, '^', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnJump.on('pointerdown', () => isJumpDown = true).on('pointerup', () => isJumpDown = false).on('pointerout', () => isJumpDown = false);

    // 9. TOMBOL RESET POSISI (Pojok Kanan Atas)
    const tombolReset = this.add.text(1150, 50, '🔄 RESET', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#ff3333', // Latar belakang merah
        padding: { x: 15, y: 8 },
        fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    // Logika saat tombol reset diklik
    tombolReset.on('pointerdown', () => {
        // Kembalikan Robot ke posisi awal (X: 580, Y: 600)
        robot.setPosition(580, 600);
        robot.setVelocity(0, 0); // Matikan kecepatan jatuhnya (momentum 0)

        // Kembalikan Kotak Kayu ke posisi awal (X: 700, Y: 600)
        kayu.setPosition(700, 600);
        kayu.setVelocity(0, 0);  // Matikan kecepatan bergeraknya
        kayu.setAngularVelocity(0); // Hentikan putaran kayunya jika sedang terguling
    });
}
function update() {
    const gayaDorong = 0.008;

// Sinkronkan posisi dan rotasi gambar visual dengan badan fisika
this.robotVisual.setPosition(this.badanRobot.position.x, this.badanRobot.position.y);
this.robotVisual.setRotation(this.badanRobot.angle);

// Gerak Kiri
if (cursors.left.isDown || isLeftDown) {
    Phaser.Physics.Matter.Matter.Body.applyForce(this.badanRobot, this.badanRobot.position, { x: -gayaDorong, y: 0 });
    this.robotVisual.setFlipX(true); // Membalik gambar tanpa mengubah skala fisika
}
// Gerak Kanan
else if (cursors.right.isDown || isRightDown) {
    Phaser.Physics.Matter.Matter.Body.applyForce(this.badanRobot, this.badanRobot.position, { x: gayaDorong, y: 0 });
    this.robotVisual.setFlipX(false);
}

// Melompat (Cek kecepatan vertikal badan)
if ((cursors.up.isDown || isJumpDown) && Math.abs(this.badanRobot.velocity.y) < 0.5) {
    Phaser.Physics.Matter.Matter.Body.setVelocity(this.badanRobot, { x: this.badanRobot.velocity.x, y: -10 });
    isJumpDown = false;
}
}
