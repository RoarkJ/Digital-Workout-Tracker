// function init() {
//     var dropdown = d3.select("#selDataset");
//     d3.json("../../data/json/activities.json").then((data)=> {
//         data.forEach(function(activity) {
//             dropdown.append("option").text(activity.activityId).property("value")
//         })
//     })
// };
// init();

function dropDown(ids) {
    var dropdownMenu = d3.select("#selDataset");
    ids.forEach((id) => {
      dropdownMenu.append("option").text(id).attr("value", id);
    });
  };
  
  d3.json("http://127.0.0.1:5000/activity_numbers").then(ids => {
    dropDown(ids);
  })
  
  function buildTable(activityID) {
    var table = d3.select("#activity-summary")
    d3.json(`http://127.0.0.1:5000/summary/${activityID}`).then((data) => {
        Object.entries(data).forEach(([key, value]) => {
            if (key=="avg_hrt_rate") {
                key = "Avg Heart Rate"
                table.append("h5").text(`${key}: ${value}`);
            } else if (key=="max_hrt_rate") {
                key = "Max Heart Rate"
                table.append("h5").text(`${key}: ${value}`);
            } else if (key=="total_distance") {
                key = "Total Distance"
                value = value*.00062
                table.append("h5").text(`${key}: ${value} miles`);
            } else if (key=="duration") {
                key = "Duration"
                value = value/60
                table.append("h5").text(`${key}: ${value} min`);
            } else {
                table.append("h5").text(`${key}: ${value}`);
            }
        })
    });
};

function deleteCurrent() {
    d3.select("#activity-summary").selectAll("h5").remove();
    d3.select("#map").remove();
    d3.select("#mapping").append("div").attr("id", "map").style("height", "500px")
}

function optionChanged(activityID) {
    deleteCurrent();
    buildTable(activityID);
    buildMap(activityID)
};

function buildMap(activity_number) {
    d3.json(`http://127.0.0.1:5000/geojson/${activity_number}`).then(data => {
        console.log(data);

        // Create the tile layer that will be the background of our map
        var gomap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "light-v10",
            accessToken: API_KEY
        });

        function applyLatLngToLayer(d) {
            var y = d.geometry.coordinates[1]
            var x = d.geometry.coordinates[0]
            return map.latLngToLayerPoint(new L.LatLng(y, x))
        };
        // // Convert json object to geoJson
        // var geojson = {
        //     type: "FeatureCollection",
        //     features: [],
        //   };
        
        //   for (i = 0; i < data.length; i++) {
        //       geojson.features.push({
        //       "type": "Feature",
        //       "geometry": {
        //         "type": "Point",
        //         "coordinates": [data[i].longitude, data[i].latitude, data[i].altitude]
        //       },
        //       "properties": {
        //         "id": data[i].id,
        //         "time": data[i].time,
        //         "distance": data[i].distance,
        //         "HeartRate": data[i].hrt_rate,
        //         }
        //         });
        //     }
        // console.log(geojson.features[0].properties.id)
        // console.log(geojson)
        var features = data.features.filter(function(d) {
            return d.properties.id >= 0
        });

        var properties = data.features;
        console.log(properties);

        // calculate center of map and add map layer
        latC = d3.median(properties.map(item => item.properties.latitude))
        lonC = d3.median(properties.map(item => item.properties.longitude))
        console.log(`lat: ${latC}`)
        console.log(`lon: ${lonC}`)

        var map = L.map('map')
        .addLayer(gomap)
        .setView([latC, lonC], 10);

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
            .x(function(d) {
                return applyLatLngToLayer(d).x
            })
            .y(function(d) {
                return applyLatLngToLayer(d).y
        });
        // function applyLatLngToLayer(geojson) {
        //     console.log(`D= ${geojson}`)
        //     var y = geojson.geometry.coordinates[1]
        //     var x = geojson.geometry.coordinates[0]
        //     return map.latLngToLayerPoint(new L.LatLng(y, x))
        // }
        // console.log(features[0])
        // console.log(geojson.features[0])
        // adding the path itself (as a line), the traveling circle, the points themselves
        // here is the line between points
        var linePath = g.selectAll(".lineConnect")
            .data([data])
            .enter()
            .append("path")
            .attr("class", "lineConnect");

        // This will be our traveling circle
        var marker = g.append("circle")
            .attr("r", 8)
            .attr("id", "marker")
            .attr("class", "travelMarker");

        var origin = [data.features[0]]

        // console.log(`origin = ${origin}`)

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
        map.on("viewreset", reset);
        reset();
        transition();

        // reset the SVG elements if the user repositions the map
    function reset() {
        var bounds = d3path.bounds(data),
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
        var y = features[0].geometry.coordinates[1]
        var x = features[0].geometry.coordinates[0]
        return "translate(" +
            map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
            map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        });

        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");

        linePath.attr("d", d3path);
        // linePath.attr("d", toLine);
        
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
        };

        function transition() {
            linePath.transition()
                .duration(15000)
                .attrTween("stroke-dasharray", tweenDash)
        }
        function tweenDash() {
            return function(t) {
                //total length of path (single value)
                var l = linePath.node().getTotalLength();
                // console.log(l)
                interpolate = d3.interpolateString("0," + l, l + "," + l);
                //t is fraction of time 0-1 since transition began
                var marker = d3.select("#marker");
            
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
        } //end projectPoint
    });
}

buildTable(1926552470);
buildMap(1926552470);

