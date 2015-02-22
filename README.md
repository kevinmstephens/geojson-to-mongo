
## Quick Start

```
npm install geojson-to-mongo
```

The following will connect to mongo at `localhost:27017` and add documents found at `./polygons.geojson`.

```
./node_modules/.bin/geojson-to-mongo --input ./polygons.geojson --db features --collection polygons
```

Input JSON format:
```
{
  features: [
    {geoJSON object1},
    {geoJSON object2},
    ...
  ]
}
```

Documents will correspond to objects found at `features`.

### CLI Flags

`./node_modules/.bin/geojson-to-mongo --help`
