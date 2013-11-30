ig.module(
  'game.entities.meat'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMeat = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/sandwich.png', 144, 95),
    size: { x: 124, y: 75 },
    offset: { x: 10 , y: 10 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
