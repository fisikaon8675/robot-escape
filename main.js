let robot;
let cursors; // Menangkap input keyboard
let kayu;         // Untuk melacak posisi kayu
let besi;         // Untuk melacak posisi besi
let misiSelesai = false; // Mencegah kode kemenangan berjalan berkali-kali
// Variabel untuk kontrol HP
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
    
    // 3. MENAMBAHKAN RINTANGAN (Eksperimen Massa)

    // Balok Kayu (Ringan)
    // Posisi X: 500, Y: 600, Ukuran: 60x60, Warna: Coklat (0x8B4513)
    kayu = this.add.image(500, 600, 'kayu-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(kayu, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 0.5,
        friction: 0.05,
        restitution: 0.2
    });

    // Balok Besi (Berat)
    // Posisi X: 800, Y: 600, Ukuran: 60x60, Warna: Abu-abu (0x808080)
    besi = this.add.image(800, 600, 'besi-sprite').setDisplaySize(60, 60);
    this.matter.add.gameObject(besi, {
        shape: { type: 'rectangle', width: 60, height: 60 },
        mass: 20,
        friction: 0.6,
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
    if (!misiSelesai && kayu.x > 1150 && besi.x > 1150) {
        misiSelesai = true; 
        
        // 1. Menghentikan simulasi fisika (waktu berhenti)
        this.matter.world.pause(); 
        
        // 2. Membuat latar belakang gelap transparan (Dimmer) menutupi seluruh layar
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);
        
        // 3. Menulis Teks Penjelasan Hukum Newton
        const materiNewton = "MISI SELESAI!\n\nMari evaluasi eksperimen kita:\n\n1. HUKUM NEWTON I (Kelembaman): Benda diam cenderung tetap diam. Besi sangat sulit digeser di awal karena massanya besar (inersianya tinggi).\n\n2. HUKUM NEWTON II (F = m.a): Dengan gaya dorong (F) yang sama dari robot, kayu yang ringan (m kecil) melesat lebih cepat (a besar) dibandingkan besi (m besar).\n\n3. HUKUM NEWTON III (Aksi-Reaksi): Saat robot mendorong kotak (aksi), kotak sebenarnya menahan/mendorong balik robot (reaksi) dengan gaya yang sama besar. Itu sebabnya robot Anda melambat saat menabrak balok berat!\n\nApakah Anda siap menguji pengetahuan ini?";
        
        this.add.text(640, 300, materiNewton, {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'left',
            wordWrap: { width: 900 }, // Agar teks tidak keluar layar
            lineSpacing: 10
        }).setOrigin(0.5);

        // 4. Membuat Tombol Interaktif "Lanjut ke Kuis"
        const tombolKuis = this.add.text(640, 550, '[ MULA KUIS ]', {
            fontSize: '32px',
            fill: '#ffff00', // Warna kuning
            fontStyle: 'bold',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive(); // setInteractive() membuat teks bisa diklik layaknya tombol HTML

        // 5. Logika saat tombol diklik (Akan dikerjakan di Tahap C)
        tombolKuis.on('pointerdown', () => {
            tombolKuis.setText("Memuat kuis...");
            // Nanti kode kuis kita masukkan ke sini
        });
    }
}
