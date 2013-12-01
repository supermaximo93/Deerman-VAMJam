ig.module(
  'game.entities.alert'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityAlert = ig.Entity.extend({

    size: { x: 64, y: 64 },
    forceTop: true,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1.0 / 20.0, ig.Utils.getNumberRangeArray(0, 9));
    }

  });

  EntityQMark = EntityAlert.extend({
    animSheet: new ig.AnimationSheet('media/qmark.png', 64, 64)
  });

  EntityXMark = EntityAlert.extend({
    animSheet: new ig.AnimationSheet('media/xmark.png', 64, 64)
  });
});
