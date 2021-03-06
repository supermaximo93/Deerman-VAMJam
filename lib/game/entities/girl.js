ig.module(
  'game.entities.girl'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityGirl = ig.Entity.extend({

    SIGHT_RANGE_SQUARED: 90000,
    SIGHT_ANGLE: 10,

    animSheet: new ig.AnimationSheet('media/girl.png', 667, 337),
    size: { x: 180, y: 180 },
    offset: { x: 200, y: 10 },
    direction: { x: 0, y: 0 },
    directionAngleSpeed: 0.5,
    clockwise: true,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1.0 / 30.0, ig.Utils.getNumberRangeArray(0, 59));
      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
    },

    update: function() {
      this.updateDirection();

      if (!ig.game.gamePlaying) {
        this.parent();
        return;
      }

      if (this.canSeePlayer()) {
        ig.game.lose('player seen by girl');
      } else {
        var player = ig.game.getPlayer();
        if (player) {
          if (this.touches(player)) {
            ig.game.win();
          }
        }
      }

      this.parent();
    },

    updateDirection: function() {
      var percentage = this.currentAnim.frame / 30.0;
      var directionAngle;
      if (percentage > 1) {
        percentage -= 1;
        directionAngle = ig.Utils.lerp(Math.PI * 0.85, Math.PI * 0.1, percentage);
      } else {
        directionAngle = ig.Utils.lerp(Math.PI * 0.1, Math.PI * 0.85, percentage);
      }
      this.direction = {
        x: Math.cos(directionAngle),
        y: Math.sin(directionAngle)
      };
      this.direction = ig.Utils.normalize(this.direction);
    },

    center: function() {
      var center = {
        x: this.pos.x + (this.size.x / 2),
        y: this.pos.y + (this.size.y / 2)
      };
      return {
        x: center.x + 10,
        y: center.y - 60
      };
    },

    canSeePlayer: function() { return false; }

  });
});
