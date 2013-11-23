ig.module(
  'game.entities.waypoint'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityWaypoint = ig.Entity.extend({

    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 255, 1)',
    size: { x: 128, y: 128 },
    nextWaypoint: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
    },

    afterLevelLoad: function() {
      this.assignNextWaypoint();
    },

    assignNextWaypoint: function() {
      if (this.target) {
        this.nextWaypoint = ig.game.getEntityByName(this.target[0]);
      }
    },

    getFullPath: function() {
      result = [this];

      if (this.nextWaypoint) {
        var currentWayPoint = this.nextWaypoint;
        while (currentWayPoint != this) {
          result.push(currentWayPoint);
          currentWayPoint = currentWayPoint.nextWaypoint;
        }
      }

      return result;
    }

  });
});
