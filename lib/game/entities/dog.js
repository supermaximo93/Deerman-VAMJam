ig.module(
  'game.entities.dog'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityDog = ig.Entity.extend({

    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 30,

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 700, y: 700 },
    patrolSpeed: 300,
    chaseSpeed: 500,
    pathName: null,
    waypointPath: null,
    nextWaypoint: null,
    previousDistanceVectorToNextWaypoint: { x: 0, y: 0 },
    patroling: true,
    followingAStarPath: false,
    direction: { x: 0, y: 0 },

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
    },

    afterLevelLoad: function() {
      this.getFirstWaypointAndPath();
    },

    update: function() {
      this.parent();

      if (this.patroling) {
        if (this.followingAStarPath) {
          this.updateAStarPathFollow();
        } else {
          this.updateWaypointPatrol();
        }
      } else {
        this.updatePlayerChase();
      }

      var canSeePlayer = this.canSeePlayer();
      if (!this.patroling && !canSeePlayer) {
        this.nextWaypoint = this.getClosestWaypoint();
        this.getPath(this.nextWaypoint.pos.x, this.nextWaypoint.pos.y, true);
        this.followingAStarPath = true;
      } else if (this.patroling && canSeePlayer) {
        this.followingAStarPath = false;
      }
      this.patroling = !canSeePlayer;
    },

    updateAStarPathFollow: function() {
      this.followPath(this.patrolSpeed, false);
      if (ig.Utils.getDistanceSquaredBetweenEntities(this, this.nextWaypoint) < 10000) {
        this.followingAStarPath = false;
      }
    },

    updateWaypointPatrol: function() {
      if (!this.nextWaypoint) {
        return;
      }

      var distanceVectorToNextWaypoint = ig.Utils.getDistanceVectorBetweenEntities(this, this.nextWaypoint);
      if (ig.Utils.signDifference(distanceVectorToNextWaypoint.x, this.previousDistanceVectorToNextWaypoint.x)) {
        this.pos.x = this.nextWaypoint.pos.x;
      }
      if (ig.Utils.signDifference(distanceVectorToNextWaypoint.y, this.previousDistanceVectorToNextWaypoint.y)) {
        this.pos.y = this.nextWaypoint.pos.y;
      }

      distanceVectorToNextWaypoint = ig.Utils.getDistanceVectorBetweenEntities(this, this.nextWaypoint);

      if (distanceVectorToNextWaypoint.x == 0 && distanceVectorToNextWaypoint.y == 0) {
        this.nextWaypoint = this.nextWaypoint.nextWaypoint;
      }
      this.previousDistanceVectorToNextWaypoint = distanceVectorToNextWaypoint;

      this.direction = ig.Utils.getDirectionToEntity(this, this.nextWaypoint);
      this.vel.x = this.direction.x * this.patrolSpeed;
      this.vel.y = this.direction.y * this.patrolSpeed;
    },

    updatePlayerChase: function() {
      this.direction = ig.Utils.getDirectionToEntity(this, ig.game.getPlayer());
      this.vel.x = this.direction.x * this.chaseSpeed;
      this.vel.y = this.direction.y * this.chaseSpeed;
    },

    getFirstWaypointAndPath: function() {
      if (!this.pathName) {
        return;
      }

      var firstWaypoint = ig.game.getEntityByName(this.pathName + '-A');
      if (!firstWaypoint)
        return;

      this.waypointPath = firstWaypoint.getFullPath();
      this.nextWaypoint = this.getClosestWaypoint();
    },

    getClosestWaypoint: function() {
      var smallestDistanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, this.waypointPath[0]);
      var closestWaypoint = this.waypointPath[0];

      for (var i = 1; i < this.waypointPath.length; ++i) {
        var distanceSquared = ig.Utils.getDistanceSquaredBetweenEntities(this, this.waypointPath[i]);
        if (distanceSquared < smallestDistanceSquared) {
          closestWaypoint = this.waypointPath[i];
          smallestDistanceSquared = distanceSquared;
        }
      }

      return closestWaypoint;
    },

    canSeePlayer: function() {
      if (ig.Utils.getDistanceSquaredBetweenEntities(this, ig.game.getPlayer()) > this.SIGHT_RANGE_SQUARED) {
        return false;
      }

      var directionToPlayer = ig.Utils.getDirectionToEntity(this, ig.game.getPlayer());
      var angleToPlayer = ig.Utils.angleBetweenVectorsDegrees(this.direction, directionToPlayer);
      if (angleToPlayer > this.SIGHT_ANGLE)
        return false;

      var distance = ig.Utils.getDistanceVectorBetweenEntities(ig.game.getPlayer(), this);
      var hitscanResult = ig.game.collisionMap.trace(this.pos.x, this.pos.y, distance.x, distance.y, 2, 2);
      return !hitscanResult.collision.x && !hitscanResult.collision.y;
    }

  });
});
