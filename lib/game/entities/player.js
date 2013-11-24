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
    size: { x: 88, y: 88 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 500, y: 500 },
    normalSpeed: 500,
    sneakSpeed: 200,
    sneaking: false,
    meatCount: 1,
    lastWalkAnimationName: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idleUp', 1, [0]);
      this.addAnim('idleDown', 1, [29]);
      this.addAnim('idleLeft', 1, [58]);
      this.addAnim('idleRight', 1, [87]);
      this.addAnim('walkUp', 1.0 / 60.0, ig.Utils.getNumberRangeArray(0, 28))
      this.addAnim('walkDown', 1.0 / 60.0, ig.Utils.getNumberRangeArray(29, 57));
      this.addAnim('walkLeft', 1.0 / 60.0, ig.Utils.getNumberRangeArray(58, 86));
      this.addAnim('walkRight', 1.0 / 60.0, ig.Utils.getNumberRangeArray(87, 115));
      this.addAnim('sneakUp', 1.0 / 24.0, ig.Utils.getNumberRangeArray(0, 28))
      this.addAnim('sneakDown', 1.0 / 24.0, ig.Utils.getNumberRangeArray(29, 57));
      this.addAnim('sneakLeft', 1.0 / 24.0, ig.Utils.getNumberRangeArray(58, 86));
      this.addAnim('sneakRight', 1.0 / 24.0, ig.Utils.getNumberRangeArray(87, 115));
      this.currentAnim = this.anims.idleDown;
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
      this.sneaking = ig.input.state('sneak');

      if (direction.x != 0 || direction.y != 0) {
        if (direction.y > 0) {
          this.lastWalkAnimationName = 'Down';
        } else if (direction.y < 0) {
          this.lastWalkAnimationName = 'Up';
        } else if (direction.x < 0) {
          this.lastWalkAnimationName = 'Left';
        } else if (direction.x > 0) {
          this.lastWalkAnimationName = 'Right';
        }
        this.lastWalkAnimationName = (this.sneaking ? 'sneak' : 'walk') + this.lastWalkAnimationName;
        this.currentAnim = this.anims[this.lastWalkAnimationName];
        direction = ig.Utils.normalize(direction);
      } else if (this.lastWalkAnimationName) {
        this.currentAnim = this.anims[this.lastWalkAnimationName.replace('walk', 'idle').replace('sneak', 'idle')];
        this.lastWalkAnimationName = null;
      }

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
