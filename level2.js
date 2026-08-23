let kayu;

let cursors;

let isLeftDown = false;
let isRightDown = false;
let isJumpDown = false;

let jumpCooldown = 0;


// =====================================================
// KONFIGURASI GAME
// =====================================================

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

            gravity: {
                y: 1
            },

            // false agar tampilan game bersih
            debug: false
        }
    },

    scene: {

        preload: preload,

        create: create,

        update: update
    }
};


// =====================================================
// START GAME
// =====================================================

const game = new Phaser.Game(config);


// =====================================================
// PRELOAD
// =====================================================

function preload() {

    this.load.image(
        'robot-sprite',
        'assets/robot.png'
    );

    this.load.image(
        'kayu-sprite',
        'assets/kayu.png'
    );
}


// =====================================================
// CREATE
// =====================================================

function create() {

    const M = Phaser.Physics.Matter.Matter;


    // =================================================
    // 1. LANTAI DASAR
    // =================================================

    const lantai = this.add.rectangle(
        640,
        700,
        1280,
        50,
        0x4a4a4a
    );

    this.matter.add.gameObject(
        lantai,
        {
            isStatic: true,

            friction: 0.8,

            frictionStatic: 1
        }
    );


    // =================================================
    // 2. TANJAKAN KARET
    // =================================================

    const tanjakanKaret = this.add.rectangle(
        300,
        550,
        600,
        25,
        0x3a2f2f
    );

    this.matter.add.gameObject(
        tanjakanKaret,
        {

            isStatic: true,

            angle: 0.5,

            // Karet kasar
            friction: 1,

            frictionStatic: 1
        }
    );


    this.add.text(
        300,
        620,

        "⚠️ JALUR KARET\nSangat Kasar!",

        {
            fontSize: '22px',

            fill: '#ff6666',

            align: 'center',

            fontStyle: 'bold'
        }

    ).setOrigin(0.5);


    // =================================================
    // 3. TANJAKAN ES
    // =================================================

    const tanjakanEs = this.add.rectangle(
        980,
        550,
        600,
        25,
        0xaaddff
    );

    this.matter.add.gameObject(
        tanjakanEs,
        {

            isStatic: true,

            angle: -0.5,

            // Es sangat licin
            friction: 0.001,

            frictionStatic: 0.02
        }
    );


    this.add.text(
        980,
        620,

        "❄️ JALUR ES\nSangat Licin!",

        {
            fontSize: '22px',

            fill: '#66ccff',

            align: 'center',

            fontStyle: 'bold'
        }

    ).setOrigin(0.5);


    // =================================================
    // 4. ZONA FINISH
    // =================================================

    this.zonaKiri = this.add.rectangle(
        100,
        350,
        150,
        150,
        0xff0000,
        0.3
    );


    this.zonaKanan = this.add.rectangle(
        1180,
        350,
        150,
        150,
        0x00ff00,
        0.3
    );


    // =================================================
    // 5. KAYU / KOTAK
    // =================================================

    const kayuVisual = this.add.image(
        700,
        600,
        'kayu-sprite'
    );

    kayuVisual.setDisplaySize(
        50,
        50
    );


    kayu = this.matter.add.gameObject(

        kayuVisual,

        {

            shape: {

                type: 'rectangle',

                width: 50,

                height: 50
            },

            mass: 0.5,

            friction: 0.8,

            frictionStatic: 1,

            frictionAir: 0.01,

            restitution: 0
        }
    );


    // Kotak tidak boleh berputar
    // supaya mudah didorong robot.

    M.Body.setInertia(
        kayu.body,
        Infinity
    );


    // =================================================
    // 6. MEMBUAT ROBOT
    // =================================================

    const robotGroup = -1;


    // -------------------------------------------------
    // BADAN ROBOT
    // -------------------------------------------------

    const badan = M.Bodies.rectangle(

        580,
        580,

        56,
        34,

        {

            mass: 5,

            friction: 0.2,

            frictionAir: 0.08,

            restitution: 0,

            collisionFilter: {

                group: robotGroup
            }
        }
    );


    // -------------------------------------------------
    // RODA KIRI
    // -------------------------------------------------

    const rodaKiri = M.Bodies.circle(

        560,
        615,

        10,

        {

            mass: 1.5,

            friction: 1,

            frictionStatic: 1,

            frictionAir: 0.03,

            restitution: 0,

            collisionFilter: {

                group: robotGroup
            }
        }
    );


    // -------------------------------------------------
    // RODA KANAN
    // -------------------------------------------------

    const rodaKanan = M.Bodies.circle(

        600,
        615,

        10,

        {

            mass: 1.5,

            friction: 1,

            frictionStatic: 1,

            frictionAir: 0.03,

            restitution: 0,

            collisionFilter: {

                group: robotGroup
            }
        }
    );


    // =================================================
    // 7. CONSTRAINT RODA KIRI
    // =================================================

    const engselKiri = M.Constraint.create({

        bodyA: badan,

        pointA: {
            x: -20,
            y: 16
        },

        bodyB: rodaKiri,

        pointB: {
            x: 0,
            y: 0
        },

        stiffness: 1,

        damping: 0.35,

        length: 0
    });


    // =================================================
    // 8. CONSTRAINT RODA KANAN
    // =================================================

    const engselKanan = M.Constraint.create({

        bodyA: badan,

        pointA: {
            x: 20,
            y: 16
        },

        bodyB: rodaKanan,

        pointB: {
            x: 0,
            y: 0
        },

        stiffness: 1,

        damping: 0.35,

        length: 0
    });


    // =================================================
    // 9. MASUKKAN ROBOT KE MATTER WORLD
    // =================================================

    this.matter.world.add([

        badan,

        rodaKiri,

        rodaKanan,

        engselKiri,

        engselKanan

    ]);


    // =================================================
    // 10. KUNCI ROTASI BADAN ROBOT
    // =================================================

    M.Body.setInertia(
        badan,
        Infinity
    );

    M.Body.setAngle(
        badan,
        0
    );

    M.Body.setAngularVelocity(
        badan,
        0
    );


    // Simpan body robot

    this.badanRobot = badan;

    this.rodaKiri = rodaKiri;

    this.rodaKanan = rodaKanan;


    // =================================================
    // 11. VISUAL ROBOT
    // =================================================

    this.robotVisual = this.add.image(

        580,

        580,

        'robot-sprite'
    );


    this.robotVisual

        .setScale(0.32)

        .setOrigin(
            0.5,
            0.55
        );


    // =================================================
    // 12. VISUAL RODA
    // =================================================

    // INI PERBAIKAN PENTING.
    // Pada kode lama objek ini belum dibuat.

    this.rodaKiriVisual = this.add.circle(

        560,

        615,

        10,

        0x222222
    );


    this.rodaKananVisual = this.add.circle(

        600,

        615,

        10,

        0x222222
    );


    // =================================================
    // 13. JUDUL MISI
    // =================================================

    this.add.rectangle(

        640,

        50,

        800,

        80,

        0x000000,

        0.7
    );


    this.add.text(

        640,

        50,

        "MISI: Dorong kotak ke salah satu zona kotak di atas!\n" +
        "Uji kemampuan gesekan (friction) benda.",

        {

            fontSize: '24px',

            fill: '#ffffff',

            align: 'center'
        }

    ).setOrigin(0.5);


    // =================================================
    // 14. STATUS GAME
    // =================================================

    this.statusText = this.add.text(

        640,

        150,

        '',

        {

            fontSize: '24px',

            fill: '#ffff66',

            fontStyle: 'bold',

            align: 'center'
        }

    ).setOrigin(0.5);


    // =================================================
    // 15. KEYBOARD
    // =================================================

    cursors =
        this.input.keyboard.createCursorKeys();


    // =================================================
    // 16. TOMBOL KIRI
    // =================================================

    const btnLeft = this.add.rectangle(

        100,

        640,

        80,

        80,

        0xffffff,

        0.5

    ).setInteractive();


    this.add.text(

        100,

        640,

        '<',

        {

            fontSize: '50px',

            fill: '#000000',

            fontStyle: 'bold'

        }

    ).setOrigin(0.5);


    btnLeft

        .on(
            'pointerdown',
            () => {
                isLeftDown = true;
            }
        )

        .on(
            'pointerup',
            () => {
                isLeftDown = false;
            }
        )

        .on(
            'pointerout',
            () => {
                isLeftDown = false;
            }
        )

        .on(
            'pointerupoutside',
            () => {
                isLeftDown = false;
            }
        );


    // =================================================
    // 17. TOMBOL KANAN
    // =================================================

    const btnRight = this.add.rectangle(

        200,

        640,

        80,

        80,

        0xffffff,

        0.5

    ).setInteractive();


    this.add.text(

        200,

        640,

        '>',

        {

            fontSize: '50px',

            fill: '#000000',

            fontStyle: 'bold'

        }

    ).setOrigin(0.5);


    btnRight

        .on(
            'pointerdown',
            () => {
                isRightDown = true;
            }
        )

        .on(
            'pointerup',
            () => {
                isRightDown = false;
            }
        )

        .on(
            'pointerout',
            () => {
                isRightDown = false;
            }
        )

        .on(
            'pointerupoutside',
            () => {
                isRightDown = false;
            }
        );


    // =================================================
    // 18. TOMBOL LOMPAT
    // =================================================

    const btnJump = this.add.rectangle(

        1180,

        640,

        80,

        80,

        0xffffff,

        0.5

    ).setInteractive();


    this.add.text(

        1180,

        640,

        '^',

        {

            fontSize: '50px',

            fill: '#000000',

            fontStyle: 'bold'

        }

    ).setOrigin(0.5);


    btnJump

        .on(
            'pointerdown',
            () => {
                isJumpDown = true;
            }
        )

        .on(
            'pointerup',
            () => {
                isJumpDown = false;
            }
        )

        .on(
            'pointerout',
            () => {
                isJumpDown = false;
            }
        )

        .on(
            'pointerupoutside',
            () => {
                isJumpDown = false;
            }
        );


    // =================================================
    // 19. TOMBOL RESET
    // =================================================

    const tombolReset = this.add.text(

        1150,

        50,

        '🔄 RESET',

        {

            fontSize: '24px',

            fill: '#ffffff',

            backgroundColor: '#ff3333',

            padding: {

                x: 15,

                y: 8
            },

            fontStyle: 'bold'
        }

    )

        .setOrigin(0.5)

        .setInteractive();


    tombolReset.on(

        'pointerdown',

        () => {

            resetGame(this);

        }
    );


    // =================================================
    // 20. POSISI AWAL
    // =================================================

    this.robotStart = {

        body: {

            x: 580,

            y: 580
        },

        left: {

            x: 560,

            y: 615
        },

        right: {

            x: 600,

            y: 615
        }
    };


    this.kayuStart = {

        x: 700,

        y: 600
    };


    // =================================================
    // 21. RESET AWAL
    // =================================================

    resetGame(this);
}


// =====================================================
// RESET GAME
// =====================================================

function resetGame(scene) {

    const M =
        Phaser.Physics.Matter.Matter;


    // =================================================
    // RESET BADAN
    // =================================================

    M.Body.setPosition(

        scene.badanRobot,

        {

            x: scene.robotStart.body.x,

            y: scene.robotStart.body.y
        }

    );


    M.Body.setVelocity(

        scene.badanRobot,

        {

            x: 0,

            y: 0
        }

    );


    M.Body.setAngle(

        scene.badanRobot,

        0

    );


    M.Body.setAngularVelocity(

        scene.badanRobot,

        0

    );


    // =================================================
    // RESET RODA KIRI
    // =================================================

    M.Body.setPosition(

        scene.rodaKiri,

        {

            x: scene.robotStart.left.x,

            y: scene.robotStart.left.y
        }

    );


    M.Body.setVelocity(

        scene.rodaKiri,

        {

            x: 0,

            y: 0
        }

    );


    M.Body.setAngularVelocity(

        scene.rodaKiri,

        0

    );


    // =================================================
    // RESET RODA KANAN
    // =================================================

    M.Body.setPosition(

        scene.rodaKanan,

        {

            x: scene.robotStart.right.x,

            y: scene.robotStart.right.y
        }

    );


    M.Body.setVelocity(

        scene.rodaKanan,

        {

            x: 0,

            y: 0
        }

    );


    M.Body.setAngularVelocity(

        scene.rodaKanan,

        0

    );


    // =================================================
    // RESET KAYU
    // =================================================

    scene.kayu.setPosition(

        scene.kayuStart.x,

        scene.kayuStart.y

    );


    scene.kayu.setVelocity(

        0,

        0

    );


    scene.kayu.setAngularVelocity(

        0

    );


    // =================================================
    // RESET STATUS
    // =================================================

    jumpCooldown = 0;


    isLeftDown = false;

    isRightDown = false;

    isJumpDown = false;


    if (scene.statusText) {

        scene.statusText.setText('');

    }
}


// =====================================================
// UPDATE
// =====================================================

function update(time, delta) {

    // Jangan update sebelum robot siap.

    if (!this.badanRobot) {

        return;

    }


    const M =
        Phaser.Physics.Matter.Matter;


    // =================================================
    // 1. SINKRONISASI VISUAL ROBOT
    // =================================================

    this.robotVisual.setPosition(

        this.badanRobot.position.x,

        this.badanRobot.position.y

    );


    // Robot tidak ikut miring.

    this.robotVisual.setRotation(0);


    // =================================================
    // 2. SINKRONISASI RODA KIRI
    // =================================================

    this.rodaKiriVisual.setPosition(

        this.rodaKiri.position.x,

        this.rodaKiri.position.y

    );


    // =================================================
    // 3. SINKRONISASI RODA KANAN
    // =================================================

    this.rodaKananVisual.setPosition(

        this.rodaKanan.position.x,

        this.rodaKanan.position.y

    );


    // =================================================
    // 4. KONTROL GERAK
    // =================================================

    const left =

        cursors.left.isDown ||

        isLeftDown;


    const right =

        cursors.right.isDown ||

        isRightDown;


    // Kecepatan putar roda.

    const targetWheelSpeed = 0.32;


    // =================================================
    // GERAK KIRI
    // =================================================

    if (left) {

        M.Body.setAngularVelocity(

            this.rodaKiri,

            -targetWheelSpeed

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            -targetWheelSpeed

        );


        this.robotVisual.setFlipX(true);

    }


    // =================================================
    // GERAK KANAN
    // =================================================

    else if (right) {

        M.Body.setAngularVelocity(

            this.rodaKiri,

            targetWheelSpeed

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            targetWheelSpeed

        );


        this.robotVisual.setFlipX(false);

    }


    // =================================================
    // REM
    // =================================================

    else {

        // Jangan langsung mengubah ke 0.
        // Perlambatan bertahap membuat physics lebih stabil.

        M.Body.setAngularVelocity(

            this.rodaKiri,

            this.rodaKiri.angularVelocity * 0.88

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            this.rodaKanan.angularVelocity * 0.88

        );

    }


    // =================================================
    // 5. STABILISASI CHASSIS
    // =================================================

    // Chassis robot selalu tegak.

    M.Body.setAngle(

        this.badanRobot,

        0

    );


    M.Body.setAngularVelocity(

        this.badanRobot,

        0

    );


    // =================================================
    // 6. SISTEM LOMPAT
    // =================================================

    if (jumpCooldown > 0) {

        jumpCooldown -= delta;

    }


    const inginLompat =

        cursors.up.isDown ||

        isJumpDown;


    // Robot dianggap menyentuh lantai
    // ketika kecepatan vertikal sangat kecil.

    const sedangDiLantai =

        Math.abs(
            this.badanRobot.velocity.y
        ) < 0.25;


    if (

        inginLompat &&

        sedangDiLantai &&

        jumpCooldown <= 0

    ) {

        // Badan robot

        M.Body.setVelocity(

            this.badanRobot,

            {

                x:
                    this.badanRobot.velocity.x,

                y: -9

            }

        );


        // Roda kiri

        M.Body.setVelocity(

            this.rodaKiri,

            {

                x:
                    this.rodaKiri.velocity.x,

                y: -9

            }

        );


        // Roda kanan

        M.Body.setVelocity(

            this.rodaKanan,

            {

                x:
                    this.rodaKanan.velocity.x,

                y: -9

            }

        );


        // Cooldown supaya tombol
        // tidak menyebabkan lompatan berulang.

        jumpCooldown = 450;


        isJumpDown = false;

    }


    // =================================================
    // 7. BATAS KIRI LEVEL
    // =================================================

    if (

        this.badanRobot.position.x < 30

    ) {

        M.Body.setPosition(

            this.badanRobot,

            {

                x: 30,

                y:
                    this.badanRobot.position.y

            }

        );

    }


    // =================================================
    // 8. BATAS KANAN LEVEL
    // =================================================

    if (

        this.badanRobot.position.x > 1250

    ) {

        M.Body.setPosition(

            this.badanRobot,

            {

                x: 1250,

                y:
                    this.badanRobot.position.y

            }

        );

    }


    // =================================================
    // 9. CEK ZONA MERAH
    // =================================================

    const box =
        kayu.body.position;


    if (

        box.x > 25 &&

        box.x < 175 &&

        box.y > 275 &&

        box.y < 425

    ) {

        this.statusText.setText(

            '🎉 BERHASIL! Kotak masuk zona merah.'

        );

    }


    // =================================================
    // 10. CEK ZONA HIJAU
    // =================================================

    else if (

        box.x > 1105 &&

        box.x < 1255 &&

        box.y > 275 &&

        box.y < 425

    ) {

        this.statusText.setText(

            '🎉 BERHASIL! Kotak masuk zona hijau.'

        );

    }


    // =================================================
    // 11. TIDAK ADA FINISH
    // =================================================

    else {

        this.statusText.setText('');

    }

}
