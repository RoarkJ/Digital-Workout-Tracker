d3.json("http://127.0.0.1:5000/activity_numbers").then(ids => {
    dropDown(ids)
})

function optionChanged(activityID) {
    deleteCurrent();
    buildTable(activityID);
    buildMap(activityID)
};


function dropDown(ids) {
    var dropdownMenu = d3.select("#selDataset");
    ids.forEach((id) => {
        dropdownMenu.append("option").text(id).attr("value", id);
    });
};

function buildTable(activityID) {
    var table = d3.select("#activity-summary")
    d3.json(`http://127.0.0.1:5000/summary/${activityID}`).then((data) => {
        Object.entries(data).forEach(([key, value]) => {
            table.append("h5").text(`${key}: ${value}`);
        })
    })
};

function deleteCurrent() {
    d3.select("#activity-summary").selectAll("h5").remove();
    d3.select("#map").remove();
    d3.select("#mapping").append("div").attr("id", "map").style("height", "500px")
}

function buildMap(activityID) {
    d3.json(`http://127.0.0.1:5000/latlng/${activityID}`).then(points => {
        // Create an initial map object
        // Set the longitude, latitude, and the starting zoom level
        var myMap = L.map("map").setView(points[0], 10);

        // Add a tile layer (the background map image) to our map
        // Use the addTo method to add objects to our map
        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
        }).addTo(myMap);

        // Create a Polygon and pass in some initial options
        L.polyline(points, {
            color: "red",
            // fillColor: "yellow",
            fillOpacity: 0.50
        }).addTo(myMap);
    })
}

var gauges = []
document.addEventListener("DOMContentLoaded", function (event) {
    var opt = {
        gaugeRadius: 140,
        minVal: 0,
        maxVal: 100,
        needleVal: Math.round(30),
        tickSpaceMinVal: 1,
        tickSpaceMajVal: 10,
        divID: "gaugeBox",
        gaugeUnits: "mph"
    }

    gauges[0] = new drawGauge(opt);
})

buildTable(1926552470);
buildMap(1926552470);