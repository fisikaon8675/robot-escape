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
    backgroundColor: '#2F4F4F',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: true // Debug masih nyala untuk melihat kerangka
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
}

function create() {
    // 1. LANTAI DASAR
    const lantai = this.add.rectangle(640, 700, 1280, 50, 0x4a4a4a);
    this.matter.add.gameObject(lantai, { isStatic: true, friction: 0.1 });

    // 2. TANJAKAN KARET (KIRI) - KASAR
    const tanjakanKaret = this.add.rectangle(300, 550, 600, 25, 0x3a2f2f);
    this.matter.add.gameObject(tanjakanKaret, { 
        isStatic: true, 
        angle: 0.5,    
        friction: 1,       
        frictionStatic: 10 
    });
    this.add.text(300, 620, "⚠️ JALUR KARET\nSangat Kasar!", { 
        fontSize: '22px', fill: '#ff6666', align: 'center', fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 3. TANJAKAN ES (KANAN) - LICIN
    const tanjakanEs = this.add.rectangle(980, 550, 600, 25, 0xaaddff);
    this.matter.add.gameObject(tanjakanEs, { 
        isStatic: true, 
        angle: -0.5,   
        friction: 0.0008, 
        frictionStatic: 0.1
    });
    this.add.text(980, 620, "❄️ JALUR ES\nSangat Licin!", { 
        fontSize: '22px', fill: '#66ccff', align: 'center', fontStyle: 'bold' 
    }).setOrigin(0.5);

    // 4. ZONA FINISH
    this.add.rectangle(100, 350, 150, 150, 0xff0000, 0.3); // Kiri (Merah)
    this.add.rectangle(1180, 350, 150, 150, 0x00ff00, 0.3); // Kanan (Hijau)

    // 5. KAYU (Sudah dikunci rotasinya agar tidak jumpalitan)
    const kayuVisual = this.add.image(700, 600, 'kayu-sprite').setDisplaySize(50, 50);
    kayu = this.matter.add.gameObject(kayuVisual, {
        shape: { type: 'rectangle', width: 50, height: 50 },
        mass: 0.5,
        friction: 1,        
        frictionStatic: 10
    }); 
    
    // 6. MERAKIT ROBOT MOBIL
    const M = Phaser.Physics.Matter.Matter;

    const badan = M.Bodies.rectangle(580, 600, 50, 35, { 
        mass: 5, 
        frictionAir: 0.02, 
        collisionFilter: { group: -1 }
    }); 

    const rodaKiri = M.Bodies.circle(560, 615, 8, { 
         friction: 0.9, mass: 6, collisionFilter: { group: -1 }
    });

    const rodaKanan = M.Bodies.circle(600, 615, 8, { 
        friction: 0.9, mass: 6, collisionFilter: { group: -1 }
    });

    const engselKiri = M.Constraint.create({
        bodyA: badan, pointA: { x: -20, y: 15 },
        bodyB: rodaKiri, pointB: { x: 0, y: 0 },
        stiffness: 0.8, length: 0
    });

    const engselKanan = M.Constraint.create({
        bodyA: badan, pointA: { x: 20, y: 15 },
        bodyB: rodaKanan, pointB: { x: 0, y: 0 },
        stiffness: 0.8, length: 0
    });

    this.matter.world.add([badan, rodaKiri, rodaKanan, engselKiri, engselKanan]);

    this.badanRobot = badan;
    this.rodaKiri = rodaKiri;
    this.rodaKanan = rodaKanan;

    this.robotVisual = this.add.image(580, 600, 'robot-sprite').setScale(0.32);
    this.robotVisual.setOrigin(0.5, 0.55);

    // 7. TEKS MISI 
    this.add.rectangle(640, 50, 800, 80, 0x000000, 0.7);
    this.add.text(640, 50, "MISI: Dorong kotak ke salah satu zona kotak di atas!\nUji kemampuan gesekan (friction) benda.", { 
        fontSize: '24px', fill: '#ffffff', align: 'center' 
    }).setOrigin(0.5);

    // 8. KONTROL UI
    cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(2);

    const btnLeft = this.add.rectangle(100, 640, 80, 80, 0xffffff, 0.5).setInteractive(); 
    this.add.text(100, 640, '<', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnLeft.on('pointerdown', () => isLeftDown = true).on('pointerup', () => isLeftDown = false).on('pointerout', () => isLeftDown = false);

    const btnRight = this.add.rectangle(200, 640, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(200, 640, '>', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnRight.on('pointerdown', () => isRightDown = true).on('pointerup', () => isRightDown = false).on('pointerout', () => isRightDown = false);

    const btnJump = this.add.rectangle(1180, 640, 80, 80, 0xffffff, 0.5).setInteractive();
    this.add.text(1180, 640, '^', { fontSize: '50px', fill: '#000000', fontStyle: 'bold' }).setOrigin(0.5);
    btnJump.on('pointerdown', () => isJumpDown = true).on('pointerup', () => isJumpDown = false).on('pointerout', () => isJumpDown = false);

    // 9. TOMBOL RESET (HANYA ADA SATU SEKARANG)
    const tombolReset = this.add.text(1150, 50, '🔄 RESET', {
        fontSize: '24px', fill: '#ffffff', backgroundColor: '#ff3333', 
        padding: { x: 15, y: 8 }, fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();

    tombolReset.on('pointerdown', () => {
        // Reset Robot (Badan & Roda)
        M.Body.setPosition(this.badanRobot, { x: 580, y: 600 });
        M.Body.setVelocity(this.badanRobot, { x: 0, y: 0 });
        M.Body.setAngle(this.badanRobot, 0);
        M.Body.setAngularVelocity(this.badanRobot, 0);

        M.Body.setPosition(this.rodaKiri, { x: 560, y: 615 });
        M.Body.setVelocity(this.rodaKiri, { x: 0, y: 0 });
        M.Body.setAngularVelocity(this.rodaKiri, 0);

        M.Body.setPosition(this.rodaKanan, { x: 600, y: 615 });
        M.Body.setVelocity(this.rodaKanan, { x: 0, y: 0 });
        M.Body.setAngularVelocity(this.rodaKanan, 0);

        // Reset Kayu
        kayu.setPosition(700, 600); 
        kayu.setVelocity(0, 0); 
        kayu.setAngularVelocity(0); 
    });

} // <--- INI DIA! Kurung kurawal penutup fungsi create() yang tadi hilang!

function update() {
    // PERBAIKAN: Kecepatan roda dinaikkan agar tidak ngeden
        const kecRoda = 0.35; 
        const M = Phaser.Physics.Matter.Matter;

        // Sinkronkan visual dengan body fisika
        this.robotVisual.setPosition(this.badanRobot.position.x, this.badanRobot.position.y);
        this.robotVisual.setRotation(this.badanRobot.angle);
        
        this.rodaKiriVisual.setPosition(this.rodaKiri.position.x, this.rodaKiri.position.y);
        this.rodaKananVisual.setPosition(this.rodaKanan.position.x, this.rodaKanan.position.y);

        // KONTROL PERGERAKAN & REM
        if (cursors.left.isDown || isLeftDown) {
            M.Body.setAngularVelocity(this.rodaKiri, -kecRoda);
            M.Body.setAngularVelocity(this.rodaKanan, -kecRoda);
            this.robotVisual.setFlipX(true);
        }
        else if (cursors.right.isDown || isRightDown) {
            M.Body.setAngularVelocity(this.rodaKiri, kecRoda);
            M.Body.setAngularVelocity(this.rodaKanan, kecRoda);
            this.robotVisual.setFlipX(false);
        }
        else {
            // Rem lebih natural: Meredam putaran, bukan memaksa 0 seketika yang merusak physics constraint
            M.Body.setAngularVelocity(this.rodaKiri, this.rodaKiri.angularVelocity * 0.5);
            M.Body.setAngularVelocity(this.rodaKanan, this.rodaKanan.angularVelocity * 0.5);
        }

        // PERBAIKAN STABILITAS: "Righting Moment" (Penyeimbang otomatis)
        // Mencegah robot terbalik saat menanjak curam dengan mengoreksi rotasi bodinya pelan-pelan
        if (Math.abs(this.badanRobot.angle) > 0.1) {
            // Memberikan torsi perlawanan jika mobil miring
            M.Body.setAngularVelocity(this.badanRobot, this.badanRobot.angularVelocity - (this.badanRobot.angle * 0.1));
        }

        // Lompat 
        if ((cursors.up.isDown || isJumpDown) && Math.abs(this.badanRobot.velocity.y) < 0.5) {
            // Berikan gaya dorong ke atas pada badan
            M.Body.setVelocity(this.badanRobot, { x: this.badanRobot.velocity.x, y: -12 });
            isJumpDown = false;
        }
}
