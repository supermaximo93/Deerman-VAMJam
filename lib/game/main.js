window.canSeePlayerFunction = function() {
  if (ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getPlayer()) > this.SIGHT_RANGE_SQUARED) {
    return false;
  }

  var directionToPlayer = ig.Utils.getDirectionToEntity(this, ig.game.getPlayer());
  var angleToPlayer = ig.Utils.angleBetweenVectorsDegrees(this.direction, directionToPlayer);
  if (Math.abs(angleToPlayer) > this.SIGHT_ANGLE) {
    return false;
  }

  var distance = ig.Utils.getDistanceVectorBetweenEntities(ig.game.getPlayer(), this);
  var hitscanResult = ig.game.collisionMap.trace(this.center().x, this.center().y, distance.x, distance.y, 1, 1);
  return !hitscanResult.collision.x && !hitscanResult.collision.y;
};

ig.Utils = {
	getDistanceVectorBetweenEntities: function(a, b) {
		return {
			x: a.center().x - b.center().x,
			y: a.center().y - b.center().y
		};
	},

	getDistanceSquaredBetweenEntities: function(a, b) {
		var distX = a.center().x - b.center().x;
		var distY = a.center().y - b.center().y;
		return (distX * distX) + (distY * distY);
	},

	getDistanceBetweenEntities: function(a, b) {
		var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(a, b);
		return Math.sqrt(distanceSquared);
	},

	signDifference: function(a, b) {
		return (a > 0 && b < 0) || (a < 0 && b > 0);
	},

	getDirectionToEntity: function(from, to) {
		var distance = {
			x: to.center().x - from.center().x,
			y: to.center().y - from.center().y
		};
		return ig.Utils.normalize(distance);
	},

	dotProduct: function(a, b) {
		return (a.x * b.x) + (a.y * b.y);
	},

	angleBetweenVectors: function(a, b) {
		var dotProduct = ig.Utils.dotProduct(a, b);
		var lengthA = ig.Utils.vectorLength(a);
		var lengthB = ig.Utils.vectorLength(b);
		if (lengthA == 0 || lengthB == 0 || Math.abs(dotProduct) > 1)
			return 0;
		var angle = Math.acos(dotProduct / (lengthA * lengthB));
		return ig.Utils.dotProduct(a, ig.Utils.perpendicular(b)) >= 0 ? angle : -angle;
	},

	angleBetweenVectorsDegrees: function(a, b) {
		return ig.Utils.radToDeg(ig.Utils.angleBetweenVectors(a, b));
	},

	radToDeg: function(a) {
		return (a / Math.PI) * 180;
	},

	normalize: function(a) {
		var length = ig.Utils.vectorLength(a);
		return {
			x: a.x / length,
			y: a.y / length
		};
	},

	vectorLength: function(a) {
		return Math.sqrt((a.x * a.x) + (a.y * a.y));
	},

	perpendicular: function(a) {
		return {
			x: -a.y,
			y: a.x
		};
	},

	drawLine: function(startX, startY, lenX, lenY, color) {
    ig.system.context.strokeStyle = color || 'rgba(255, 255, 255, 1.0)';
    ig.system.context.lineWidth = ig.system.scale * 6;
    ig.system.context.beginPath();
    ig.system.context.moveTo(ig.system.getDrawPos(startX - ig.game.screen.x), ig.system.getDrawPos(startY - ig.game.screen.y));
    ig.system.context.lineTo(ig.system.getDrawPos(startX + lenX - ig.game.screen.x), ig.system.getDrawPos(startY + lenY - ig.game.screen.y));
    ig.system.context.stroke();
    ig.system.context.closePath();
	}
};

ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'plugins.astar-for-entities',
	'game.levels.level1'
)
.defines(function(){


ig.Entity.prototype.center = function() {
	return {
		x: this.pos.x + (this.size.x / 2),
		y: this.pos.y + (this.size.y / 2)
	};
}

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
		ig.input.bind(ig.KEY.SPACE, 'action')

		this.loadLevel(LevelLevel1);
	},
	
	update: function() {
		this.parent();
		
		this.moveCameraToPlayer();
	},
	
	draw: function() {
		this.parent();

		var lineLength = 200;
		for (var i = 0; i < this.entities.length; ++i) {
			var entity = this.entities[i];
			if (entity.direction) {
				ig.Utils.drawLine(entity.center().x, entity.center().y, entity.direction.x * lineLength, entity.direction.y * lineLength, entity.lineColor);
			}
		}
	},

	lose: function(reason) {
		//console.log('YOU LOSE!');
	},

	loadLevel: function(level) {
		this.parent(level);
		this.afterLevelLoadForEntitiesOfType('EntityWaypoint');
		this.afterLevelLoadForEntitiesOfType('EntityDog');
		this.afterLevelLoadForEntitiesOfType('EntityLion');
	},

	afterLevelLoadForEntitiesOfType: function(type) {
		var entities = ig.game.getEntitiesByType(type);
		for (var i = 0; i < entities.length; ++i) {
			if (entities[i].afterLevelLoad) {
				entities[i].afterLevelLoad();
			}
		}
	},

	moveCameraToPlayer: function() {
		var player = this.getPlayer();
		if (player) {
			ig.game.screen.x = player.center().x - (ig.system.width / 2);
			ig.game.screen.y = player.center().y - (ig.system.height / 2);
		}
	},

	getPlayer: function() {
		return ig.game.getEntitiesByType('EntityPlayer')[0];
	},

	getGirl: function() {
		return ig.game.getEntitiesByType('EntityGirl')[0];
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main('#canvas', MyGame, 60, 1024 * 2, 768 * 2, 0.5);

});
