ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.levels.level1'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	
	init: function() {
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.S, 'down');
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.D, 'right');

		this.loadLevel(LevelLevel1);
	},
	
	update: function() {
		this.parent();
		
		this.moveCameraToPlayer();
	},
	
	draw: function() {
		this.parent();
	},

	moveCameraToPlayer: function() {
		var player = ig.game.getEntitiesByType('EntityPlayer')[0];
		if (player) {
			ig.game.screen.x = player.pos.x - (ig.system.width / 2);
			ig.game.screen.y = player.pos.y - (ig.system.height / 2);
		}
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 1024, 768, 1 );

});
