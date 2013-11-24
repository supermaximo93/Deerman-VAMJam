ig.module(
  'game.entities.lion'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityLion = ig.Entity.extend({

    MEAT_RANGE_SQUARED: 1000000,
    MEAT_EAT_RANGE_SQUARED: 2500,
    GIRL_EAT_RANGE_SQUARED: 5000,
    PLAYER_EAT_RANGE_SQUARED: 2500,
    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 45,
    ALERT_INPUT_TIMEOUT: 0.4,
    ALERT_COMPLETE_TIMEOUT: 1.5,
    HEARING_RANGE_SQUARED: 250000,

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 200, y: 200 },
    speed: 200,
    chaseSpeed: 500,
    meatToFollow: null,
    direction: { x: 0, y: 0 },
    chasingPlayer: false,
    alertedTimer: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
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
        if (distanceSquared <= this.MEAT_EAT_RANGE_SQUARED) {
          this.meatToFollow.kill();
          this.meatToFollow = null;
          this.getGirlPath();
        }
      } else {
        if (ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getGirl()) < this.GIRL_EAT_RANGE_SQUARED) {
          ig.game.lose('girl caught by lion');
        } else if (ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getGirl()) < this.PLAYER_EAT_RANGE_SQUARED) {
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
