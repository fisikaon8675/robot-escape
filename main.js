let robot; // Variabel global untuk robot

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
    // Kosong untuk saat ini
}

function create() {
    // 1. MEMBUAT LANTAI (GROUND)
    const groundVisual = this.add.rectangle(640, 700, 1280, 50, 0x228B22); 
    this.matter.add.gameObject(groundVisual, { 
        isStatic: true 
    });

    // 2. MEMBUAT ROBOT (Karakter Utama)
    const robotVisual = this.add.rectangle(200, 100, 50, 50, 0xFFD700);
    robot = this.matter.add.gameObject(robotVisual, {
        mass: 1,
        restitution: 0.4,
        friction: 0.05,
        label: 'robot'
    });

    console.log("Lantai dan Robot berhasil dibuat!");
}

function update() {
    // Kosong untuk saat ini
}
