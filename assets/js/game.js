var Game = {

    /* objects of classes for control elements on map */
    laser: null,
    ship: null,
    enemy: null,

    /* timespamp for timing attacks of enemies */
    timeStamp: 0,

    /* objects on screen */
    background: null,
    player: null,
    enemies: null,
    lasersPlayer: null,
    cursors: null,
    attackText: null,

    /* functions for polimorphysm of moving and attack on different devices */
    move: null,
    attack: null,

    preload: function () {
        this.game.load.image('background', 'assets/images/background.png');

        this.game.load.image('player', 'assets/images/player.png');
        this.game.load.image('laserPlayer', 'assets/images/laser_player.png');
        this.game.load.image('life', 'assets/images/life.png');

        this.game.load.image('enemy', 'assets/images/enemy1.png');
        this.game.load.image('laserEnemy', 'assets/images/laser_enemy.png');
    },

    create: function () {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');

        this.laser = new Laser(this.game).init();
        this.ship = new Player(this.game, this.world.centerX - 50, this.game.height - 125);
        this.enemy = new Enemy(this.game).init(this.ship);

        this.lasersPlayer = this.laser.setLasers().getGroup();

        this.player = this.ship.get();
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.enemies = this.enemy.setEnemies().getGroup();

        this.cursors = this.game.input.keyboard.createCursorKeys();

        if (device.ios() || device.android()) {
            this.move = this.moveForPhones;
            this.attack = this.attackForPhones;
            this.attackText = this.game.add.text(this.world.centerX, this.world.height - 35, 'attack',
                                                 {font: '25px KenVector-Future', fill: '#fff'});
            this.attackText.anchor.set(0.5);
            this.attackText.inputEnabled = true;
        }
        else {
            this.move = this.moveForPC;
            this.attack = this.attackForPC;
            this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        }
    },

    update: function() {
        this.background.tilePosition.y += 3;

        if (this.ship.hitPoints === 0) {
            this.game.state.start('Menu');
            return;
        }

        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        this.game.physics.arcade.overlap(this.lasersPlayer, this.enemies, function (laser, enemy) {
            laser.kill();
            this.enemy.killEnemy(enemy);
            enemy.kill();
            this.enemies.remove(enemy);
            this.enemies = this.enemy.setEnemies().getGroup();
            this.ship.outScores();
        }, null, this);

        this.move();

        this.enemy.moveToPlayerVertical(this.player.x);

        if (Math.abs(this.timeStamp - this.game.time.now) > 150) {
            this.enemy.attack(this.player.x);
            this.timeStamp = this.game.time.now;
        }

        this.enemy.getGroup().forEach(function (enemy) {
            enemy.laser.setImpactLaserPlayerEvent();
        }, false, 200);

        this.attack();
    },

    moveForPhones() {
        if (this.game.input.activePointer.isDown) {
            if (this.game.input.activePointer.y > this.game.height - 40 ||
                this.game.input.activePointer.y < this.game.height - 100) {
                return;
            }

            if (this.player.x > this.game.input.activePointer.x && (this.player.x - Math.floor(this.player.width / 2) >= 0)) {
                this.player.body.velocity.x = -450;
            }
            if (this.player.x < this.game.input.activePointer.x && (this.player.x + this.player.width + 50 < this.game.width)) {
                this.player.body.velocity.x = 450;
            }
        }
    },

    moveForPC() {
        if (this.cursors.left.isDown && (this.player.x - Math.floor(this.player.width / 2) >= 0)) {
            this.player.body.velocity.x = -450;
        }
        if (this.cursors.right.isDown && (this.player.x + this.player.width + 50 < this.game.width)) {
            this.player.body.velocity.x = 450;
        }
        if (this.cursors.up.isDown && (this.player.y - Math.floor(this.player.height / 2) >= 0)) {
            this.player.body.velocity.y = -450;
        }
        if (this.cursors.down.isDown && (this.player.y + this.player.height + 50 < this.game.height)) {
            this.player.body.velocity.y = 450;
        }
    },

    attackForPhones() {
        if (this.game.input.activePointer.isDown) {
            if (this.game.input.activePointer.y > this.world.height - 35 &&
                this.game.input.activePointer.x > this.world.centerX - 100 &&
                this.game.input.activePointer.x < this.world.centerX + 100) {
                    this.laser.makeShot(this.player);
            }
        }
    },

    attackForPC() {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.laser.makeShot(this.player);
        }
    }

}

class AbstractGroup {

    constructor(game) {
        this.game = game;
        this.group = this.game.add.group();
        this.group.enableBody = true;
        this.group.physicsBodyType = Phaser.Physics.ARCADE;
    }

    getGroup() {
        return this.group;
    }

}

class Player {

    constructor(game, x, y) {
        this.game = game;
        this.hitPoints = 3;
        this.scores = 0;
        this.spriteName = '';
        this.setSpriteName();
        this.scoresText = this.game.add.text(this.game.width - 100, this.game.height - 35, '0',
                                             {fill: '#fff', font: '25px KenVector-Future'});
        this.hitPointsGroup = this.game.add.group();
        this.hitPointsGroup.add(this.game.add.sprite(40, this.game.height - 35, 'life'));
        this.hitPointsGroup.add(this.game.add.sprite(81, this.game.height - 35, 'life'));
        this.hitPointsGroup.add(this.game.add.sprite(122, this.game.height - 35, 'life'));
        this.player = this.game.add.sprite(x, y, this.spriteName);
    }

    setDamage() {
        this.hitPoints--;
        var hp = this.hitPointsGroup.getFirstExists();
        hp.kill();
        this.hitPointsGroup.remove(hp);
    }

    setSpriteName(spriteName = 'player') {
        this.spriteName = spriteName;
        return this;
    }

    outScores() {
        this.scores++;
        this.scoresText.setText(this.scores.toString());
    }

    get(x, y) {
        return this.player;
    }

}

class Enemy extends AbstractGroup {

    init(player) {
        this.count = 1;
        this.enemiesOnMapNow = 0;
        this.enemies = new Array();
        this.player = player;
        return this;
    }

    get(x, y, sprite) {
        return this.group.create(x, y, sprite);
    }

    getX() {
        return (Math.random() * 1000 > 500) ? this.game.width + 150 : -150;
    }

    addNewEnemy(sprite) {
        this.enemies.push({x: this.getX(), y: 25});
        var index = this.enemies.length - 1,
            enemy = this.get(this.enemies[index].x, this.enemies[index].y, sprite);
        enemy.name = sprite.concat(index);
        this.enemies[index].name = enemy.name;
        enemy.checkWorldBounds = true;
        enemy.attackTimerObject = null;
        enemy.laser = new EnemyLaser(this.game).init(this.player).setLasers();
        this.enemiesOnMapNow++;
    }

    moveToPlayerVertical(x) {
        this.group.forEach(function (enemy) {
            if (Math.abs(enemy.x - x) > 50) {
                this.game.physics.arcade.moveToXY(enemy, x, enemy.y, 100);
            }
        }, this.game.physics.arcade, false, 200);
    }

    setEnemies() {
        var id = setInterval(function (scope, id) {
            if (scope.enemiesOnMapNow != scope.count) {
                scope.addNewEnemy('enemy');
            }
            else {
                clearInterval(id);
            }
        }, 2000, this, id);
        return this;
    }

    killEnemy(killedEnemy) {
        this.enemiesOnMapNow--;
        this.enemies.splice(this.enemies.findIndex(function (enemy) {
            if (enemy.name === killedEnemy.name) {
                enemy = undefined;
                return true;
            }
            return false;
        }), 1);
        if (this.count + 1 < 6) { // Update MaxEnemiesOnMap: 5 enemies max
            this.count++;
        }
        return this;
    }

    attack(x) {
        this.group.forEach(function (enemy) {
            if (Math.abs(enemy.x - x) < 50) {
                enemy.laser.makeShot(enemy);
            }
        }, this, false, 200);
    }

}

class Laser extends AbstractGroup {

    init() {
        this.spriteName = '';
        this.setSpriteName();
        this.time = 0;
        return this;
    }

    setSpriteName() {
        this.spriteName = 'laserPlayer';
        return this;
    }

    setLasers() {
        for (var i = 0; i < 20; i++) {
            var laser = this.group.create(0, 0, this.spriteName);
            laser.name = this.spriteName.concat(i);
            laser.exists = false;
            laser.visible = false;
            laser.checkWorldBounds = true;
            laser.events.onOutOfBounds.add(function (laser) {
                laser.kill();
            }, this.game);
        }
        return this;
    }

    shot(x, y, velocity, timer) {
        if (this.game.time.now > this.time) {
            var bullet = this.group.getFirstExists(false);
            if (bullet) {
                bullet.reset(x, y);
                bullet.body.velocity.y = velocity;
                this.time = this.game.time.now + timer;
            }
        }
    }

    makeShot(spaceship) {
        this.shot(spaceship.x + Math.ceil(spaceship.width / 2) - 5, spaceship.y - 25, -300, 200);
    }

};

class EnemyLaser extends Laser {

    init(player) {
        super.init();
        this.player = player;
        return this;
    }

    setImpactLaserPlayerEvent() {
        this.game.physics.arcade.overlap(this.game.add.group().add(this.player.get()), this.group, function (player, laser) {
            laser.kill();
            this.player.setDamage();
        }, null, this);
    }

    setSpriteName() {
        this.spriteName = 'laserEnemy';
        return this;
    }

    makeShot(spaceship) {
        this.shot(spaceship.x + Math.ceil(spaceship.width / 2) - 5, spaceship.height, 300, 200);
    }

}
