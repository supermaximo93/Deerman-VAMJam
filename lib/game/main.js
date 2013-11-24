window.canSeePlayerFunction = function() {
	var player = ig.game.getPlayer();
	if (!player) {
		return false;
	}

  if (ig.Utils.getDistanceSquaredBetweenEntities(this, player) > this.SIGHT_RANGE_SQUARED) {
    return false;
  }

  var directionToPlayer = ig.Utils.getDirectionToEntity(this, player);
  var angleToPlayer = ig.Utils.angleBetweenVectorsDegrees(this.direction, directionToPlayer);
  if (Math.abs(angleToPlayer) > this.SIGHT_ANGLE) {
    return false;
  }

  var distance = ig.Utils.getDistanceVectorBetweenEntities(player, this);
  var hitscanResult = ig.game.collisionMap.trace(this.center().x, this.center().y, distance.x, distance.y, 1, 1);
  return !hitscanResult.collision.x && !hitscanResult.collision.y;
};

window.canHearPlayerFunction = function(ignoreSneaking) {
	var player = ig.game.getPlayer();
	if (!player) {
		return false;
	}

  if (ig.Utils.getDistanceSquaredBetweenEntities(this, player) > this.HEARING_RANGE_SQUARED) {
    return false;
  }

  return (ignoreSneaking || !player.sneaking) && (player.vel.x != 0 || player.vel.y != 0);
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

	lerp: function(a, b, percentage) {
		return a + ((b - a) * percentage)
	},

	getNumberRangeArray: function(from, to) {
		var result = [];
		for (var i = from; i <= to; ++i) {
			result.push(i);
		}
		return result;
	},

	drawLine: function(startX, startY, lenX, lenY, color) {
		return;
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

TitleScreen = ig.Game.extend({

	font: new ig.Font('media/04b03.font.png'),
	baseMusic: new ig.Sound('media/music/base.*'),
	chaseMusic: new ig.Sound('media/music/chase.*'),
	endingMusic: new ig.Sound('media/music/ending.*'),
	titleImage: new ig.Image('media/intro.png'),

	init: function() {
		ig.input.bind(ig.KEY.SPACE, 'play');

		ig.music.add(this.baseMusic, 'base');
		ig.music.add(this.chaseMusic, 'chase');
		ig.music.add(this.endingMusic, 'ending');
		ig.music.loop = true;
		ig.music.volume = 1;
	},

	update: function() {
		this.parent();

		if (ig.input.pressed('play')) {
			ig.system.setGame(GameScreen);
		}
	},

	draw: function() {
		this.parent();
		this.titleImage.draw(0, 0);
	}

});

LoseScreen = ig.Game.extend({
	font: new ig.Font('media/04b03.font.png'),
	verb: 'LASTED',

	init: function() {
		ig.music.stop();
		ig.input.bind(ig.KEY.SPACE, 'continue');
	},

	update: function() {
		this.parent();

		if (ig.input.pressed('continue')) {
			ig.system.setGame(TitleScreen);
		}
	},

	draw: function() {
		this.parent();

		var secondsTakenInt = parseInt('' + Math.floor(window.secondsTaken));
		this.font.draw('YOU ' + this.verb + ' ' + secondsTakenInt + ' SECONDS', ig.system.width / 2, (ig.system.height / 2) - 100, ig.Font.ALIGN.CENTER);
		this.font.draw('PRESS SPACE TO CONTINUE', ig.system.width / 2, ig.system.height / 2, ig.Font.ALIGN.CENTER);
	}
});

WinScreen = LoseScreen.extend({
	verb: 'TOOK'
});

GameScreen = ig.Game.extend({

	INITIAL_STALL_TIME: 0,
	PAN_TIME: 0,
	GIRL_MUSIC_RANGE_SQUARED: 160000,

	gameplayTimer: null,
	gamePlaying: false,
	initialStallTimer: null,
	lionStallTimer: null,
	panTimer: null,
	playerBeingChased: false,
	playerInRangeOfGirl: false,
	
	init: function() {
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.S, 'down');
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.D, 'right');
		ig.input.bind(ig.KEY.ENTER, 'action');
		ig.input.bind(ig.KEY.SHIFT, 'sneak');

		this.loadLevel(LevelLevel1);
	},
	
	update: function() {
		this.parent();
		
		if (this.gamePlaying) {
			this.updateGameplay();
		} else {
			this.updateInitialPan();
		}
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

	updateGameplay: function() {
		this.moveCameraToPlayer();
		var playerBeingChasedNow = this.isPlayerBeingChased();
		if (!this.playerBeingChased && playerBeingChasedNow) {
			ig.music.play('chase');
		} else if (this.playerBeingChased && !playerBeingChasedNow) {
			if (this.isPlayerInRangeOfGirl()) {
				this.playerInRangeOfGirl = true;
				ig.music.play('ending');
			} else {
				ig.music.play('base');
			}
		}
		this.playerBeingChased = playerBeingChasedNow;

		var playerInRangeOfGirlNow = this.isPlayerInRangeOfGirl();
		if (!this.playerBeingChased) {
			if (!this.playerInRangeOfGirl && playerInRangeOfGirlNow) {
				ig.music.play('ending');
			} else if (this.playerInRangeOfGirl && !playerInRangeOfGirlNow) {
				ig.music.play('base');
			}
		}
		this.playerInRangeOfGirl = playerInRangeOfGirlNow;
	},

	updateInitialPan: function() {
		if (!this.initialStallTimer) {
			this.initialStallTimer = new ig.Timer();
		}
		if (this.initialStallTimer.delta() < this.INITIAL_STALL_TIME) {
			var girl = this.getGirl();
			if (girl) {
				ig.game.screen.x = girl.center().x - (ig.system.width / 2);
				ig.game.screen.y = girl.center().y - (ig.system.height / 2);
			}
			return;
		}

		if (!this.panTimer) {
			this.panTimer = new ig.Timer();
		}

		var percentage = this.panTimer.delta() / this.PAN_TIME;
		var girl = this.getGirl();
		var lion = this.getLion();
		if (percentage >= 1) {
			if (!this.lionStallTimer) {
				this.lionStallTimer = new ig.Timer();
			}
			if (this.lionStallTimer.delta() < this.INITIAL_STALL_TIME) {
				if (lion) {
					ig.game.screen.x = lion.center().x - (ig.system.width / 2);
					ig.game.screen.y = lion.center().y - (ig.system.height / 2);
				}
				return;
			}

			var player = this.getPlayer();
			percentage = ((this.panTimer.delta() - this.INITIAL_STALL_TIME) / this.PAN_TIME) - 1;
			if (lion && player) {
				if (percentage >= 1) {
					this.startGame();
				} else {
					ig.game.screen.x = ig.Utils.lerp(lion.center().x, player.center().x, percentage) - (ig.system.width / 2);
					ig.game.screen.y = ig.Utils.lerp(lion.center().y, player.center().y, percentage) - (ig.system.height / 2);
				}
			} else {
				this.startGame();
			}
		} else {
			if (girl && lion) {
				ig.game.screen.x = ig.Utils.lerp(girl.center().x, lion.center().x, percentage) - (ig.system.width / 2);
				ig.game.screen.y = ig.Utils.lerp(girl.center().y, lion.center().y, percentage) - (ig.system.height / 2);
			} else {
				this.startGame();
			}
		}
	},

	startGame: function() {
		this.panTimer = null;
		this.gamePlaying = true;
	},

	isPlayerBeingChased: function() {
		var dogEntities = ig.game.getEntitiesByType('EntityDog');
		for (var i = 0; i < dogEntities.length; ++i) {
			if (!dogEntities[i].patroling) {
				return true;
			}
		}

		var lionEntities = ig.game.getEntitiesByType('EntityLion');
		for (var i = 0; i < lionEntities.length; ++i) {
			if (lionEntities[i].chasingPlayer) {
				return true;
			}
		}

		return false;
	},

	isPlayerInRangeOfGirl: function() {
		var player = this.getPlayer();
		var girl = this.getGirl();
		if (player && girl) {
			return ig.Utils.getDistanceSquaredBetweenEntities(player, girl) < this.GIRL_MUSIC_RANGE_SQUARED;
		}
		return false;
	},

	win: function() {
		window.secondsTaken = this.gameplayTimer.delta();
		ig.system.setGame(WinScreen);
	},

	lose: function(reason) {
		console.log('LOSE REASON: ' + reason);

		switch (reason) {
		case 'player caught by dog':
		case 'player caught by lion': {
				var player = this.getPlayer();
				if (player) {
					player.kill();
				}
			}
			break;

		case 'girl caught by lion': {
				// something
			}
			break;

		case 'player seen by girl': {
				// something
			}
			break;

		default: break;
		}

		window.secondsTaken = this.gameplayTimer.delta();
		ig.system.setGame(LoseScreen);
	},

	loadLevel: function(level) {
		this.parent(level);
		this.afterLevelLoadForEntitiesOfType('EntityWaypoint');
		this.afterLevelLoadForEntitiesOfType('EntityDog');
		this.afterLevelLoadForEntitiesOfType('EntityLion');

		this.gameplayTimer = new ig.Timer();
		ig.music.play('base');
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
		ig.game.screen.x = 0;
		ig.game.screen.y = 0;
		return;
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
	},

	getLion: function() {
		return ig.game.getEntitiesByType('EntityLion')[0];
	}
});

ig.main('#canvas', TitleScreen, 60, 1280, 832, 1);

});
