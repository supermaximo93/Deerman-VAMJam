ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'game.entities.meat'
)
.defines(function() {
  EntityPlayer = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 500, y: 500 },
    normalSpeed: 500,
    sneakSpeed: 200,
    sneaking: false,
    meatCount: 1,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    },

    update: function() {
      if (!ig.game.gamePlaying) {
        this.parent();
        return;
      }
      
      var direction = { x: 0, y: 0 };
      if (ig.input.state('up')) {
        direction.y -= 1;
      }
      if (ig.input.state('down')) {
        direction.y += 1;
      }
      if (ig.input.state('left')) {
        direction.x -= 1;
      }
      if (ig.input.state('right')) {
        direction.x += 1;
      }
      if (direction.x != 0 || direction.y != 0) {
        direction = ig.Utils.normalize(direction);
      }

      this.sneaking = ig.input.state('sneak');
      var speed = this.sneaking ? this.sneakSpeed : this.normalSpeed;
      this.vel.x = direction.x * speed;
      this.vel.y = direction.y * speed;

      if (ig.input.pressed('action') && this.meatCount > 0) {
        --this.meatCount;
        ig.game.spawnEntity('EntityMeat', this.center().x, this.center().y, {});
      }

      this.parent();
    }

  });
});
