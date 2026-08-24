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
            parent: 'game-container',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1280,
                height: 720
            },
            backgroundColor: '#1b2a32',
            physics: {
                default: 'matter',
                matter: {
                    gravity: {
                        y: 1
                    },
                    debug: false // Tampilan bersih
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        // Initialize Game Engine
        const game = new Phaser.Game(config);

        // =====================================================
        // PRELOAD PROCEDURAL TEXTURES
        // =====================================================
        function preload() {
            // Tekstur prosedural robot dan kayu dibuat secara dinamis
            // agar game dapat berjalan tanpa ketergantungan file lokal.

            // 1. TEKSTUR ROBOT
            const gRobot = this.make.graphics({ x: 0, y: 0, add: false });
            gRobot.fillStyle(0x2563eb, 1);
            gRobot.fillRoundedRect(0, 0, 175, 106, 16);
            gRobot.lineStyle(6, 0x60a5fa, 1);
            gRobot.strokeRoundedRect(0, 0, 175, 106, 16);
            gRobot.fillStyle(0x06b6d4, 1);
            gRobot.fillRoundedRect(100, 20, 60, 32, 8);
            gRobot.fillStyle(0xa5f3fc, 1);
            gRobot.fillRect(135, 26, 18, 20);
            gRobot.fillStyle(0x1e3a8a, 1);
            gRobot.fillCircle(30, 30, 8);
            gRobot.fillCircle(30, 76, 8);
            gRobot.fillRect(55, 30, 35, 46);
            gRobot.generateTexture('robot-sprite', 175, 106);
            gRobot.destroy();

            // 2. TEKSTUR KAYU / KOTAK
            const gKayu = this.make.graphics({ x: 0, y: 0, add: false });
            gKayu.fillStyle(0xb45309, 1);
            gKayu.fillRect(0, 0, 50, 50);
            gKayu.lineStyle(4, 0x451a03, 1);
            gKayu.strokeRect(0, 0, 50, 50);
            gKayu.lineStyle(2, 0x78350f, 1);
            gKayu.lineBetween(0, 0, 50, 50);
            gKayu.lineBetween(50, 0, 0, 50);
            gKayu.fillStyle(0x78716c, 1);
            gKayu.fillRect(0, 0, 10, 10);
            gKayu.fillRect(40, 0, 10, 10);
            gKayu.fillRect(0, 40, 10, 10);
            gKayu.fillRect(40, 40, 10, 10);
            gKayu.generateTexture('kayu-sprite', 50, 50);
            gKayu.destroy();
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
                0x334155
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
                0x451a03
            );

            this.matter.add.gameObject(
                tanjakanKaret,
                {
                    isStatic: true,
                    angle: 0.5,
                    friction: 1, // Karet kasar
                    frictionStatic: 1
                }
            );

            this.add.text(
                300,
                630,
                "⚠️ JALUR KARET\nSangat Kasar!",
                {
                    fontSize: '20px',
                    fill: '#f87171',
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
                0x38bdf8
            );

            this.matter.add.gameObject(
                tanjakanEs,
                {
                    isStatic: true,
                    angle: -0.5,
                    friction: 0.001, // Es sangat licin
                    frictionStatic: 0.02
                }
            );

            this.add.text(
                980,
                630,
                "❄️ JALUR ES\nSangat Licin!",
                {
                    fontSize: '20px',
                    fill: '#38bdf8',
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
                0xef4444,
                0.35
            );
            this.add.rectangle(100, 350, 150, 150).setStrokeStyle(3, 0xef4444);

            this.zonaKanan = this.add.rectangle(
                1180,
                350,
                150,
                150,
                0x22c55e,
                0.35
            );
            this.add.rectangle(1180, 350, 150, 150).setStrokeStyle(3, 0x22c55e);

            this.add.text(100, 350, "ZONA MERAH", { fontSize: '16px', fill: '#fca5a5', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(1180, 350, "ZONA HIJAU", { fontSize: '16px', fill: '#86efac', fontStyle: 'bold' }).setOrigin(0.5);

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

            // Simpan referensi kayu ke scene agar bisa diakses oleh resetGame(scene)
            this.kayu = kayu;

            // Kotak tidak boleh berputar supaya mudah didorong robot
            M.Body.setInertia(
                kayu.body,
                Infinity
            );

            // =================================================
            // 6. MEMBUAT ROBOT
            // =================================================
            const robotGroup = -1;

            // BADAN ROBOT
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

            // RODA KIRI
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

            // RODA KANAN
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
                pointA: { x: -20, y: 16 },
                bodyB: rodaKiri,
                pointB: { x: 0, y: 0 },
                stiffness: 1,
                damping: 0.35,
                length: 0
            });

            // =================================================
            // 8. CONSTRAINT RODA KANAN
            // =================================================
            const engselKanan = M.Constraint.create({
                bodyA: badan,
                pointA: { x: 20, y: 16 },
                bodyB: rodaKanan,
                pointB: { x: 0, y: 0 },
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
            M.Body.setInertia(badan, Infinity);
            M.Body.setAngle(badan, 0);
            M.Body.setAngularVelocity(badan, 0);

            // Simpan referensi body robot
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
                .setOrigin(0.5, 0.55);

            // =================================================
            // 12. VISUAL RODA
            // =================================================
            this.rodaKiriVisual = this.add.container(560, 615);
            const cKiri = this.add.circle(0, 0, 10, 0x1e293b).setStrokeStyle(2, 0x38bdf8);
            const rLineKiri = this.add.line(0, 0, -8, 0, 8, 0, 0x38bdf8);
            this.rodaKiriVisual.add([cKiri, rLineKiri]);

            this.rodaKananVisual = this.add.container(600, 615);
            const cKanan = this.add.circle(0, 0, 10, 0x1e293b).setStrokeStyle(2, 0x38bdf8);
            const rLineKanan = this.add.line(0, 0, -8, 0, 8, 0, 0x38bdf8);
            this.rodaKananVisual.add([cKanan, rLineKanan]);

            // =================================================
            // 13. JUDUL MISI
            // =================================================
            this.add.rectangle(
                640,
                50,
                820,
                75,
                0x0f172a,
                0.85
            ).setStrokeStyle(1, 0x334155);

            this.add.text(
                640,
                50,
                "🎯 MISI: Dorong kotak kayu ke salah satu zona di atas!\n" +
                "Bandingkan efek gesekan (friction) pada tanjakan Karet vs Es.",
                {
                    fontSize: '20px',
                    fill: '#f1f5f9',
                    align: 'center',
                    lineSpacing: 6
                }
            ).setOrigin(0.5);

            // =================================================
            // 14. STATUS GAME
            // =================================================
            this.statusText = this.add.text(
                640,
                125,
                '',
                {
                    fontSize: '24px',
                    fill: '#facc15',
                    fontStyle: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // =================================================
            // 15. KEYBOARD
            // =================================================
            cursors = this.input.keyboard.createCursorKeys();

            // =================================================
            // 16. TOMBOL KIRI
            // =================================================
            const btnLeft = this.add.rectangle(
                100,
                640,
                80,
                80,
                0x334155,
                0.7
            ).setInteractive().setStrokeStyle(2, 0x64748b);

            this.add.text(
                100,
                640,
                '◀',
                {
                    fontSize: '36px',
                    fill: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            btnLeft
                .on('pointerdown', () => { isLeftDown = true; })
                .on('pointerup', () => { isLeftDown = false; })
                .on('pointerout', () => { isLeftDown = false; })
                .on('pointerupoutside', () => { isLeftDown = false; });

            // =================================================
            // 17. TOMBOL KANAN
            // =================================================
            const btnRight = this.add.rectangle(
                200,
                640,
                80,
                80,
                0x334155,
                0.7
            ).setInteractive().setStrokeStyle(2, 0x64748b);

            this.add.text(
                200,
                640,
                '▶',
                {
                    fontSize: '36px',
                    fill: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            btnRight
                .on('pointerdown', () => { isRightDown = true; })
                .on('pointerup', () => { isRightDown = false; })
                .on('pointerout', () => { isRightDown = false; })
                .on('pointerupoutside', () => { isRightDown = false; });

            // =================================================
            // 18. TOMBOL LOMPAT
            // =================================================
            const btnJump = this.add.rectangle(
                1180,
                640,
                80,
                80,
                0x334155,
                0.7
            ).setInteractive().setStrokeStyle(2, 0x64748b);

            this.add.text(
                1180,
                640,
                '▲',
                {
                    fontSize: '36px',
                    fill: '#ffffff',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);

            btnJump
                .on('pointerdown', () => { isJumpDown = true; })
                .on('pointerup', () => { isJumpDown = false; })
                .on('pointerout', () => { isJumpDown = false; })
                .on('pointerupoutside', () => { isJumpDown = false; });

            // =================================================
            // 19. TOMBOL RESET
            // =================================================
            const tombolReset = this.add.text(
                1150,
                50,
                '🔄 RESET',
                {
                    fontSize: '20px',
                    fill: '#ffffff',
                    backgroundColor: '#ef4444',
                    padding: { x: 16, y: 10 },
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setInteractive();

            tombolReset.on('pointerdown', () => {
                resetGame(this);
            });

            // =================================================
            // 20. POSISI AWAL
            // =================================================
            this.robotStart = {
                body: { x: 580, y: 580 },
                left: { x: 560, y: 615 },
                right: { x: 600, y: 615 }
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
            // Safety check: cegah eksekusi jika objek fisika belum terinisialisasi
            if (!scene || !scene.badanRobot || !scene.kayu || !scene.rodaKiri || !scene.rodaKanan) {
                return;
            }

            const M = Phaser.Physics.Matter.Matter;

            // RESET BADAN ROBOT
            M.Body.setPosition(scene.badanRobot, {
                x: scene.robotStart.body.x,
                y: scene.robotStart.body.y
            });
            M.Body.setVelocity(scene.badanRobot, { x: 0, y: 0 });
            M.Body.setAngle(scene.badanRobot, 0);
            M.Body.setAngularVelocity(scene.badanRobot, 0);

            // RESET RODA KIRI
            M.Body.setPosition(scene.rodaKiri, {
                x: scene.robotStart.left.x,
                y: scene.robotStart.left.y
            });
            M.Body.setVelocity(scene.rodaKiri, { x: 0, y: 0 });
            M.Body.setAngularVelocity(scene.rodaKiri, 0);

            // RESET RODA KANAN
            M.Body.setPosition(scene.rodaKanan, {
                x: scene.robotStart.right.x,
                y: scene.robotStart.right.y
            });
            M.Body.setVelocity(scene.rodaKanan, { x: 0, y: 0 });
            M.Body.setAngularVelocity(scene.rodaKanan, 0);

            // RESET KAYU
            scene.kayu.setPosition(scene.kayuStart.x, scene.kayuStart.y);
            scene.kayu.setVelocity(0, 0);
            scene.kayu.setAngularVelocity(0);

            // RESET STATUS CONTROL
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
            if (!this.badanRobot) {
                return;
            }

            const M = Phaser.Physics.Matter.Matter;

            // =================================================
            // 1. SINKRONISASI VISUAL ROBOT
            // =================================================
            this.robotVisual.setPosition(
                this.badanRobot.position.x,
                this.badanRobot.position.y
            );
            this.robotVisual.setRotation(0); // Robot tidak miring

            // =================================================
            // 2. SINKRONISASI VISUAL RODA (DENGAN PUTARAN)
            // =================================================
            this.rodaKiriVisual.setPosition(
                this.rodaKiri.position.x,
                this.rodaKiri.position.y
            );
            this.rodaKiriVisual.setRotation(this.rodaKiri.angle);

            this.rodaKananVisual.setPosition(
                this.rodaKanan.position.x,
                this.rodaKanan.position.y
            );
            this.rodaKananVisual.setRotation(this.rodaKanan.angle);

            // =================================================
            // 3. KONTROL GERAK
            // =================================================
            const left = cursors.left.isDown || isLeftDown;
            const right = cursors.right.isDown || isRightDown;
            const targetWheelSpeed = 0.32;

            if (left) {
                M.Body.setAngularVelocity(this.rodaKiri, -targetWheelSpeed);
                M.Body.setAngularVelocity(this.rodaKanan, -targetWheelSpeed);
                this.robotVisual.setFlipX(true);
            } else if (right) {
                M.Body.setAngularVelocity(this.rodaKiri, targetWheelSpeed);
                M.Body.setAngularVelocity(this.rodaKanan, targetWheelSpeed);
                this.robotVisual.setFlipX(false);
            } else {
                // Perlambatan bertahap (rem halus)
                M.Body.setAngularVelocity(this.rodaKiri, this.rodaKiri.angularVelocity * 0.88);
                M.Body.setAngularVelocity(this.rodaKanan, this.rodaKanan.angularVelocity * 0.88);
            }

            // =================================================
            // 4. STABILISASI CHASSIS
            // =================================================
            M.Body.setAngle(this.badanRobot, 0);
            M.Body.setAngularVelocity(this.badanRobot, 0);

            // =================================================
            // 5. SISTEM LOMPAT
            // =================================================
            if (jumpCooldown > 0) {
                jumpCooldown -= delta;
            }

            const inginLompat = cursors.up.isDown || isJumpDown;
            const sedangDiLantai = Math.abs(this.badanRobot.velocity.y) < 0.25;

            if (inginLompat && sedangDiLantai && jumpCooldown <= 0) {
                M.Body.setVelocity(this.badanRobot, {
                    x: this.badanRobot.velocity.x,
                    y: -9
                });
                M.Body.setVelocity(this.rodaKiri, {
                    x: this.rodaKiri.velocity.x,
                    y: -9
                });
                M.Body.setVelocity(this.rodaKanan, {
                    x: this.rodaKanan.velocity.x,
                    y: -9
                });

                jumpCooldown = 450;
                isJumpDown = false;
            }

            // =================================================
            // 6. BATAS LEVEL
            // =================================================
            if (this.badanRobot.position.x < 30) {
                M.Body.setPosition(this.badanRobot, {
                    x: 30,
                    y: this.badanRobot.position.y
                });
            }
            if (this.badanRobot.position.x > 1250) {
                M.Body.setPosition(this.badanRobot, {
                    x: 1250,
                    y: this.badanRobot.position.y
                });
            }

            // =================================================
            // 7. CEK ZONA FINISH
            // =================================================
            const box = kayu.body.position;

            if (box.x > 25 && box.x < 175 && box.y > 275 && box.y < 425) {
                this.statusText.setText('🎉 BERHASIL! Kotak masuk Zona Merah (Jalur Karet)!');
            } else if (box.x > 1105 && box.x < 1255 && box.y > 275 && box.y < 425) {
                this.statusText.setText('🎉 BERHASIL! Kotak masuk Zona Hijau (Jalur Es)!');
            } else {
                this.statusText.setText('');
            }
        }
