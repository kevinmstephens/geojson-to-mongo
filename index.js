#!/usr/bin/env node

var _ = require("lodash");
var async = require("async");
var es = require("event-stream");
var fs = require("fs");
var Hoek = require("hoek");
var path = require("path");
var program = require("commander");
var attributes = require("./package.json");
var JSONStream = require("JSONStream");
var MongoClient = require('mongodb').MongoClient

program
  .version(attributes.version)
  .option("--input [path]", "Required. Path to input geoJSON file")
  .option("--uri [uri]", "Optional. Default \"mongodb://localhost:27017/test\"", "mongodb://localhost:27017/test")
  .option("--collection [name]", "Required. Collection to write to")
  .parse(process.argv);

// Throw if a required flag is missing"
_.each(["input", "collection"], function (item) {
  if (!program[item]) {
    throw new Error("--" + item + " required");
  }
});

// Use connect method to connect to the Server
MongoClient.connect(program.uri, function(err, db) {
  if (err) { throw err; }

  console.log("Connected correctly to server");
  var collection = db.collection(program.collection);

  async.series([
    function (callback) {
      collection.ensureIndex({ "geometry": "2dsphere" }, callback);
    },
    function (callback) {
      var n = 0;
      console.log("starting document sync");
      var stream = fs.createReadStream(path.resolve(program.input))
        .pipe(JSONStream.parse("features.*"))
        .pipe(es.map(function (item, callback) {
          if (n % 1000 === 0) {
            console.log(n + " documents saved");
          }

          n++;
          collection.insert(item, callback);
        }));

      stream.on("end", function () {
        callback();
      });
    }

  ], function (err, data) {
    if (err) { throw err; }
    console.log("Success");
    MongoClient.close();
  });
});
