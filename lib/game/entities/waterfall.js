ig.module(
  'game.entities.waterfall'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityWaterfall = ig.Entity.extend({

    animSheet: new ig.AnimationSheet('media/waterfall.png', 206, 312),
    size: { x: 206, y: 312 },
    forceTop: true,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1.0 / 20.0, ig.Utils.getNumberRangeArray(0, 29));
    }

  });
});
