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
    // Posisi X di 300, miring ke kiri atas
    const tanjakanKaret = this.add.rectangle(300, 550, 600, 25, 0x3a2f2f);
    this.matter.add.gameObject(tanjakanKaret, { 
        isStatic: true, 
        angle: 0.5,    
        friction: 20,         // Gesekan saat bergerak dinaikkan jadi 5!
        frictionStatic: 30   // Gesekan awal (sangat sulit digerakkan dari posisi diam)
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

    // 5.KAYU
    // Kotak kayu agak ke kanan agar robot bisa mengambil posisi mendorong dari sisi mana pun
    const kayuVisual = this.add.image(700, 600, 'kayu-sprite').setDisplaySize(50, 50);
    kayu = this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 20,         // Samakan dengan karet
        frictionStatic: 30
    });
    
    // 6. MERAKIT KERANGKA GABUNGAN ROBOT
  // --- 1. BUAT POTONGAN TERPISAH (TIDAK DILAS) ---
    const M = Phaser.Physics.Matter.Matter;

    // Buat badan di posisi X: 580, Y: 600
    const badan = M.Bodies.rectangle(580, 600, 48, 35, { 
        mass: 1 
    }); 
    
    // Buat roda terpisah (Friction dinaikkan agar rodanya menggigit jalan)
    const rodaKiri = M.Bodies.circle(565, 615, 8, { friction: 0.8, mass: 0.1 });
    const rodaKanan = M.Bodies.circle(595, 615, 8, { friction: 0.8, mass: 0.1 });

    // --- 2. PASANG AS RODA (ENGSEL / CONSTRAINT) ---
    const engselKiri = M.Constraint.create({
        bodyA: badan,
        pointA: { x: -15, y: 15 }, // Dibor di kiri bawah badan
        bodyB: rodaKiri,
        pointB: { x: 0, y: 0 },    // Ditempel ke pusat roda kiri
        stiffness: 1,              // Engsel kaku (tidak melar)
        length: 0                  // Jarak tempel rapat
    });

    const engselKanan = M.Constraint.create({
        bodyA: badan,
        pointA: { x: 15, y: 15 },  // Dibor di kanan bawah badan
        bodyB: rodaKanan,
        pointB: { x: 0, y: 0 },    // Ditempel ke pusat roda kanan
        stiffness: 1,
        length: 0
    });

    // Masukkan semua mesin ini ke dalam dunia game
    this.matter.world.add([badan, rodaKiri, rodaKanan, engselKiri, engselKanan]);

    // --- 3. PASANG GAMBAR HANYA KE BADAN ---
    const robotVisual = this.add.image(580, 600, 'robot-sprite');
    robotVisual.setScale(0.32); 

    // Ubah gambar menjadi objek Matter dan tempelkan HANYA ke 'badan'
    robot = this.matter.add.gameObject(robotVisual);
    robot.setExistingBody(badan);
    robot.setOrigin(0.5, 0.55);

    // KUNCI ROTASI BADAN (Rodanya tetap akan berputar bebas di bawahnya!)
    robot.setFixedRotation();

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
    const gayaDorong = 0.005; // Kekuatan dorongan robot

    // Bergerak ke Kiri
    if (cursors.left.isDown || isLeftDown) {
        robot.applyForce({ x: -gayaDorong, y: 0 });
        robot.setFlipX(true); // <--- Membalik gambar seperti cermin menghadap kiri
    }
    // Bergerak ke Kanan
    else if (cursors.right.isDown || isRightDown) {
        robot.applyForce({ x: gayaDorong, y: 0 });
        robot.setFlipX(false); // <--- Membalik gambar ke kanan
    }

    // Melompat (hanya bisa jika robot sedang menyentuh tanah/kecepatan Y mendekati 0)
    if ((cursors.up.isDown || isJumpDown) && Math.abs(robot.body.velocity.y) < 0.5) {
        robot.setVelocityY(-10);
        isJumpDown = false; // Mencegah lompat terus-menerus
    }
}
