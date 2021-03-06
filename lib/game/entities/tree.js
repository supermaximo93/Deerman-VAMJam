ig.module(
  'game.entities.tree'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityTree = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/tree.png', 64, 128),
    size: { x: 64, y: 128 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
