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
    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 30,

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 200, y: 200 },
    speed: 200,
    chaseSpeed: 500,
    meatToFollow: null,
    direction: { x: 0, y: 0 },
    chasingPlayer: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
    },

    afterLevelLoad: function() {
      this.getGirlPath();
    },

    update: function() {
      var canSeePlayer = this.canSeePlayer();
      if (!canSeePlayer) {
        if (this.chasingPlayer) {
          this.getGirlPath();
        }
      }

      this.chasingPlayer = canSeePlayer;
      if (this.chasingPlayer) {
        this.meatToFollow = null;
        this.updatePlayerChase();
      } else {
        this.updatePathFollow();
      }

      this.parent();
    },

    updatePlayerChase: function() {
      this.direction = ig.Utils.getDirectionToEntity(this, ig.game.getPlayer());
      this.vel.x = this.direction.x * this.chaseSpeed;
      this.vel.y = this.direction.y * this.chaseSpeed;
    },

    updatePathFollow: function() {
      var closestMeatEntity = this.getClosestMeat();
      var pathFindMeat = false;
      if (closestMeatEntity) {
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, closestMeatEntity);
        if (distanceSquared <= this.MEAT_RANGE_SQUARED) {
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
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getGirl());
        if (distanceSquared <= this.GIRL_EAT_RANGE_SQUARED) {
          ig.game.lose();
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

    canSeePlayer: function() { return false; }

  });
});
