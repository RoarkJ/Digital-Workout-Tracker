// gauge

const myGauge = new Gauge(configOptions);
myGauge.render("#gauge");
myGauge.update(updateValue);

const tempGauge = new Gauge({
    minValue: -20,
    maxValue: 50,
    lowThreshhold: 0,
    highThreshhold: 40,
    displayUnit: 'Degree Celcius'
});

config = {
    size: 200,
    margin: 10,
    minValue: 0,
    maxValue: 10,
    majorTicks: 5,
    lowThreshhold: 3,
    highThreshhold: 7,
    lowThreshholdColor: '#009900',
    defaultColor: '#ffe500',
  highThreshholdColor: '#cc0000',
    transitionMs: 1000,
    displayUnit: 'Value'
};

tempGauge.render('#gauge');


// var traceGuage = [
//     {
//         domain: { x: [0, 1], y: [0, 1] },
//         value: value,
//         title: { text: "Belly Button Washing Frequency" },
//         type: "indicator",
//         mode: "gauge+number",
//         delta: { reference: 380 },
//         gauge: {
//             axis: { range: [null, 10] },
//             steps: [
//                 { range: [0, 1], color: "darkgreen" },
//                 { range: [1, 2], color: "lightgreen" },
//                 { range: [2, 3], color: "lightgreen" },
//                 { range: [3, 4], color: "yellow" },
//                 { range: [4, 5], color: "yellow" },
//                 { range: [5, 6], color: "yellow" },
//                 { range: [6, 7], color: "yellow" },
//                 { range: [7, 8], color: "red" },
//                 { range: [8, 9], color: "red" },
//                 { range: [9, 10], color: "darkred" }
//             ],
//         }
//     }
// ];
// var layout = {
//     width: 600,
//     height: 450,
//     margin: { t: 0, b: 0 }
// };
// Plotly.newPlot("gauge", traceGuage, layout);