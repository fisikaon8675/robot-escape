let kayu;

let cursors;

let isLeftDown = false;
let isRightDown = false;
let isJumpDown = false;

let jumpCooldown = 0;

// Menyimpan body yang sedang menyentuh permukaan
const groundContacts = new Set();


// =====================================================
// CONFIG
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

            debug: false,

            enableSleeping: false
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
    // LANTAI
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

            frictionStatic: 1,

            restitution: 0
        }
    );


    // =================================================
    // TANJAKAN KARET
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

            friction: 1,

            frictionStatic: 1,

            restitution: 0
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
    // TANJAKAN ES
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

            friction: 0.001,

            frictionStatic: 0.02,

            restitution: 0
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
    // ZONA MERAH
    // =================================================

    this.zonaKiri = this.add.rectangle(
        100,
        350,
        150,
        150,
        0xff0000,
        0.3
    );


    // =================================================
    // ZONA HIJAU
    // =================================================

    this.zonaKanan = this.add.rectangle(
        1180,
        350,
        150,
        150,
        0x00ff00,
        0.3
    );


    // =================================================
    // KOTAK KAYU
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


    // Kayu tidak berputar
    M.Body.setInertia(
        kayu.body,
        Infinity
    );


    // =================================================
    // ROBOT
    // =================================================

    const robotGroup = -1;


    // -------------------------------------------------
    // BADAN ROBOT
    // -------------------------------------------------

    const badan = M.Bodies.rectangle(

        580,

        600,

        56,

        34,

        {

            mass: 5,

            friction: 0.25,

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

        620,

        10,

        {

            mass: 1.5,

            friction: 1,

            frictionStatic: 1,

            frictionAir: 0.04,

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

        620,

        10,

        {

            mass: 1.5,

            friction: 1,

            frictionStatic: 1,

            frictionAir: 0.04,

            restitution: 0,

            collisionFilter: {

                group: robotGroup
            }
        }
    );


    // =================================================
    // CONSTRAINT RODA KIRI
    // =================================================

    const engselKiri = M.Constraint.create({

        bodyA: badan,

        pointA: {

            x: -20,

            y: 20
        },

        bodyB: rodaKiri,

        pointB: {

            x: 0,

            y: 0
        },

        stiffness: 0.9,

        damping: 0.2,

        length: 0
    });


    // =================================================
    // CONSTRAINT RODA KANAN
    // =================================================

    const engselKanan = M.Constraint.create({

        bodyA: badan,

        pointA: {

            x: 20,

            y: 20
        },

        bodyB: rodaKanan,

        pointB: {

            x: 0,

            y: 0
        },

        stiffness: 0.9,

        damping: 0.2,

        length: 0
    });


    // =================================================
    // MASUKKAN ROBOT KE WORLD
    // =================================================

    this.matter.world.add([

        badan,

        rodaKiri,

        rodaKanan,

        engselKiri,

        engselKanan

    ]);


    // =================================================
    // SIMPAN BODY
    // =================================================

    this.badanRobot = badan;

    this.rodaKiri = rodaKiri;

    this.rodaKanan = rodaKanan;


    // =================================================
    // KUNCI ROTASI CHASSIS
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


    // =================================================
    // VISUAL ROBOT
    // =================================================

    this.robotVisual = this.add.image(

        580,

        600,

        'robot-sprite'
    );


    this.robotVisual

        .setScale(0.32)

        .setOrigin(
            0.5,
            0.55
        );


    // =================================================
    // VISUAL RODA
    // =================================================

    this.rodaKiriVisual = this.add.circle(

        560,

        620,

        10,

        0x222222
    );


    this.rodaKananVisual = this.add.circle(

        600,

        620,

        10,

        0x222222
    );


    // =================================================
    // MISI
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
    // STATUS
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
    // KEYBOARD
    // =================================================

    cursors =
        this.input.keyboard.createCursorKeys();


    // =================================================
    // TOUCH - KIRI
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
    // TOUCH - KANAN
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
    // TOUCH - LOMPAT
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
    // RESET
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
    // POSISI AWAL
    // =================================================

    this.robotStart = {

        body: {

            x: 580,

            y: 600
        },

        left: {

            x: 560,

            y: 620
        },

        right: {

            x: 600,

            y: 620
        }
    };


    this.kayuStart = {

        x: 700,

        y: 600
    };


    // =================================================
    // DETEKSI KONTAK DENGAN PERMUKAAN
    // =================================================

    this.matter.world.on(

        'collisionstart',

        function(event) {

            event.pairs.forEach(

                function(pair) {

                    const bodyA = pair.bodyA;

                    const bodyB = pair.bodyB;


                    const robotBodies = [

                        badan.id,

                        rodaKiri.id,

                        rodaKanan.id

                    ];


                    if (

                        robotBodies.includes(bodyA.id) &&

                        bodyB.isStatic

                    ) {

                        groundContacts.add(bodyA.id);

                    }


                    if (

                        robotBodies.includes(bodyB.id) &&

                        bodyA.isStatic

                    ) {

                        groundContacts.add(bodyB.id);

                    }

                }

            );

        }
    );


    this.matter.world.on(

        'collisionend',

        function(event) {

            event.pairs.forEach(

                function(pair) {

                    groundContacts.delete(
                        pair.bodyA.id
                    );

                    groundContacts.delete(
                        pair.bodyB.id
                    );

                }

            );

        }
    );


    // =================================================
    // RESET AWAL
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
    // RESET VARIABLE
    // =================================================

    jumpCooldown = 0;

    isLeftDown = false;

    isRightDown = false;

    isJumpDown = false;


    groundContacts.clear();


    if (scene.statusText) {

        scene.statusText.setText('');

    }
}


// =====================================================
// UPDATE
// =====================================================

function update(time, delta) {

    if (!this.badanRobot) {

        return;

    }


    const M =
        Phaser.Physics.Matter.Matter;


    // =================================================
    // VISUAL ROBOT
    // =================================================

    this.robotVisual.setPosition(

        this.badanRobot.position.x,

        this.badanRobot.position.y

    );


    // Chassis selalu tegak.

    this.robotVisual.setRotation(0);


    // =================================================
    // VISUAL RODA KIRI
    // =================================================

    this.rodaKiriVisual.setPosition(

        this.rodaKiri.position.x,

        this.rodaKiri.position.y

    );


    // =================================================
    // VISUAL RODA KANAN
    // =================================================

    this.rodaKananVisual.setPosition(

        this.rodaKanan.position.x,

        this.rodaKanan.position.y

    );


    // =================================================
    // INPUT
    // =================================================

    const left =

        cursors.left.isDown ||

        isLeftDown;


    const right =

        cursors.right.isDown ||

        isRightDown;


    // =================================================
    // GERAK ROBOT
    // =================================================

    const moveForce = 0.0025;


    // -------------------------------------------------
    // KIRI
    // -------------------------------------------------

    if (left) {

        M.Body.applyForce(

            this.badanRobot,

            this.badanRobot.position,

            {

                x: -moveForce,

                y: 0
            }

        );


        // Roda berputar secara visual/physics.

        M.Body.setAngularVelocity(

            this.rodaKiri,

            -0.35

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            -0.35

        );


        this.robotVisual.setFlipX(true);

    }


    // -------------------------------------------------
    // KANAN
    // -------------------------------------------------

    else if (right) {

        M.Body.applyForce(

            this.badanRobot,

            this.badanRobot.position,

            {

                x: moveForce,

                y: 0
            }

        );


        M.Body.setAngularVelocity(

            this.rodaKiri,

            0.35

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            0.35

        );


        this.robotVisual.setFlipX(false);

    }


    // =================================================
    // REM
    // =================================================

    else {

        M.Body.setAngularVelocity(

            this.rodaKiri,

            this.rodaKiri.angularVelocity * 0.9

        );


        M.Body.setAngularVelocity(

            this.rodaKanan,

            this.rodaKanan.angularVelocity * 0.9

        );

    }


    // =================================================
    // BATAS KECEPATAN ROBOT
    // =================================================

    const maxSpeed = 6;


    if (

        this.badanRobot.velocity.x >

        maxSpeed

    ) {

        M.Body.setVelocity(

            this.badanRobot,

            {

                x: maxSpeed,

                y:
                    this.badanRobot.velocity.y

            }

        );

    }


    if (

        this.badanRobot.velocity.x <

        -maxSpeed

    ) {

        M.Body.setVelocity(

            this.badanRobot,

            {

                x: -maxSpeed,

                y:
                    this.badanRobot.velocity.y

            }

        );

    }


    // =================================================
    // STABILISASI CHASSIS
    // =================================================

    M.Body.setAngle(

        this.badanRobot,

        0

    );


    M.Body.setAngularVelocity(

        this.badanRobot,

        0

    );


    // =================================================
    // COOLDOWN LOMPAT
    // =================================================

    if (jumpCooldown > 0) {

        jumpCooldown -= delta;

    }


    // =================================================
    // LOMPAT
    // =================================================

    const inginLompat =

        cursors.up.isDown ||

        isJumpDown;


    const sedangMenyentuhTanah =

        groundContacts.has(
            this.badanRobot.id
        ) ||

        groundContacts.has(
            this.rodaKiri.id
        ) ||

        groundContacts.has(
            this.rodaKanan.id
        );


    if (

        inginLompat &&

        sedangMenyentuhTanah &&

        jumpCooldown <= 0

    ) {

        // Badan

        M.Body.setVelocity(

            this.badanRobot,

            {

                x:
                    this.badanRobot.velocity.x,

                y: -10

            }

        );


        // Roda kiri

        M.Body.setVelocity(

            this.rodaKiri,

            {

                x:
                    this.rodaKiri.velocity.x,

                y: -10

            }

        );


        // Roda kanan

        M.Body.setVelocity(

            this.rodaKanan,

            {

                x:
                    this.rodaKanan.velocity.x,

                y: -10

            }

        );


        jumpCooldown = 500;


        isJumpDown = false;

    }


    // =================================================
    // BATAS KIRI
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


        M.Body.setVelocity(

            this.badanRobot,

            {

                x: 0,

                y:
                    this.badanRobot.velocity.y

            }

        );

    }


    // =================================================
    // BATAS KANAN
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


        M.Body.setVelocity(

            this.badanRobot,

            {

                x: 0,

                y:
                    this.badanRobot.velocity.y

            }

        );

    }


    // =================================================
    // CEK KAYU
    // =================================================

    const box =
        kayu.body.position;


    // =================================================
    // ZONA MERAH
    // =================================================

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
    // ZONA HIJAU
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


    else {

        this.statusText.setText('');

    }
}
