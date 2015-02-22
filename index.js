#!/usr/bin/env node

var _ = require("lodash");
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
  .option("--hostname [uri]", "Optional. Default localhost:27017", "localhost:27017")
  .option("--db [name]", "Required. DB to write to")
  .option("--collection [name]", "Required. Collection to write to")
  .parse(process.argv);

// Throw if a required flag is missing"
_.each(["file", "db", "collection"], function (item) {
  if (!program[item]) {
    throw new Error("--" + item + " required");
  }
});

// Connection URL
var url = "mongodb://" + program.hostname + "/" + program.dbName;

// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  if (err) { throw err; }

  console.log("Connected correctly to server");
  var collection = db.collection(program.collection);

  var n = 0;
  console.log("starting document sync");
  var stream = fs.createReadStream(path.resolve(program.file))
    .pipe(JSONStream.parse("features.*"))
    .pipe(es.map(function (item, callback) {
      if (n % 1000 === 0) {
        console.log(n + " documents saved");
      }

      n++;
      collection.insert(item, callback);
    }));

  stream.on("end", function () {
    process.exit(1);
  });
});
