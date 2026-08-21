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
        friction: 5,         // Gesekan saat bergerak dinaikkan jadi 5!
        frictionStatic: 10   // Gesekan awal (sangat sulit digerakkan dari posisi diam)
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
        friction: 0.005 // Sangat licin (hampir nol)
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

    // 5. PENEMPATAN ROBOT & KOTAK DI TENGAH (UX TERBAIK)
    // Kotak kayu agak ke kanan agar robot bisa mengambil posisi mendorong dari sisi mana pun
    const kayuVisual = this.add.image(700, 600, 'kayu-sprite').setDisplaySize(50, 50);
    kayu = this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 5,         // Samakan dengan karet
        frictionStatic: 10
    });
    
    // 6. MERAKIT KERANGKA GABUNGAN (COMPOUND BODY) ---
   // --- 1. MERAKIT KERANGKA GABUNGAN SESUAI SKETSA ---
    const M = Phaser.Physics.Matter.Matter;

    // Kotak atas: lebar 48, tinggi 35. 
    // Y di-set ke -5 agar pusat gravitasinya (titik hijau) agak turun ke bawah perut.
    const badan = M.Bodies.rectangle(0, -5, 48, 35); 

    // Roda kiri & kanan: jari-jari 8 (agar tidak terlalu besar).
    // Y di-set ke 15 agar posisinya pas di bawah kotak.
    const rodaKiri = M.Bodies.circle(-15, 15, 8);
    const rodaKanan = M.Bodies.circle(15, 15, 8);

    const robotCompoundBody = M.Body.create({
        parts: [badan, rodaKiri, rodaKanan],
        mass: 1,
        friction: 0.05
    });

    // --- 2. MEMASANG GAMBAR KE KERANGKA ---
    robot = this.matter.add.sprite(580, 600, 'robot-sprite');
    
    // Pasang kerangka fisika ke sprite
    robot.setExistingBody(robotCompoundBody);

    // --- 3. TRIK MENYELARASKAN VISUAL (PENTING!) ---
    // JANGAN PAKAI setDisplaySize() KARENA AKAN MERUSAK FISIKA BENTUK RODA!
    
    // Jika gambar asli Abang kebesaran/kekecilan dibanding garis hijaunya, gunakan setScale:
    // Contoh: 1 (ukuran asli), 0.5 (setengah lebih kecil), 1.2 (lebih besar sedikit)
    robot.setScale(1); 

    // Trik menggeser gambar agar pas dengan kerangka hijau:
    // Jika posisi gambar masih "melenceng" (kurang naik/turun) dari garis hijau, 
    // ubah angka Y (0.55) di bawah ini perlahan (misal ke 0.5, 0.6, atau 0.65) sampai gambarnya pas membungkus kerangka!
    robot.setOrigin(0.5, 0.55);

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
