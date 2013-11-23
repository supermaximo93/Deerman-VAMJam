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

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    speed: 200,
    meatToFollow: null,
    direction: { x: 0, y: 0 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    },

    afterLevelLoad: function() {
      this.getGirlPath();
    },

    update: function() {
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
        this.getPath(this.meatToFollow.pos.x, this.meatToFollow.pos.y, true);
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

      this.parent();
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
      this.getPath(girl.pos.x, girl.pos.y, true);
    }

  });
});