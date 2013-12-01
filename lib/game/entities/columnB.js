ig.module(
  'game.entities.columnB'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityColumnB = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/columnB.png', 64, 128),
    size: { x: 64, y: 128 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [this.b ? 1 : 0]);
    }

  });
});
