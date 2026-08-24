 // =====================================================
        // WEB AUDIO SYNTHESIZER FOR SOUND EFFECTS
        // =====================================================
        class AudioEngine {
            constructor() {
                this.ctx = null;
            }
            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
            }
            playJump() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
            }
            playMagnet() {
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.25);
            }
            playWin() {
                if (!this.ctx) return;
                const notes = [261.63, 329.63, 392.00, 523.25];
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
                    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.3);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(this.ctx.currentTime + idx * 0.1);
                    osc.stop(this.ctx.currentTime + idx * 0.1 + 0.3);
                });
            }
        }
        const sfx = new AudioEngine();
        window.addEventListener('pointerdown', () => sfx.init(), { once: true });
        window.addEventListener('keydown', () => sfx.init(), { once: true });

        // Global Game State & Variables
        let currentChapter = 1;
        let isMagnetActive = false;
        let magnetConstraint = null;
        let cursors, keyM;
        let isLeftDown = false, isRightDown = false, isJumpDown = false;
        let jumpCooldown = 0;
        let dialogueTextEl = document.getElementById('dialogue-text');
        let chapterNameEl = document.getElementById('chapter-name');
        let tractionIndicatorEl = document.getElementById('traction-indicator');
        let btnMagnet = document.getElementById('btn-magnet');
        let btnChapterNext = document.getElementById('btn-chapter-next');

        // Dialogues Story Script
        const storyScript = {
            chap1_start: "👨‍🔬 Dr. Vane: 'ROBO-8! Uji coba babak 1 dimulai. Geser Inti Energi kayu ini ke Zona Merah (Thermo) atau Hijau (Cryo). Rasakan perbedaan antara Jalur Karet yang kesat dan Jalur Es yang licin!'",
            chap1_win: "🎉 Dr. Vane: 'Kerja bagus! Kamu berhasil menyeimbangkan friksi dan momentum! Mari lanjut ke Babak 2!'",
            chap2_start: "👨‍🔬 Dr. Vane: 'Babak 2: Tanjakan makin curam! Ingat, jika kotak merosot di permukaan licin, gunakan fitur MAGNET (Tekan M / Tombol Magnet) untuk mengikatnya!'",
            chap2_win: "🎉 Dr. Vane: 'Luar biasa! Penggunaan magnetik fisika yang sangat cerdik!'",
            chap3_start: "👨‍🔬 Dr. Vane: 'Babak Final: Uji Coba Gravitasi & Friksi Ganda! Bawa Inti Energi ini melewati rintangan tertinggi!'",
            chap3_win: "🏆 Dr. Vane: 'SELESAI! Kamu telah menguasai Hukum Fisika Gesekan dan menyelamatkan seluruh Laboratorium Dynamo! Luar Biasa!'"
        };

        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1280,
                height: 720
            },
            backgroundColor: '#0b1329',
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
            // 1. TEKSTUR ROBOT FUTURISTIK (ROBO-8)
            const gRobot = this.make.graphics({ x: 0, y: 0, add: false });
            // Body Base
            gRobot.fillStyle(0x0ea5e9, 1);
            gRobot.fillRoundedRect(0, 0, 160, 95, 14);
            gRobot.lineStyle(4, 0x38bdf8, 1);
            gRobot.strokeRoundedRect(0, 0, 160, 95, 14);
            // Expressive Screen / Head
            gRobot.fillStyle(0x0284c7, 1);
            gRobot.fillRoundedRect(95, 15, 55, 35, 8);
            // Glowing Robot Eye
            gRobot.fillStyle(0x38bdf8, 1);
            gRobot.fillCircle(125, 32, 8);
            gRobot.fillStyle(0xffffff, 1);
            gRobot.fillCircle(127, 30, 3);
            // Core Reactor Glow on Body
            gRobot.fillStyle(0x06b6d4, 1);
            gRobot.fillCircle(45, 47, 14);
            gRobot.lineStyle(2, 0x67e8f9, 1);
            gRobot.strokeCircle(45, 47, 14);
            gRobot.generateTexture('robot-sprite', 160, 95);
            gRobot.destroy();

            // 2. TEKSTUR INTI ENERGI (KOTAK KRISTAL KAYU)
            const gKayu = this.make.graphics({ x: 0, y: 0, add: false });
            gKayu.fillStyle(0xd97706, 1);
            gKayu.fillRect(0, 0, 56, 56);
            gKayu.lineStyle(4, 0x78350f, 1);
            gKayu.strokeRect(0, 0, 56, 56);
            // Glowing Core Lines
            gKayu.lineStyle(2, 0xfde047, 1);
            gKayu.lineBetween(0, 0, 56, 56);
            gKayu.lineBetween(56, 0, 0, 56);
            gKayu.fillStyle(0xf59e0b, 1);
            gKayu.fillRect(18, 18, 20, 20);
            gKayu.generateTexture('kayu-sprite', 56, 56);
            gKayu.destroy();
        }

        function create() {
            const M = Phaser.Physics.Matter.Matter;

            // 1. LANTAI DASAR Utama
            const lantai = this.add.rectangle(640, 700, 1280, 50, 0x1e293b);
            this.matter.add.gameObject(lantai, {
                isStatic: true,
                friction: 0.8,
                frictionStatic: 1
            });

            // 2. TANJAKAN KARET (KASAR)
            this.tanjakanKaret = this.add.rectangle(300, 540, 580, 26, 0x7c2d12);
            this.matter.add.gameObject(this.tanjakanKaret, {
                isStatic: true,
                angle: 0.45,
                friction: 1.0, // Sangat tinggi
                frictionStatic: 1.2
            });

            this.add.text(300, 625, "🔥 JALUR KARET (KASAR)\nFriksi Kinetis: High (1.0)", {
                fontSize: '17px',
                fill: '#f97316',
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // 3. TANJAKAN ES (LICIN)
            this.tanjakanEs = this.add.rectangle(980, 540, 580, 26, 0x0284c7);
            this.matter.add.gameObject(this.tanjakanEs, {
                isStatic: true,
                angle: -0.45,
                friction: 0.001, // Sangat licin
                frictionStatic: 0.01
            });

            this.add.text(980, 625, "❄️ JALUR ES (LICIN)\nFriksi Kinetis: Low (0.001)", {
                fontSize: '17px',
                fill: '#38bdf8',
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // 4. ZONA FINISH TARGET
            this.zonaKiri = this.add.rectangle(100, 330, 150, 150, 0xef4444, 0.3);
            this.add.rectangle(100, 330, 150, 150).setStrokeStyle(3, 0xf87171);
            this.add.text(100, 330, "ZONA THERMO\n(MERAH)", { fontSize: '15px', fill: '#fca5a5', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

            this.zonaKanan = this.add.rectangle(1180, 330, 150, 150, 0x10b981, 0.3);
            this.add.rectangle(1180, 330, 150, 150).setStrokeStyle(3, 0x34d399);
            this.add.text(1180, 330, "ZONA CRYO\n(HIJAU)", { fontSize: '15px', fill: '#a7f3d0', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

            // 5. INTI ENERGI (KOTAK DYNAMIS)
            const kayuVisual = this.add.image(640, 580, 'kayu-sprite').setDisplaySize(54, 54);
            this.kayu = this.matter.add.gameObject(kayuVisual, {
                shape: { type: 'rectangle', width: 54, height: 54 },
                mass: 0.8,
                friction: 0.7,
                frictionStatic: 0.9,
                frictionAir: 0.01,
                restitution: 0.05
            });
            M.Body.setInertia(this.kayu.body, Infinity); // Kunci rotasi agar stabil didorong

            // Magnet Visual Beam Line (Graphics)
            this.magnetBeamGFX = this.add.graphics();

            // 6. ROBOT MULTI-BODY CHASSIS
            const robotGroup = -1;
            const badan = M.Bodies.rectangle(520, 580, 54, 32, {
                mass: 4.5,
                friction: 0.3,
                frictionAir: 0.05,
                collisionFilter: { group: robotGroup }
            });

            const rodaKiri = M.Bodies.circle(500, 612, 11, {
                mass: 1.2,
                friction: 1.0,
                frictionStatic: 1.0,
                collisionFilter: { group: robotGroup }
            });

            const rodaKanan = M.Bodies.circle(540, 612, 11, {
                mass: 1.2,
                friction: 1.0,
                frictionStatic: 1.0,
                collisionFilter: { group: robotGroup }
            });

            const engselKiri = M.Constraint.create({
                bodyA: badan, pointA: { x: -20, y: 16 },
                bodyB: rodaKiri, pointB: { x: 0, y: 0 },
                stiffness: 1, damping: 0.3, length: 0
            });

            const engselKanan = M.Constraint.create({
                bodyA: badan, pointA: { x: 20, y: 16 },
                bodyB: rodaKanan, pointB: { x: 0, y: 0 },
                stiffness: 1, damping: 0.3, length: 0
            });

            this.matter.world.add([badan, rodaKiri, rodaKanan, engselKiri, engselKanan]);

            M.Body.setInertia(badan, Infinity);
            M.Body.setAngle(badan, 0);

            this.badanRobot = badan;
            this.rodaKiri = rodaKiri;
            this.rodaKanan = rodaKanan;

            // 7. VISUAL SPRITES ROBOT & RODA
            this.robotVisual = this.add.image(520, 580, 'robot-sprite').setScale(0.35).setOrigin(0.5, 0.55);

            this.rodaKiriVisual = this.add.container(500, 612);
            const cKiri = this.add.circle(0, 0, 11, 0x0f172a).setStrokeStyle(2, 0x38bdf8);
            const rLineKiri = this.add.line(0, 0, -8, 0, 8, 0, 0x38bdf8);
            this.rodaKiriVisual.add([cKiri, rLineKiri]);

            this.rodaKananVisual = this.add.container(540, 612);
            const cKanan = this.add.circle(0, 0, 11, 0x0f172a).setStrokeStyle(2, 0x38bdf8);
            const rLineKanan = this.add.line(0, 0, -8, 0, 8, 0, 0x38bdf8);
            this.rodaKananVisual.add([cKanan, rLineKanan]);

            // Posisi Start
            this.robotStart = { body: { x: 520, y: 580 }, left: { x: 500, y: 612 }, right: { x: 540, y: 612 } };
            this.kayuStart = { x: 640, y: 580 };

            // 8. INPUT KEYBOARD & TOUCH
            cursors = this.input.keyboard.createCursorKeys();
            keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

            // Onscreen Touch Controls Setup
            createTouchControls(this);

            // Magnet Button Click
            btnMagnet.addEventListener('click', () => toggleMagnet(this));

            // Chapter Next Button Click
            btnChapterNext.addEventListener('click', () => {
                if (currentChapter < 3) {
                    currentChapter++;
                    loadChapter(this, currentChapter);
                }
            });

            // Initial Dialogue Load
            setDialogue(storyScript.chap1_start);
        }

        function createTouchControls(scene) {
            // Touch Buttons Overlay inside Game Canvas
            const btnLeft = scene.add.rectangle(90, 640, 75, 75, 0x1e293b, 0.8).setInteractive().setStrokeStyle(2, 0x38bdf8);
            scene.add.text(90, 640, "◀", { fontSize: '30px', fill: '#38bdf8' }).setOrigin(0.5);
            btnLeft.on('pointerdown', () => { isLeftDown = true; });
            btnLeft.on('pointerup', () => { isLeftDown = false; });
            btnLeft.on('pointerout', () => { isLeftDown = false; });

            const btnRight = scene.add.rectangle(180, 640, 75, 75, 0x1e293b, 0.8).setInteractive().setStrokeStyle(2, 0x38bdf8);
            scene.add.text(180, 640, "▶", { fontSize: '30px', fill: '#38bdf8' }).setOrigin(0.5);
            btnRight.on('pointerdown', () => { isRightDown = true; });
            btnRight.on('pointerup', () => { isRightDown = false; });
            btnRight.on('pointerout', () => { isRightDown = false; });

            const btnJump = scene.add.rectangle(1190, 640, 75, 75, 0x1e293b, 0.8).setInteractive().setStrokeStyle(2, 0x38bdf8);
            scene.add.text(1190, 640, "▲", { fontSize: '30px', fill: '#38bdf8' }).setOrigin(0.5);
            btnJump.on('pointerdown', () => { isJumpDown = true; });
            btnJump.on('pointerup', () => { isJumpDown = false; });
            btnJump.on('pointerout', () => { isJumpDown = false; });

            const btnReset = scene.add.text(1170, 45, '🔄 RESET', {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#dc2626',
                padding: { x: 12, y: 8 },
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive();
            btnReset.setPosition(1170, 45);
            btnReset.on('pointerdown', () => resetGame(scene));
        }

        function toggleMagnet(scene) {
            const M = Phaser.Physics.Matter.Matter;
            if (isMagnetActive) {
                // Matikan Magnet
                if (magnetConstraint) {
                    scene.matter.world.remove(magnetConstraint);
                    magnetConstraint = null;
                }
                isMagnetActive = false;
                btnMagnet.classList.remove('glow-cyan', 'bg-cyan-600');
                btnMagnet.classList.add('glass-panel');
                btnMagnet.innerHTML = `<span class="text-base">🧲</span> AKTIFKAN MAGNET (M)`;
            } else {
                // Cek jarak antara robot dan kotak kayu
                const dist = Phaser.Math.Distance.Between(
                    scene.badanRobot.position.x, scene.badanRobot.position.y,
                    scene.kayu.body.position.x, scene.kayu.body.position.y
                );

                if (dist < 220) {
                    magnetConstraint = M.Constraint.create({
                        bodyA: scene.badanRobot,
                        bodyB: scene.kayu.body,
                        stiffness: 0.08,
                        damping: 0.1,
                        length: 85
                    });
                    scene.matter.world.add(magnetConstraint);
                    isMagnetActive = true;
                    sfx.playMagnet();
                    btnMagnet.classList.add('glow-cyan', 'bg-cyan-600');
                    btnMagnet.innerHTML = `<span class="text-base">⚡</span> MAGNET AKTIF! (LEPAS)`;
                } else {
                    setDialogue("⚠️ DR. VANE: 'Jarak Inti Energi terlalu jauh dari ROBO-8! Dekati kotak untuk mengaktifkan Magnet!'");
                }
            }
        }

        function setDialogue(text) {
            if (dialogueTextEl) dialogueTextEl.innerText = text;
        }

        function loadChapter(scene, chapNum) {
            btnChapterNext.classList.add('hidden');
            if (chapNum === 1) {
                chapterNameEl.innerText = "1. Akselerasi Dasar";
                setDialogue(storyScript.chap1_start);
            } else if (chapNum === 2) {
                chapterNameEl.innerText = "2. Tanjakan Curam & Salju";
                setDialogue(storyScript.chap2_start);
                // Ubah sudut tanjakan es agar lebih menantang
                Phaser.Physics.Matter.Matter.Body.setAngle(scene.tanjakanEs.body, -0.65);
            } else if (chapNum === 3) {
                chapterNameEl.innerText = "3. Final: Badai Friksi";
                setDialogue(storyScript.chap3_start);
                Phaser.Physics.Matter.Matter.Body.setAngle(scene.tanjakanKaret.body, 0.65);
            }
            resetGame(scene);
        }

        function resetGame(scene) {
            if (!scene || !scene.badanRobot || !scene.kayu) return;

            const M = Phaser.Physics.Matter.Matter;
            if (magnetConstraint) {
                scene.matter.world.remove(magnetConstraint);
                magnetConstraint = null;
            }
            isMagnetActive = false;
            btnMagnet.classList.remove('glow-cyan', 'bg-cyan-600');
            btnMagnet.innerHTML = `<span class="text-base">🧲</span> AKTIFKAN MAGNET (M)`;

            // Reset Posisi Robot & Box
            M.Body.setPosition(scene.badanRobot, scene.robotStart.body);
            M.Body.setVelocity(scene.badanRobot, { x: 0, y: 0 });
            M.Body.setAngle(scene.badanRobot, 0);

            M.Body.setPosition(scene.rodaKiri, scene.robotStart.left);
            M.Body.setVelocity(scene.rodaKiri, { x: 0, y: 0 });

            M.Body.setPosition(scene.rodaKanan, scene.robotStart.right);
            M.Body.setVelocity(scene.rodaKanan, { x: 0, y: 0 });

            if (scene.kayu && scene.kayu.body) {
                M.Body.setPosition(scene.kayu.body, scene.kayuStart);
                M.Body.setVelocity(scene.kayu.body, { x: 0, y: 0 });
                M.Body.setAngularVelocity(scene.kayu.body, 0);
            }

            jumpCooldown = 0;
        }

        function update(time, delta) {
            if (!this.badanRobot) return;

            const M = Phaser.Physics.Matter.Matter;

            // 1. Sinkronisasi Sprite Visual
            this.robotVisual.setPosition(this.badanRobot.position.x, this.badanRobot.position.y);
            this.rodaKiriVisual.setPosition(this.rodaKiri.position.x, this.rodaKiri.position.y);
            this.rodaKiriVisual.setRotation(this.rodaKiri.angle);

            this.rodaKananVisual.setPosition(this.rodaKanan.position.x, this.rodaKanan.position.y);
            this.rodaKananVisual.setRotation(this.rodaKanan.angle);

            // 2. Visual Magnet Beam Effect
            this.magnetBeamGFX.clear();
            if (isMagnetActive && magnetConstraint) {
                this.magnetBeamGFX.lineStyle(3, 0x06b6d4, 0.8);
                this.magnetBeamGFX.lineBetween(
                    this.badanRobot.position.x, this.badanRobot.position.y,
                    this.kayu.body.position.x, this.kayu.body.position.y
                );
            }

            // 3. Magnet Hotkey Check
            if (Phaser.Input.Keyboard.JustDown(keyM)) {
                toggleMagnet(this);
            }

            // 4. Movement Controls
            const left = cursors.left.isDown || isLeftDown;
            const right = cursors.right.isDown || isRightDown;
            const targetWheelSpeed = 0.6;

            if (left) {
                M.Body.setAngularVelocity(this.rodaKiri, -targetWheelSpeed);
                M.Body.setAngularVelocity(this.rodaKanan, -targetWheelSpeed);
                this.robotVisual.setFlipX(true);
            } else if (right) {
                M.Body.setAngularVelocity(this.rodaKiri, targetWheelSpeed);
                M.Body.setAngularVelocity(this.rodaKanan, targetWheelSpeed);
                this.robotVisual.setFlipX(false);
            } else {
                M.Body.setAngularVelocity(this.rodaKiri, this.rodaKiri.angularVelocity * 0.85);
                M.Body.setAngularVelocity(this.rodaKanan, this.rodaKanan.angularVelocity * 0.85);
            }

            // Chassis Stability
            M.Body.setAngle(this.badanRobot, 0);
            M.Body.setAngularVelocity(this.badanRobot, 0);

            // 5. Jump Action
            if (jumpCooldown > 0) jumpCooldown -= delta;
            const inginLompat = cursors.up.isDown || isJumpDown;
            const sedangDiLantai = Math.abs(this.badanRobot.velocity.y) < 0.3;

            if (inginLompat && sedangDiLantai && jumpCooldown <= 0) {
                M.Body.setVelocity(this.badanRobot, { x: this.badanRobot.velocity.x, y: -9.5 });
                M.Body.setVelocity(this.rodaKiri, { x: this.rodaKiri.velocity.x, y: -9.5 });
                M.Body.setVelocity(this.rodaKanan, { x: this.rodaKanan.velocity.x, y: -9.5 });
                sfx.playJump();
                jumpCooldown = 400;
                isJumpDown = false;
            }

            // 6. Realtime Traction Calculator Indicator
            const rx = this.badanRobot.position.x;
            if (rx > 680 && rx < 1240) {
                tractionIndicatorEl.innerText = "SLIP / LICIN (15%)";
                tractionIndicatorEl.className = "font-bold text-cyan-400";
            } else if (rx > 40 && rx < 600) {
                tractionIndicatorEl.innerText = "CENGKERAM / TINGGI (100%)";
                tractionIndicatorEl.className = "font-bold text-amber-400";
            } else {
                tractionIndicatorEl.innerText = "STABIL (80%)";
                tractionIndicatorEl.className = "font-bold text-emerald-400";
            }

            // 7. Victory / Goal Detection Logic
            const box = this.kayu.body.position;
            if (box.x > 25 && box.x < 175 && box.y > 250 && box.y < 410) {
                setDialogue(storyScript[`chap${currentChapter}_win`] || "🎉 BERHASIL!");
                sfx.playWin();
                if (currentChapter < 3) btnChapterNext.classList.remove('hidden');
            } else if (box.x > 1105 && box.x < 1255 && box.y > 250 && box.y < 410) {
                setDialogue(storyScript[`chap${currentChapter}_win`] || "🎉 BERHASIL!");
                sfx.playWin();
                if (currentChapter < 3) btnChapterNext.classList.remove('hidden');
            }
        }
