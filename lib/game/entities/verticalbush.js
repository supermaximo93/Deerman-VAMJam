ig.module(
  'game.entities.verticalbush'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityVerticalbush = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/verticalbush.png', 64, 128),
    size: { x: 64, y: 128 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
