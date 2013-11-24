ig.module(
  'game.entities.dog'
)
.requires(
  'impact.entity'
)
.defines(function() {
  EntityDog = ig.Entity.extend({

    PLAYER_EAT_RANGE_SQUARED: 2500,
    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 45,
    ALERT_INPUT_TIMEOUT: 0.4,
    ALERT_COMPLETE_TIMEOUT: 1.5,
    HEARING_RANGE_SQUARED: 250000,

    animSheet: new ig.AnimationSheet('media/player.png', 128, 128),
    size: { x: 128, y: 128 },
    offset: { x: 20, y: 20 },
    maxVel: { x: 700, y: 700 },
    patrolSpeed: 300,
    chaseSpeed: 450,
    pathName: null,
    waypointPath: null,
    nextWaypoint: null,
    previousDistanceVectorToNextWaypoint: { x: 0, y: 0 },
    patroling: true,
    followingAStarPath: false,
    direction: { x: 0, y: 0 },
    alertedTimer: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idle', 1, [0]);
      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
      this.canHearPlayer = window.canHearPlayerFunction.bind(this);
    },

    afterLevelLoad: function() {
      this.getFirstWaypointAndPath();
    },

    update: function() {
      if (!ig.game.gamePlaying) {
        this.parent();
        return;
      }

      this.parent();

      if (this.alertedTimer) {
        if (this.alertedTimer.delta() >= this.ALERT_INPUT_TIMEOUT) {
          if (this.canHearPlayer(true)) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
            this.patroling = false;
            this.followingAStarPath = false;
            this.updatePlayerChase();
          } else if (this.alertedTimer.delta() >= this.ALERT_COMPLETE_TIMEOUT) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
          }
        }
      } else {
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
          this.getPath(this.nextWaypoint.center().x, this.nextWaypoint.center().y, true);
          this.followingAStarPath = true;
        } else if (this.patroling && canSeePlayer) {
          this.followingAStarPath = false;
        }
        this.patroling = !canSeePlayer;

        if (!canSeePlayer && this.canHearPlayer() && !this.alertedTimer) {
          this.alertedTimer = new ig.Timer();
          this.vel.x = 0;
          this.vel.y = 0;
          this.lineColor = 'rgba(255, 0, 0, 1)';
        }
      }

      var player = ig.game.getPlayer();
      if (player && ig.Utils.getDistanceSquaredBetweenEntities(this, player) < this.PLAYER_EAT_RANGE_SQUARED) {
        ig.game.lose('player caught by dog');
      }
    },

    updateAStarPathFollow: function() {
      this.followPath(this.patrolSpeed, false);
      this.direction = ig.Utils.normalize(this.vel);
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
        this.pos.x = this.nextWaypoint.center().x - (this.size.x / 2);
      }
      if (ig.Utils.signDifference(distanceVectorToNextWaypoint.y, this.previousDistanceVectorToNextWaypoint.y)) {
        this.pos.y = this.nextWaypoint.center().y - (this.size.y / 2);
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
      var player = ig.game.getPlayer();
      if (player) {
        this.direction = ig.Utils.getDirectionToEntity(this, player);
        this.vel.x = this.direction.x * this.chaseSpeed;
        this.vel.y = this.direction.y * this.chaseSpeed;
      }
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

    canSeePlayer: function() { return false; },

    canHearPlayer: function() { return false; }

  });
});
