ig.module(
  'game.entities.meat'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityMeat = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    }

  });
});
