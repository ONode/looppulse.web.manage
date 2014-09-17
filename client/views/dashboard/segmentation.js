Template.dashboard_segment_manage.helpers({
  counts: function(){
    console.log("this", this)
    return 7
  },
  segments: function(){
    var data = [
    { _id:"demo0001", name:"VIP", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:1000, viewed: 900, visited: 600, conversion: 0.6,viewConversion: 0.68  },
    { _id:"demo0002", name:"Summer Visitor", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:1200, viewed: 800,  visited: 600, conversion: 0.5, viewConversion: 0.75 },
    { _id:"demo0003", name:"Foodie", startTime: "", endTime: "", traceOffset: 100000, desc: "", sent:2000, viewed: 1200, visited: 400, conversion: 0.2,  viewConversion: 0.33 }

    ]
    var tmpl = Template.instance()
    var companyId = this.companyId
    var cursor = Segments.find({companyId: companyId}).fetch()
    console.log(tmpl, companyId, this, cursor)
    return cursor || data;
  },
  modal:function(){
    return {
      modalId: "collection-create-modal",
      context: "segment",
      collectionName: "Segments",
      fields:[{"name": "newItemName", "placeholder": "Enter a Segment name"}]
    }
  }
});

Template.dashboard_segment_create.helpers({
  criteriaInputs: function(companyId){
    //get All Locations under the company
    var locationList = []
    //get All product and floor for each locations
    var floorMap = []
    var productMap = []
    var categoryMap = []
    // Floors.find({locationId:locationId}, {fields:{_id:1, level: 1, name:1}}).fetch()
    return {
      "hasBeen": {
        "field": "hasBeen",
        "values": [{ "has been": true},{ "has not been":false}],
        "type": "list"
      },
      "to": {
        "field": "to",
        "values": ["any", "all"],
        "type": "list"
      },
      "triggerLocations": {
        "field":"triggerLocations",
        "isMultiple": true,
        "filters": [
          {
            "key": "categoryName",
            "label": "category",
            "values": categoryMap,
            "style": "MultiSelect"
          },
          {
            "key": "productName",
            "label": "product",
            "values": productMap,
            "style": "MultiSelect"
          },
          {
            "key": "floorLevel",
            "label": "floor",
            "values": floorMap, //when it is list, give me values
            "style": "MultiSelect"
          }
        ],
        "type": "fliterList"
      },
      "times":{
        "field":"times",
        "filters": [
          {
            "key": "atLeast",
            "label": "at least",
            "style": "Number"
          },
          {
            "key": "atMost",
            "label": "at most",
            "style": "Number",
            "selected": true
          }
        ],
        "values":{ "atLeast":0, "atMost": 100 }, //label: value
        "type": "filterInput"
      },
      "durantionInMinutes":{
        "field":"durantionInMinutes",
        "filters": [
          {
            "key": "atLeast",
            "label": "at least",
            "style": "Number",
            "selected": true
          },
          {
            "key": "atMost",
            "label": "at most",
            "style": "Number"
          }
        ],
        "values": { "atLeast":0, "atMost": 1440 },
        "type": "filterInput"
      },
      "days":{
        "field": "days",
        "filters": [
          {
            "key": "dateTime",
            "label": "time period",
            "style": "DatetimeRange",
            "field": {"start":"start", "end":"end"} //special: anything needs extra field name
          },
          {
            "key": "inLast",
            "label": "last",
            "style": "Number",
            "selected": true
          }
        ],
        "type": "filterInput"
      },
      "every":{
        "field": "every",
        "values": ["day","weekdays", "weekends"],
        "type": "list"
      },
      "triggerPoints": {
        "field": "triggerPoints",
        "isMultiple": true,
        "values": Locations.find({companyId: companyId}).fetch(),
        "type": "list"
      }
    }
  },

})

Template._field.helpers({
  isList:function(){
    return this.type === "list"
  },
  isRange: function(){
    return this.type === "range"
  },
  isDefault: function(){
    return this.type !== "list" && this.type !== "range" && this.type !== "filterInput"
  },
  decompose: function(){
    return this.values.map(function(o){
      if (typeof o === "object") {
        for (k in o) {
          return {
            key: k,
            val: o[k]+""
          }
        }
      } else {
        return {
          key: o,
          val: o+"",
        }
      }
    })
  },
  isSelected: function(){
    return this.selected
  }
})
Template._field.rendered = function(){
  this.$('.input-daterange').datepicker({
  });

  //data-filter-toggle changes -> data-filter toggle display
  //delegation
  //may be can save some data field
  var _selecting = function(elem){
    var selected = $("option:selected", elem)
    var targetField = selected.data("filter-toggle");
    var targetKey = elem.data("key")
    if (!targetField || !targetKey) { return false; }
    var input = $(".filter-input-group[data-filter='"+targetField+"'][data-key='"+targetKey+"']")

    input.show();
  }
  var $select = this.$("select")
  $select.on("change", function(e){
    _selecting(this)
  })
  _selecting($select)
}