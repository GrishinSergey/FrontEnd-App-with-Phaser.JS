var Menu = {

	background: null,
	buttonPlay: null,
	textPlay:   null,

	preload: function () {
		this.load.image('background', 'assets/images/background.png');
		this.load.image('spaceship', 'assets/images/spaceship.png');
		this.load.image('button', 'assets/images/button.png');
	},

	create: function () {
		this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
		this.background.alpha = 1;

		this.spaceship = this.add.sprite(this.world.centerX + 250, this.world.centerY - 250, 'spaceship');
		
		this.buttonPlay = this.add.sprite(this.world.centerX - 111, this.world.centerY - 150, 'button');
		this.buttonPlay.inputEnabled = true;
		this.buttonPlay.events.onInputDown.add(function () {
			this.state.start('Game');
		}, this);
		this.textPlay = this.add.text(this.buttonPlay.centerX, this.buttonPlay.centerY, 'Play',
									{font: '25px KenVector-Future'});
		this.textPlay.anchor.set(0.5);
	},

	update: function () {
		this.background.tilePosition.y += 1;
		this.background.alpha -= 0.0005;
	}

}