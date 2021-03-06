window.DEBUG = false;

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


window.setAlert = function(alertType) {
  if (this.alertEntity) {
    this.alertEntity.kill();
  }

  if (alertType) {
    this.alertEntity = ig.game.spawnEntity(alertType, 0, 0);
    this.updateAlert();
  } else {
    this.alertEntity = null;
  }
};

window.updateAlert = function() {
  if (this.alertEntity) {
    this.alertEntity.pos.x = this.center().x - (this.alertEntity.size.x / 2);
    this.alertEntity.pos.y = this.pos.y - this.offset.y;
  }
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

	clamp: function(x, min, max) {
		if (x < min) {
			return min;
		}
		if (x > max) {
			return max;
		}
		return x;
	},

	getNumberRangeArray: function(from, to) {
		var result = [];
		for (var i = from; i <= to; ++i) {
			result.push(i);
		}
		return result;
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
	'game.levels.level1',
	'game.entities.dog',
	'game.entities.waypoint',
	'game.entities.lion'
)
.defines(function() {

var SCREEN_SIZE = {
	x: 1280,
	y: 832
};

ig.Entity.prototype.center = function() {
	return {
		x: this.pos.x + (this.size.x / 2),
		y: this.pos.y + (this.size.y / 2)
	};
};

ig.Entity.prototype.setZIndex = function() {
	this.zIndex = this.pos.y + this.size.y;
};

TitleScreen = ig.Game.extend({

	font: new ig.Font('media/04b03.font.png'),
	baseMusic: new ig.Sound('media/music/base.*'),
	chaseMusic: new ig.Sound('media/music/chase.*'),
	endingMusic: new ig.Sound('media/music/ending.*'),
	titleImage: new ig.Image('media/intro.png'),
	instructionsImage: new ig.Image('media/instructions.png'),
	imageToDraw: null,

	init: function() {
		ig.input.unbindAll();
		setTimeout(function() {
			for (var key in ig.KEY) {
				if (key.indexOf('MOUSE') < 0 && key.indexOf('MWHEEL') < 0 && key != 'R' && key != 'J') {
					ig.input.bind(ig.KEY[key], 'next');
				}
			}
		}, 200);

		ig.music.add(this.baseMusic, 'base');
		ig.music.add(this.chaseMusic, 'chase');
		ig.music.add(this.endingMusic, 'ending');
		ig.music.loop = true;
		ig.music.volume = 1;

		this.imageToDraw = this.titleImage;
	},

	update: function() {
		this.parent();

		if (ig.input.pressed('next')) {
			if (this.imageToDraw == this.titleImage) {
				this.imageToDraw = this.instructionsImage;
			} else {
				ig.system.setGame(GameScreen);
			}
		}
	},

	draw: function() {
		this.parent();
		this.imageToDraw.draw(0, 0);
	}

});

LoseScreen = ig.Game.extend({
	eatenLoseImage: new ig.Image('media/losescreen.png'),
	seenLoseImage: new ig.Image('media/goddeath.png'),
	lionCaughtGirlImage: new ig.Image('media/liondeath.png'),
	
	imageToDraw: null,

	init: function() {
		ig.music.stop();

		ig.input.unbindAll();
		setTimeout(function() {
			for (var key in ig.KEY) {
				if (key.indexOf('MOUSE') < 0 && key.indexOf('MWHEEL') < 0 && key != 'R' && key != 'J') {
					ig.input.bind(ig.KEY[key], 'next');
				}
			}
		}, 200);

		this.pickImageToShow();
	},

	update: function() {
		this.parent();

		if (ig.input.pressed('next')) {
			ig.system.setGame(TitleScreen);
		}
	},

	draw: function() {
		this.parent();
		this.imageToDraw.draw(0, 0);
	},

	pickImageToShow: function() {
		switch (LoseScreen.reason) {
		case 'girl caught by lion':
			this.imageToDraw = this.lionCaughtGirlImage;
			break;
		case 'player seen by girl':
			this.imageToDraw = this.seenLoseImage;
			break;
		default:
			this.imageToDraw = this.eatenLoseImage;
			break;
		}
	}
});

WinScreen = LoseScreen.extend({
	titleImage: new ig.Image('media/winscreen.png'),

	init: function() {
		this.parent();
		ig.music.play('ending');
	},

	draw: function() {
		this.parent();
		this.titleImage.draw(0, 0);
	}
});

GameScreen = ig.Game.extend({

	INITIAL_STALL_TIME: 1,
	PAN_TIME: 1,
	GIRL_MUSIC_RANGE_SQUARED: 160000,

	gamePlaying: false,
	initialStallTimer: null,
	lionStallTimer: null,
	panTimer: null,
	playerBeingChased: false,
	playerInRangeOfGirl: false,
	
	init: function() {
		ig.input.unbindAll();
		ig.input.bind(ig.KEY.UP_ARROW, 'up');
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind(ig.KEY.W, 'up');
		ig.input.bind(ig.KEY.S, 'down');
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.D, 'right');
		ig.input.bind(ig.KEY.SPACE, 'action');
		ig.input.bind(ig.KEY.SHIFT, 'sneak');

		LoseScreen.reason = '';

		this.loadLevel(LevelLevel1);

		if (this.levelFitsInView()) {
			this.INITIAL_STALL_TIME = 0;
			this.PAN_TIME = 0;
		}
	},
	
	update: function() {
		this.parent();
		
		this.depthSortEntities();

		if (this.gamePlaying) {
			this.updateGameplay();
		} else {
			this.updateInitialPan();
		}
		this.setCameraWithinLevelBounds();
	},
	
	draw: function() {
		this.parent();

		if (window.DEBUG) {
			this.drawDebugEntityDirectionLines();
		}
	},

	depthSortEntities: function() {
		if (this.entities.length == 0) {
			return;
		}

		var firstEntity = this.entities[0];
		firstEntity.setZIndex();
		var lowestZIndex = firstEntity.zIndex;
		var highestZIndex = firstEntity.zIndex;

		for (var i = 1; i < this.entities.length; ++i) {
			var entity = this.entities[i];
			entity.setZIndex();
			if (entity.zIndex < lowestZIndex) {
				lowestZIndex = entity.zIndex;
			} else if (entity.zIndex > highestZIndex) {
				highestZIndex = entity.zIndex;
			}
		}

		lowestZIndex = Math.abs(lowestZIndex);
		highestZIndex = Math.abs(highestZIndex);
		for (var i = 0; i < this.entities.length; ++i) {
			var entity = this.entities[i];
			if (entity.forceBottom) {
				entity.zIndex -= lowestZIndex;
			} else if (entity.forceTop) {
				entity.zIndex += highestZIndex;
			}
		}

		this.sortEntities();
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
		ig.system.setGame(WinScreen);
	},

	lose: function(reason) {
		LoseScreen.reason = reason;
		ig.system.setGame(LoseScreen);
	},

	loadLevel: function(level) {
		this.parent(level);
		this.afterLevelLoadForEntitiesOfType('EntityWaypoint');
		this.afterLevelLoadForEntitiesOfType('EntityDog');
		this.afterLevelLoadForEntitiesOfType('EntityLion');

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
	},

	levelWidth: function() {
		return this.collisionMap.data[0].length * this.collisionMap.tilesize;
	},

	levelHeight: function() {
		return this.collisionMap.data.length * this.collisionMap.tilesize;
	},

	levelFitsInView: function() {
		var padding = this.collisionMap.tilesize * 4;
		return this.levelWidth() - padding <= SCREEN_SIZE.x && this.levelHeight() - padding <= SCREEN_SIZE.y;
	},

	setCameraWithinLevelBounds: function() {
		var padding = this.collisionMap.tilesize * 2;
		ig.game.screen.x = ig.Utils.clamp(padding, this.levelWidth() - padding - SCREEN_SIZE.x);
		ig.game.screen.y = ig.Utils.clamp(padding, this.levelHeight() - padding - SCREEN_SIZE.y);
	},

	drawDebugEntityDirectionLines: function() {
		var lineLength = 200;
		for (var i = 0; i < this.entities.length; ++i) {
			var entity = this.entities[i];
			if (entity.direction) {
				ig.Utils.drawLine(entity.center().x, entity.center().y, entity.direction.x * lineLength, entity.direction.y * lineLength, entity.lineColor);
			}
		}
	}
});

ig.main('#canvas', TitleScreen, 60, SCREEN_SIZE.x, SCREEN_SIZE.y, 1);

});
