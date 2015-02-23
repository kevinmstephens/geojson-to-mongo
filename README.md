
# mongo-to-json

A simple CLI tool that takes in a geoJSON feature collection and adds the features as documents to a mongo collection. Built using streams so it can handle HUGE files (think CENSUS BLOCKS for all of USA!).

Also creates a `2dsphere` index on the `geometry` field of the geoJSON documents so you are ready for geospatial queries when it's done.

#### Motivation

Getting sick of moving CENSUS shapefiles to MongoDB and wanting to build a CLI tool to do that for me. I hope to allow shpefile input in the future and allow for simplification

## Quick Start

```
npm install geojson-to-mongo
```

Input geoJSON file should contain `features` with array of valid geoJSON objects (this conforms to geoJSON feature collection).

```
{
  features: [
    {geoJSON object1},
    {geoJSON object2},
    ...
  ]
}
```

Execute the script:

The following will connect to the `tracts` db on the mongo instance at `localhost:27017` and add documents found at `./polygons.geojson`.

```
./node_modules/.bin/geojson-to-mongo --input ./polygons.geojson --uri mongodb://localhost:27017/tracts --collection polygons
```

### CLI Flags

See all of the CLI options.

`./node_modules/.bin/geojson-to-mongo --help`

### Mongoose Example

This example schema and schema method will work the `tracts` collection.

```
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var geoJSONSchema = new Schema({
  geometry: {
    type: {type: String},
    coordinates: []
  }
}, {
  collection: "tracts"
});

// Search for document intersecting lat/lng and return ONE.
// options.lat
// options.lng
geoJSONSchema.statics.findByLatLng = function (options, callback) {
  var lat = options.lat;
  var lng = options.lng;

  var query = {
    "geometry": {
      "$geoIntersects": {
        "$geometry": {
          type: "Point",
          coordinates: [options.lng, options.lat]
        }
      }
    }
  };

  this.findOne(query, callback);
};

module.exports = mongoose.model("tracts", geoJSONSchema);
```
