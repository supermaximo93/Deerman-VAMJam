ig.module(
  'game.entities.rock'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityRock = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/rock.png', 64, 64),
    size: { x: 64, y: 64 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
