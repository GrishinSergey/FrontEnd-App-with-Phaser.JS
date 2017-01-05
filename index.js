$(document).ready(function () {

	$('.cbalink').remove();
	$('.fontPreload').hide();

	var game = new Phaser.Game('100%', '100%', Phaser.AUTO, '');

	game.state.add('Game', Game);
	game.state.add('Menu', Menu);

	game.state.start('Menu');

});