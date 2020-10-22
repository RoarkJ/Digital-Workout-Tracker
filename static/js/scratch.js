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
    // console.log(geojson.features[0].properties.id)
    // console.log(data)
    var features = geojson.features.filter(function(d) {
        return d.properties.id >= 0
    });
    // console.log(features)

    // calculate center of map and add map layer
    latC = d3.median(data.map(latlist => latlist.latitude))
    lonC = d3.median(data.map(lonlist => lonlist.longitude))
    // console.log(`lat: ${latC}`)
    // console.log(`lon: ${lonC}`)

    var map = L.map('map-id')
    .addLayer(gomap)
    .setView([latC, lonC], 13);

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // the latitude and longitude coordinates will need to be transformed
    var transform = d3.geoTransform({point: projectPoint});

    var d3path = d3.geoPath().projection(transform);

    // function to convert our points to a line
    const toLine = d3.line().curve(d3.curveLinear)
        .x((d) => applyLatLngToLayer(d).x)
        .y((d) => applyLatLngToLayer(d).y);
    
    // adding the path itself (as a line), the traveling circle, the points themselves
    var ptFeatures = g.selectAll("circle")
        .data(geojson)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("class", "waypoints");

    // Here we will make the points into a single line/path. Note that we surround the geojson with [] to tell d3 to treat all the points as a single line. For now these are basically pointsbut below we set the "d" attribute using the line creator function from above.
    var linePath = g.selectAll(".lineConnect")
        .data([features])
        .enter()
        .append("path")
        .attr("class", "lineConnect");
    // console.log(linePath)

    // This will be our traveling circle
    var marker = g.append("circle")
        .attr("r", 8)
        .attr("id", "marker")
        .attr("class", "travelMarker");

    var origin = [features[0]]

    // console.log(`origin = ${origin}`)

    var begin = g.selectAll("g.start_point")
      .data(origin)
      .enter()
      .append('g')
      .attr('class', '.start_point');

    begin
      .append("circle", )
      .attr("r", 6)
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
    // when the user zooms in or out you need to reset the view
    map.on("zoom", reset);
    reset();
    transition();

    // reset the SVG elements if the user repositions the map
    function reset() {
        var bounds = d3path.bounds(geojson),
            topLeft = bounds[0],
            bottomRight = bounds[1];
  
        begin.attr("transform", d => 
            "translate(" + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")");
        ptFeatures.attr("transform", d => 
            "translate(" + applyLatLngToLayer(d).x + "," + applyLatLngToLayer(d).y + ")");
        marker.attr("transform", function() {
              const coords = features[0].geometry.coordinates;
                          const pt = map.latLngToLayerPoint(new L.LatLng(coords[1], coords[0]));
            console.log(coords)
              return "translate(" + pt.x + "," + pt.y + ")";
          });

        text.attr("transform", function(d) {
            return "translate(" +
                applyLatLngToLayer(d).x + "," +
                applyLatLngToLayer(d).y + ")";
            });
  
        // Setting the size and location of the overall SVG container
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");
  
        linePath.attr("d", toLine);
        // linePath.attr("d", d3path);
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
  
    } // end reset

    function transition() {
        linePath.transition()
            .duration(15000)
            .attrTween("stroke-dasharray", tweenDash)
    }

    function tweenDash() {
        return function(t) {
            //total length of path (single value)
            var l = linePath.node().getTotalLength();
            console.log(l)
            interpolate = d3.interpolateString("0," + l, l + "," + l);
            //t is fraction of time 0-1 since transition began
            // var marker = d3.select("#marker");
          
            // p is the point on the line (coordinates) at a given length
            // along the line. In this case if l=50 and we're midway through
            // the time then this would 25.
            var p = linePath.node().getPointAtLength(t * l);
      
            //Move the marker to that point
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
            // console.log(interpolate(t))
            return interpolate(t);
        }
      } //end tweenDash
    
    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    };
    
    function applyLatLngToLayer(d) {
        return map.latLngToLayerPoint(
                new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]));
    };
});

// ---------------------------------------------
// function applyLatLngToLayer(geojson) {
    //     console.log(`D= ${geojson}`)
    //     var y = geojson.geometry.coordinates[1]
    //     var x = geojson.geometry.coordinates[0]
    //     return map.latLngToLayerPoint(new L.LatLng(y, x))
    // }
    // console.log(features[0])
    // console.log(geojson.features[0])

// ---------------------------------------------
// var begin = g.selectAll(".points")
    //     .data(origin)
    //     .enter()
    //     .append("circle", ".points")
    //     .attr("r", 5)
    //     .style("fill", "green")
    //     .style("opacity", "1");

// ---------------------------------------------
// function reset() {
    //     var bounds = d3path.bounds(geojson),
    //         topLeft = bounds[0],
    //         bottomRight = bounds[1];
    //         // console.log(bounds)

    //     begin.attr("transform", function(d) {
    //         return "translate(" +
    //             applyLatLngToLayer(d).x + "," +
    //             applyLatLngToLayer(d).y + ")";
    //     });

    //     svg.attr("width", bottomRight[0] - topLeft[0] + 120)
    //     .attr("height", bottomRight[1] - topLeft[1] + 120)
    //     .style("left", topLeft[0] - 50 + "px")
    //     .style("top", topLeft[1] - 50 + "px");

    //     linePath.attr("d", d3path);
    //     // linePath.attr("d", toLine);
        
    //     g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
    // };

// ---------------------------------------------
// function applyLatLngToLayer(d) {
    //     var y = d.geometry.coordinates[1]
    //     var x = d.geometry.coordinates[0]
    //     return map.latLngToLayerPoint(new L.LatLng(y, x))
    // };
    // text.attr("transform", function(d) {
    // return "translate(" +
    //     applyLatLngToLayer(d).x + "," +
    //     applyLatLngToLayer(d).y + ")";
    // });
    

    // marker.attr("transform", function() {
    // var y = features[0].geometry.coordinates[1]
    // var x = features[0].geometry.coordinates[0]
    // return "translate(" +
    //     map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
    //     map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
    // });

    
    
    // function projectPoint(x, y) {
    // var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    // this.stream.point(point.x, point.y);} 
    //end projectPoint 

// ---------------------------------------------