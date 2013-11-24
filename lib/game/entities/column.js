ig.module(
  'game.entities.column'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityColumn = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/column.png', 154, 270),
    size: { x: 64, y: 64 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
