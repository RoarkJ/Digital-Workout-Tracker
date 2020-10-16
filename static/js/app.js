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
  maxZoom: 4,
  id: "light-v10",
  accessToken: API_KEY
});

// Create the map with our layers
var map = L.map("map-id", {
    center: [39.0639, -108.5506],
    zoom: 6,
  });

  // Add our tile layer to the map
gomap.addTo(map);


