ig.module(
  'game.entities.pool'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityPool = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/pool.png', 454, 348),
    size: { x: 454, y: 348 },
    forceBottom: true,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1.0 / 20.0, ig.Utils.getNumberRangeArray(0, 19));
    }

  });
});
