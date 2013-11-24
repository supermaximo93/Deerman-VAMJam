ig.module(
  'game.entities.meat'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMeat = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/sandwich.png', 144, 95),
    size: { x: 144, y: 95 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
