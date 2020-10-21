function init() {
    var dropdown = d3.select("#selDataset");
    d3.json("../../data/json/activities.json").then((data)=> {
        data.forEach(function(activity) {
            dropdown.append("option").text(activity.activityId).property("value")
        })
    })
};
init();

// Create the tile layer that will be the background of our map
var gomap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});

d3.json("../../data/test3.json").then(data => {
    // Convert json object to geoJson
    var geojson = {
        type: "FeatureCollection",
        features: [],
      };
      
      for (i = 0; i < data.length; i++) {
          geojson.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [data[i].longitude, data[i].latitude, data[i].altitude]
          },
          "properties": {
            "id": data[i].id,
            "time": data[i].time,
            "distance": data[i].distance,
            "HeartRate": data[i].hrt_rate,
            }
            });
    
        }
    // console.log(geojson)
    var featuresdata = geojson.features.filter(function(d) {
        return d.properties.time >= 0
    });
    console.log(featuresdata)

    // calculate center of map and add map layer
    latC = d3.median(data.map(latlist => latlist.latitude))
    lonC = d3.median(data.map(lonlist => lonlist.longitude))
    console.log(`lat: ${latC}`)
    console.log(`lon: ${lonC}`)

    var map = L.map('map-id')
    .addLayer(gomap)
    .setView([latC, lonC], 12);

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // the latitude and longitude coordinates will need to be transformed
    var transform = d3.geoTransform({
        point: projectPoint
      })
    var d3path = d3.geoPath().projection(transform);
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    // function to convert our points to a line
    var toLine = d3.line()
    // .interpolate("linear")
    .curve(d3.curveLinear)
    .x(function(geojson) {
        return applyLatLngToLayer(geojson).x
    })
    .y(function(geojson) {
        return applyLatLngToLayer(geojson).y
    });
    // function applyLatLngToLayer(geojson) {
    //     console.log(`D= ${geojson}`)
    //     var y = geojson.geometry.coordinates[1]
    //     var x = geojson.geometry.coordinates[0]
    //     return map.latLngToLayerPoint(new L.LatLng(y, x))
    // }

    // adding the path itself (as a line), the traveling circle, the points themselves
    // here is the line between points
    var linePath = g.selectAll(".lineConnect")
        .data([geojson])
        .enter()
        .append("path")
        .attr("class", "lineConnect");

    // This will be our traveling circle
    var marker = g.append("circle")
        .attr("r", 8)
        .attr("id", "marker")
        .attr("class", "travelMarker");

    var origin = [geojson[0]]
    console.log(`origin = ${origin}`)

    var begin = g.selectAll(".points")
        .data(origin)
        .enter()
        .append("circle", ".points")
        .attr("r", 5)
        .style("fill", "green")
        .style("opacity", "1");

    var text = g.selectAll('text')
        .data(origin)
        .enter()
        .append('text')
        .text("Start")
        .attr('class', 'locnames')
        .attr('y', function(d) {
            return -10
        })
        .attr('x', function(d) {
        return -5
    })
    // Add our items to the actual map (and account for zooming)
    map.on("viewreset", reset());

    transition();

    // reset the SVG elements if the user repositions the map
  function reset() {
    var bounds = d3path.bounds(geojson),
        topLeft = bounds[0],
        bottomRight = bounds[1];
        console.log(bounds)
        text.attr("transform", function(d) {
        return "translate(" +
            applyLatLngToLayer(d).x + "," +
            applyLatLngToLayer(d).y + ")";
        });
        begin.attr("transform", function(d) {
            return "translate(" +
                applyLatLngToLayer(d).x + "," +
                applyLatLngToLayer(d).y + ")";
        });
        marker.attr("transform", function() {
        var y = features.latitude
        var x = features.longitude
        return "translate(" +
            map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
            map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        });
    
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");

        // linePath.attr("d", d3path);
        linePath.attr("d", toLine);
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
  };
});