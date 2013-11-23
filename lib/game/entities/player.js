ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPlayer = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 500, y: 500 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      var velocity = { x: 0, y: 0 };
      if (ig.input.state('up')) {
        velocity.y -= this.maxVel.y;
      }
      if (ig.input.state('down')) {
        velocity.y += this.maxVel.y;
      }
      if (ig.input.state('left')) {
        velocity.x -= this.maxVel.x;
      }
      if (ig.input.state('right')) {
        velocity.x += this.maxVel.x;
      }

      this.vel = velocity;
      this.parent();
    }

  });
});
