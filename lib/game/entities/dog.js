ig.module(
  'game.entities.dog'
)
.requires(
  'impact.entity',
  'game.entities.alert'
)
.defines(function() {
  EntityDog = ig.Entity.extend({

    SIGHT_RANGE_SQUARED: 360000,
    SIGHT_ANGLE: 45,
    ALERT_INPUT_TIMEOUT: 0.4,
    ALERT_COMPLETE_TIMEOUT: 1.5,
    HEARING_RANGE_SQUARED: 250000,

    animSheet: new ig.AnimationSheet('media/dog.png', 128, 190),
    size: { x: 60, y: 60 },
    offset: { x: 34, y: 70 },
    maxVel: { x: 700, y: 700 },
    patrolSpeed: 150,
    chaseSpeed: 200,
    pathName: null,
    waypointPath: null,
    nextWaypoint: null,
    previousDistanceVectorToNextWaypoint: { x: 0, y: 0 },
    patroling: true,
    followingAStarPath: false,
    direction: { x: 0, y: 0 },
    alertedTimer: null,
    lastWalkAnimationName: null,
    alertEntity: null,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      this.addAnim('idleLeft', 1, [0])
      this.addAnim('idleRight', 1, [11]);
      this.addAnim('idleDown', 1, [22]);
      this.addAnim('idleUp', 1, [33]);
      this.addAnim('walkLeft', 1.0 / 30.0, ig.Utils.getNumberRangeArray(0, 10));
      this.addAnim('walkRight', 1.0 / 30.0, ig.Utils.getNumberRangeArray(11, 21));
      this.addAnim('walkDown', 1.0 / 30.0, ig.Utils.getNumberRangeArray(22, 32));
      this.addAnim('walkUp', 1.0 / 30.0, ig.Utils.getNumberRangeArray(33, 43));
      this.addAnim('runLeft', 1.0 / 40.0, ig.Utils.getNumberRangeArray(0, 10));
      this.addAnim('runRight', 1.0 / 40.0, ig.Utils.getNumberRangeArray(11, 21));
      this.addAnim('runDown', 1.0 / 40.0, ig.Utils.getNumberRangeArray(22, 32));
      this.addAnim('runUp', 1.0 / 40.0, ig.Utils.getNumberRangeArray(33, 43));

      this.canSeePlayer = window.canSeePlayerFunction.bind(this);
      this.canHearPlayer = window.canHearPlayerFunction.bind(this);
      this.setAlert = window.setAlert.bind(this);
      this.updateAlert = window.updateAlert.bind(this);
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
      this.updateAlert();

      if (this.alertedTimer) {
        if (this.alertedTimer.delta() >= this.ALERT_INPUT_TIMEOUT) {
          if (this.canHearPlayer(true)) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
            this.patroling = false;
            this.followingAStarPath = false;
            this.setAlert(EntityXMark);
            this.updatePlayerChase();
          } else if (this.alertedTimer.delta() >= this.ALERT_COMPLETE_TIMEOUT) {
            this.alertedTimer = null;
            this.lineColor = 'rgba(255, 255, 255, 1)';
            this.setAlert(null);
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
          this.setAlert(EntityQMark);
          this.lineColor = 'rgba(255, 0, 0, 1)';
        } else if (this.patroling && this.alertEntity != null) {
          this.setAlert(null);
        }
      }

      if (this.vel.x != 0 || this.vel.y != 0) {
        var dir = ig.Utils.normalize(this.vel);
        var oneOverRootTwo = 0.7071067811865475;
        if (dir.y >= oneOverRootTwo) {
          this.lastWalkAnimationName = 'Down';
        } else if (dir.y <= -oneOverRootTwo) {
          this.lastWalkAnimationName = 'Up';
        } else if (dir.x <= -oneOverRootTwo) {
          this.lastWalkAnimationName = 'Left';
        } else {
          this.lastWalkAnimationName = 'Right';
        }
        this.lastWalkAnimationName = (this.patroling ? 'walk' : 'run') + this.lastWalkAnimationName;
        this.currentAnim = this.anims[this.lastWalkAnimationName];
      } else if (this.lastWalkAnimationName) {
        this.currentAnim = this.anims[this.lastWalkAnimationName.replace('walk', 'idle').replace('run', 'idle')];
        this.lastWalkAnimationName = null;
      }

      var player = ig.game.getPlayer();
      if (player && this.touches(player)) {
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

    canHearPlayer: function() { return false; },

    setAlert: function() {},

    updateAlert: function() {}

  });
});
