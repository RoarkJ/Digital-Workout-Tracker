var gauges = []
    document.addEventListener("DOMContentLoaded", function (event) {
        // Create new variable called buildGauge and use it to replace (60)
        // var buildGauge = d3.json("C:/Users/bbahaneb/Documents/DU Data Bootcamp/Digital-Workout-Tracker/App2/data/test2.geojson").then(collection => {
        //     var features = collection.features.filter(function (d) {
        //         return d.properties.Speed > 0
        //         return d.properties.Time != null
        //     })

        // var speeds = data.features.filter(feature => feature.properties.speed)
        // console.log(speeds);
        var opt = {
            gaugeRadius: 140,
            minVal: 0,
            maxVal: 100,
            needleVal: Math.round(10),
            tickSpaceMinVal: 1,
            tickSpaceMajVal: 10,
            divID: "gaugeBox",
            gaugeUnits: "mph"
        }
        console.log(opt);

        gauges[0] = new drawGauge(opt);
})
    // })
// });