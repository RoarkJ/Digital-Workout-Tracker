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

