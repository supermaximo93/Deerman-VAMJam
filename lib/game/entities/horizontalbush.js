ig.module(
  'game.entities.horizontalbush'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityHorizontalbush = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/horizontalbush.png', 128, 64),
    size: { x: 128, y: 64 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
