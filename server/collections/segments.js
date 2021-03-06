Segment.ensureIndex = function () {
  Segments._ensureIndex({
    companyId: 1
  });
};

/**
 *
 * @param visitorId
 * @returns {boolean}
 */
Segment.prototype.match = function (visitorId) {
  // TODO remove optional `encounter` from arguments, also visitor instance could be passed in as visitor instance was fetched during daily jobs
  var self = this;

  // Make sure visitor is the same company of segment
  if (!Visitors.findOne({ _id: visitorId, companyId: self.companyId})) {
    return false;
  }

  if (_.isEmpty(self.criteria)) {
    return true;
  }

  return new SegmentMatchCriteria(self.criteria).match(self.companyId, visitorId);
};

Segment.criteriaToString = function(criteria) {
  if (!criteria) {
    return "Criteria is not defined";
  }

  if (criteria.hasBeen === undefined) {
    return "Includes every visitor. ";
  } else {
    var s = "Includes anyone who has ";

    //has been / has not been
    if (!criteria.hasBeen) {
      s = s + "not ";
    }
    s = s + "been ";
    s = s + "to ";

    //all / any
    if (criteria.to == "any") {
      s = s + "any ";
    } else {
      s = s + "all ";
    }

    //Locations can be mixed
    s = s + "of these ";
    var locHash = Segment.triggerLocationsToString(criteria.triggerLocations);
    if (locHash.categories) {
      s = s + locHash.categories;
    } else if (locHash.floors) {
      s = s + locHash.floors;
    } else if (locHash.products) {
      s = s + locHash.products;
    }
    s = s + " ";

    //Number of Times convertion, assume mandatory
    if (criteria.hasBeen) {
      s = s + "for "; //just for convention sake to put space after;

      if(criteria.times.atMost) {
        s = s + "at most " + criteria.times.atMost + " times and ";
      } else {
        s = s + "at least " + criteria.times.atLeast + " times and ";
      }
    }

    //stay duration
    if (criteria.hasBeen) {
      s = s + "stayed for ";
      if(criteria.durationInMinutes.atMost) {
        s = s + "at most " + criteria.durationInMinutes.atMost + " minutes ";
      } else {
        s = s + "at least " + criteria.durationInMinutes.atLeast + " minutes ";
      }
    }

    //time range
    if (criteria.days.inLast) {
      s = s + "for the last " + criteria.days.inLast + " days ";
    } else {
      s = s + "from " + moment(criteria.days.start).format('Do MMMM YYYY') + " ";
      s = s + "to " + moment(criteria.days.end).format('Do MMMM YYYY') + " ";
    }

    //weekday / weekend
    s = s + "every " + criteria.every + "."

    return s;
  }
};

Segment.triggerLocationsToString = function(triggerLocations) {
  var locHash = _.reduce(triggerLocations, function(memo, c) {
    if (c.categoryId) {
      var cat = Categories.findOne({_id:c.categoryId});
      memo.categories = memo.categories + ", " + cat.name;
    } else if (c.floorId) {
      var floor = Floors.findOne({_id:c.floorId});
      memo.floors = memo.floors + ", " + floor.name;
    } else if (c.productId) {
      var product = Products.findOne({_id:c.productId});
      memo.products = memo.products + ", " + product.name;
    }
    return memo;

  }, {categories: "", floors: "", products: ""});

  return {
    categories: locHash.categories ? "categories: " + locHash.categories.substring(2) : null,
      floors: locHash.floors ? "floors: " + locHash.floors.substring(2) : null,
      products: locHash.products ? "shops: " + locHash.products.substring(2) : null
  };

};
