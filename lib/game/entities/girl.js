ig.module(
  'game.entities.girl'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGirl = ig.Entity.extend({

    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 10,

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    direction: { x: 0, y: 0 },
    directionAngle: 0,
    directionAngleSpeed: 1,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      this.updateDirection();

      if (this.canSeePlayer()) {
        console.log('YOU LOSE!');
      }

      this.parent();
    },

    updateDirection: function() {
      this.directionAngle += this.directionAngleSpeed * ig.system.tick;
      this.direction = {
        x: Math.cos(this.directionAngle),
        y: Math.sin(this.directionAngle)
      };
      this.direction = ig.Utils.normalize(this.direction);
    },

    canSeePlayer: function() {
      if (ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getPlayer()) > this.SIGHT_RANGE_SQUARED) {
        return false;
      }

      var directionToPlayer = ig.Utils.getDirectionToEntity(this, ig.game.getPlayer());
      var angleToPlayer = ig.Utils.angleBetweenVectorsDegrees(this.direction, directionToPlayer);
      if (Math.abs(angleToPlayer) > this.SIGHT_ANGLE)
        return false;

      var distance = ig.Utils.getDistanceVectorBetweenEntities(ig.game.getPlayer(), this);
      var hitscanResult = ig.game.collisionMap.trace(this.pos.x, this.pos.y, distance.x, distance.y, 2, 2);
      return !hitscanResult.collision.x && !hitscanResult.collision.y;
    }

  });
});
