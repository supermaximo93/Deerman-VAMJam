ig.module(
  'game.entities.tree'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityTree = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/tree.png', 130, 153),
    size: { x: 130, y: 153 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
