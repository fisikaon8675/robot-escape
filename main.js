let robot;
let cursors; // Menangkap input keyboard
let kayu;         // Untuk melacak posisi kayu
let besi;         // Untuk melacak posisi besi
let misiSelesai = false; // Mencegah kode kemenangan berjalan berkali-kali

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
            debug: false
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
    robotVisual = this.add.image(200, 100, 'robot-sprite').setDisplaySize(60, 50);
    robot = this.matter.add.gameObject(robotVisual, {
        shape: { type: 'rectangle', width: 60, height: 50 },
        mass: 1,
        restitution: 0.4,
        friction: 0.05,
        label: 'robot'
        }).setFixedRotation();
    });
    // 3. MENAMBAHKAN RINTANGAN (Eksperimen Massa)

    // Balok Kayu (Ringan)
    // Posisi X: 500, Y: 600, Ukuran: 60x60, Warna: Coklat (0x8B4513)
    kayuVisual = this.add.image(500, 600, 'kayu-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 0.5,       // Setengah dari massa robot (Sangat ringan)
        friction: 0.05,  // Licin
        restitution: 0.2
    });

    // Balok Besi (Berat)
    // Posisi X: 800, Y: 600, Ukuran: 60x60, Warna: Abu-abu (0x808080)
    besiVisual = this.add.image(800, 600, 'besi-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(besiVisual, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 20,        // 20x lipat massa robot (Sangat berat!)
        friction: 0.6,   // Kasar (sulit digeser)
        restitution: 0.05
    });
    
    console.log("Lantai dan Robot berhasil dibuat!");
    // (Tambahkan di baris paling bawah fungsi create)

    // 4. MENAMBAHKAN TEKS MISI (UI)
    const isiMisi = "MISI PELARIAN LABORATORIUM\n\nAnda adalah robot uji coba! Gunakan tombol panah untuk memberikan GAYA dorong (F).\n\nIngat Hukum Newton II (F = m.a):\n- Kotak kayu massanya ringan, mudah digeser.\n- Kotak besi massanya besar dan gesekannya tinggi, butuh momentum ekstra!\n\nDorong rintangan dan temukan jalan keluar!";

    const teksMisi = this.add.text(640, 200, isiMisi, {
        fontSize: '24px', // Ukuran font diperkecil sedikit agar pas
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
        align: 'center', // Membuat teks rata tengah
        wordWrap: { width: 800 } // Memaksa teks turun ke baris baru jika lebarnya melebihi 800 piksel
    }).setOrigin(0.5);

    // Animasi memudarkan teks (Fade Out)
    this.tweens.add({
        targets: teksMisi,
        alpha: 0,        
        duration: 2000,  
        delay: 8000,     // DIUBAH: Menunggu 8 detik agar pemain punya waktu untuk membaca semuanya
        onComplete: () => { 
            teksMisi.destroy(); 
        }
    });
    // 5. MEMBUAT ZONA FINISH
    // Posisi X: 1200 (ujung kanan layar), Y: 600, Lebar: 100, Tinggi: 200, Warna: Hijau Transparan
    const finishZone = this.add.rectangle(1200, 600, 100, 200, 0x00ff00, 0.3);

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
    // DETEKSI KEMENANGAN
    // Memeriksa apakah kayu DAN besi sudah melewati sumbu X 1150 (masuk zona hijau)
    if (!misiSelesai && kayu.x > 1150 && besi.x > 1150) {
        misiSelesai = true; // Kunci agar kode ini hanya berjalan satu kali
        console.log("Berhasil! Kedua kotak telah mencapai garis finish!");
        
        // (Nanti di tahap selanjutnya, kita memanggil layar penjelasan Newton di sini)
        robot.setTint(0x00ff00); // Mengubah warna robot jadi hijau sementara sebagai tanda menang
    }
}
