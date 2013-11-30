ig.module(
  'game.entities.lion'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityLion = ig.Entity.extend({

    MEAT_RANGE_SQUARED: 1000000,
    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 45,
    ALERT_INPUT_TIMEOUT: 0.4,
    ALERT_COMPLETE_TIMEOUT: 1.5,
    HEARING_RANGE_SQUARED: 250000,

    animSheet: new ig.AnimationSheet('media/lion.png', 223, 230),
    size: { x: 101, y: 100 },
    offset: { x: 61, y: 100 },
    maxVel: { x: 100, y: 100 },
    speed: 100,
    chaseSpeed: 200,
    meatToFollow: null,
    direction: { x: 0, y: 0 },
    chasingPlayer: false,
    alertedTimer: null,
    lastWalkAnimationName: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idleLeft', 1, [60])
      this.addAnim('idleRight', 1, [90]);
      this.addAnim('idleDown', 1, [30]);
      this.addAnim('idleUp', 1, [0]);
      this.addAnim('walkLeft', 1.0 / 30.0, ig.Utils.getNumberRangeArray(60, 89));
      this.addAnim('walkRight', 1.0 / 30.0, ig.Utils.getNumberRangeArray(90, 119));
      this.addAnim('walkDown', 1.0 / 30.0, ig.Utils.getNumberRangeArray(30, 59));
      this.addAnim('walkUp', 1.0 / 30.0, ig.Utils.getNumberRangeArray(0, 29));
      this.addAnim('runLeft', 1.0 / 40.0, ig.Utils.getNumberRangeArray(60, 89));
      this.addAnim('runRight', 1.0 / 40.0, ig.Utils.getNumberRangeArray(90, 119));
      this.addAnim('runDown', 1.0 / 40.0, ig.Utils.getNumberRangeArray(30, 59));
      this.addAnim('runUp', 1.0 / 40.0, ig.Utils.getNumberRangeArray(0, 29));

      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
      this.canHearPlayer = window.canHearPlayerFunction.bind(this);
    },

    afterLevelLoad: function() {
      this.getGirlPath();
    },

    update: function() {
      if (!ig.game.gamePlaying) {
        this.parent();
        return;
      }

      if (this.alertedTimer) {
        if (this.alertedTimer.delta() >= this.ALERT_INPUT_TIMEOUT) {
          if (this.canHearPlayer(true)) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
            this.chasingPlayer = true;
            this.updatePlayerChase();
          } else if (this.alertedTimer.delta() >= this.ALERT_COMPLETE_TIMEOUT) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
            this.getGirlPath();
            this.updatePathFollow();
          }
        }
      } else {
        var canSeePlayer = this.canSeePlayer();
        if (!canSeePlayer && this.chasingPlayer) {
          this.getGirlPath();
        }

        if (!canSeePlayer && this.canHearPlayer() && !this.alertedTimer) {
          this.alertedTimer = new ig.Timer();
          this.meatToFollow = null;
          this.vel.x = 0;
          this.vel.y = 0;
          this.lineColor = 'rgba(255, 0, 0, 1)';
        } else {
          this.chasingPlayer = canSeePlayer;
          if (this.chasingPlayer) {
            this.meatToFollow = null;
            this.updatePlayerChase();
          } else {
            this.updatePathFollow();
          }
        }
      }

      if (this.vel.x != 0 || this.vel.y != 0) {
        var dir = ig.Utils.normalize(this.vel);
        var oneOverRootTwo = 0.7071067811865475;
        if (dir.y >= oneOverRootTwo) {
          this.lastWalkAnimationName = 'Down';
        } else if (dir.y <= -oneOverRootTwo) {
          this.lastWalkAnimationName = 'Up';
        } else if (dir.x <= -oneOverRootTwo) {
          this.lastWalkAnimationName = 'Left';
        } else {
          this.lastWalkAnimationName = 'Right';
        }
        this.lastWalkAnimationName = (this.chasingPlayer ? 'run' : 'walk') + this.lastWalkAnimationName;
        this.currentAnim = this.anims[this.lastWalkAnimationName];
      } else if (this.lastWalkAnimationName) {
        this.currentAnim = this.anims[this.lastWalkAnimationName.replace('walk', 'idle').replace('run', 'idle')];
        this.lastWalkAnimationName = null;
      }

      this.parent();
    },

    updatePlayerChase: function() {
      var player = ig.game.getPlayer();
      if (player) {
        this.direction = ig.Utils.getDirectionToEntity(this, player);
        this.vel.x = this.direction.x * this.chaseSpeed;
        this.vel.y = this.direction.y * this.chaseSpeed;
      }
    },

    updatePathFollow: function() {
      var closestMeatEntity = this.getClosestMeat();
      var pathFindMeat = false;
      if (closestMeatEntity) {
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, closestMeatEntity);
        if (distanceSquared < this.MEAT_RANGE_SQUARED) {
          pathFindMeat = this.meatToFollow == null;
          this.meatToFollow = closestMeatEntity;
        }
      }

      if (pathFindMeat) {
        this.getPath(this.meatToFollow.center().x, this.meatToFollow.center().y, true);
      }

      this.followPath(this.speed, false);
      this.direction = ig.Utils.normalize(this.vel);

      if (this.meatToFollow) {
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, this.meatToFollow);
        if (this.touches(this.meatToFollow)) {
          this.meatToFollow.kill();
          this.meatToFollow = null;
          this.getGirlPath();
        }
      } else {
        var girl = ig.game.getGirl();
        var player = ig.game.getPlayer();
        if (girl && this.touches(girl)) {
          ig.game.lose('girl caught by lion');
        } else if (player && this.touches(player)) {
          ig.game.lose('player caught by lion');
        }
      }
    },

    getClosestMeat: function() {
      var meatEntities = ig.game.getEntitiesByType('EntityMeat');
      if (meatEntities.length == 0)
        return null;

      var closestMeatEntity = meatEntities[0];
      var smallestDistanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, meatEntities[0]);
      for (var i = 1; i < meatEntities.length; ++i) {
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, meatEntities[i]);
        if (distanceSquared < smallestDistanceSquared) {
          smallestDistanceSquared = distanceSquared;
          closestMeatEntity = meatEntities[i];
        }
      }

      return closestMeatEntity;
    },

    getGirlPath: function() {
      var girl = ig.game.getGirl();
      this.getPath(girl.center().x, girl.center().y, true);
    },

    canSeePlayer: function() { return false; },

    canHearPlayer: function() { return false; }

  });
});
