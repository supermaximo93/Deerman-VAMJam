ig.module(
  'game.entities.columnA'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityColumnA = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/columnA.png', 32, 128),
    size: { x: 32, y: 128 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [this.b ? 1 : 0]);
    }

  });
});
