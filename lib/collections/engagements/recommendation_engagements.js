/**
 *
 * @param doc
 * @constructor
 * @augments BaseEngagement
 *
 * @property {string} type - Always equal to "recommendation"
 * @property {string} locationId
 * @property {string} segmentId
 * @property {string} name
 * @property validPeriod
 * @property {string[]} message
 * @property {string[]} triggerInstallationIds
 * @property {string[]} recommendInstallationIds
 */
RecommendationEngagement = function(doc) {
  BaseEngagement.call(this, doc);
  this.type = RecommendationEngagement.type;
};

RecommendationEngagement.type = "recommendation";

RecommendationEngagement.prototype = Object.create(BaseEngagement.prototype);
RecommendationEngagement.prototype.constructor = RecommendationEngagement;

RecommendationEngagement.prototype.recentlyStayedAtRecommendInstallations = function (encounter, minDurationInMillisecond) {
  var self = this;
  var oneHour = 60*60*1000;
  var enteredAtStart = encounter.enteredAt - oneHour, enteredAtEnd = encounter.enteredAt;
  return self.recentlyStayedAt(encounter.visitorId,
                               self.recommendInstallationIds,
                               enteredAtStart,
                               enteredAtEnd,
                               minDurationInMillisecond);
}

RecommendationEngagement.prototype.recentlyStayedAtStopInstallations = function (encounter, minDurationInMillisecond) {
  var self = this;
  if (!self.stopInstallationIds || self.stopInstallationIds.length == 0) {
    return false;
  }
  var oneHour = 60*60*1000;
  var enteredAtStart = encounter.enteredAt - oneHour;
  var enteredAtEnd = encounter.exitedAt;
  if (encounter.isEnter()) {
    enteredAtEnd = encounter.enteredAt;
  }
  return self.recentlyStayedAt(encounter.visitorId,
                               self.stopInstallationIds,
                               enteredAtStart,
                               enteredAtEnd,
                               minDurationInMillisecond);
}

RecommendationEngagement.prototype.readyToTriggerByStay = function (encounter) {
  var self = this;
  if (self.recentlyStayedAtStopInstallations(encounter)) {
    return false;
  }

  if (self.recentlyStayedAtRecommendInstallations(encounter)) {
    return false;
  }

  if (self.triggerWhen === "leaving" && self.leavingTriggerInstallations(encounter)) {
    return true;
  }

  if (self.triggerWhen === "entering" && self.enteringTriggerInstallations(encounter)) {
    return true;
  }

  return false;
}

// Normally engagement can be based on:
// 1. Visit behavior: just left? shown interested in recommended locations before?
// 2. Real time environment: route visitor to less busy area
// 3. Time: recommend dessert after lunch hours
// 4. Purchase/loyalty: previous purchase history or information from loyalty program
RecommendationEngagement.prototype.readyToTrigger = function (encounter) {
  var self = this;
  if (encounter.isClosed() &&
      self.readyToTriggerByTime(encounter.exitedAt) &&
      self.readyToTriggerByStay(encounter)) {
    return true;
  }
  return false;
}
