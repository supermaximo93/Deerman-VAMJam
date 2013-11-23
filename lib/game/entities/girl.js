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
      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
    },

    update: function() {
      this.updateDirection();

      if (this.canSeePlayer()) {
        ig.game.lose('girl saw player');
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

    canSeePlayer: function() { return false; }

  });
});
