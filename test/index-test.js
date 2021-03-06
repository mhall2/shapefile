var fs = require("fs"),
    vows = require("vows"),
    assert = require("assert");

var shapefile = require("../");

var suite = vows.describe("shapefile");

suite.addBatch({
  "An empty shapefile": testConversion("empty"),
  "A shapefile with boolean properties": testConversion("boolean-property"),
  "A shapefile with numeric properties": testConversion("number-property"),
  "A shapefile with string properties": testConversion("string-property"),
  "A shapefile with mixed properties": testConversion("mixed-properties"),
  "A shapefile with date properties": testConversion("date-property"),
  "A shapefile with unicode property names": testConversion("unicode-property"),
  "A shapefile of points": testConversion("points"),
  "A shapefile of multipoints": testConversion("multipoints"),
  "A shapefile of polylines": testConversion("polylines"),
  "A shapefile of polygons": testConversion("polygons"),
  "A shapefile of null features": testConversion("null")
});

function fixActualProperties(feature) {
  for (var key in feature.properties) {
    if (feature.properties[key] == null) {
      delete feature.properties[key];
    }
  }
  delete feature.properties.FID; // ogr2ogr built-in?
}

function fixExpectedProperties(feature) {
  var d = feature.properties.date;
  if (d) feature.properties.date = new Date(+d.substring(0, 4), d.substring(4, 6) - 1, +d.substring(6, 8));
}

function testConversion(name) {
  return {
    topic: function() {
      var callback = this.callback, features = [];
      shapefile.readStream("./test/" + name + ".shp")
          .on("error", callback)
          .on("feature", function(feature) { features.push(feature); })
          .on("error", callback)
          .on("end", function() { callback(null, features); });
    },
    "has the expected features": function(actual) {
      var expected = JSON.parse(fs.readFileSync("./test/" + name + ".json", "utf-8")).features;
      actual.forEach(fixActualProperties);
      expected.forEach(fixExpectedProperties);
      assert.deepEqual(actual, expected);
    }
  };
}

suite.export(module);
