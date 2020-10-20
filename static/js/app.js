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

// Create the map with our layers
var map = L.map("map-id", {
    center: [39.0639, -108.5506],
    zoom: 12,
  });

// Add our tile layer to the map
gomap.addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append("svg");
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

// d3.json('../../data/test.geojson', function(data) {
//   // console.log(data)
// });

// the latitude and longitude coordinates will need to be transformed
// var transform = d3.geo.transform({
//   point: projectPoint
// });
// var d3path = d3.geo.path().projection(transform);

// function projectPoint(x, y) {
//   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//   this.stream.point(point.x, point.y);
// } 

//   // unction to convert our points to a line 
//   function applyLatLngToLayer(d) {
//     var y = d.geometry.coordinates[1]
//     var x = d.geometry.coordinates[0]
//     return map.latLngToLayerPoint(new L.LatLng(y, x))
// }

// We have several elements we will be adding. These include the path itself (as a line), the yellow traveling circle, the points themselves
// here is the line between points

var features = []
// data.forEach(point => {
//   Object.entries(point).append
// })
// var data = 
d3.json('../../data/test2.geojson').then(data => {
  console.log(data.features[1].geometry.coordinates)
});
// var arr =   
// var arr = L.geoJSON('../../data/test2.geojson').then(data => {
//   return arr
// })
// for (data [Key, Value] of Object.defineProperties(data)) {
//   console.log(`${key}: ${value}`);
// }

// L.geoJson(features, {
//   filter: function(feature, layer) {
//       return feature.properties.show_on_map;
//   }
// }).addTo(map);

// var linePath = g.selectAll(".lineConnect")
//     .data([featuresdata])
//     .enter()
//     .append("path")
//     .attr("class", "lineConnect");

// // This will be our traveling circle
// var marker = g.append("circle")
//     .attr("r", 10)
//     .attr("id", "marker")
//     .attr("class", "travelMarker");

// // if you want the actual points change opacity
// var ptFeatures = g.selectAll("circle")
//     .data(featuresdata)
//     .enter()
//     .append("circle")
//     .attr("r", 3)
//     .attr("class", function(d){
//         return "waypoints " + "c" + d.properties.time
//     })      
//     .style("opacity", 0);

// // I want the origin and destination to look different
// var originANDdestination = [featuresdata[0], featuresdata[17]]

// var begend = g.selectAll(".drinks")
//     .data(originANDdestination)
//     .enter()
//     .append("circle", ".drinks")
//     .attr("r", 5)
//     .style("fill", "red")
//     .style("opacity", "1");

//     // I want names for my coffee and beer
// var text = g.selectAll("text")
//     .data(originANDdestination)
//     .enter()
//     .append("text")
//     .text(function(d) {
//         return d.properties.name
//     })
//     .attr("class", "locnames")
//     .attr("y", function(d) {
//         return -10 //I'm moving the text UP 10px
//     })