

function init() {
    // select dropdown menu read data and append to dropdown list
    var dropdown = d3.select("#selDataset");
    d3.json("samples.json").then((data)=> {
        // console.log(data)
        data.names.forEach(function(name) {
            dropdown.append("option").text(name).property("value");
        });

    //    display the data and the plots to the page
        getPlots(data.names[0]);
        getDemo(data.names[0]);
    });
}

init();

function getPlots(id) {
    d3.json("samples.json").then ((filter) =>{
        var samples = filter.samples;
        // console.log(samples)
        var filtered = samples.filter(s => s.id.toString() === id)[0];
        // console.log(filtered)
        var values =  filtered.sample_values.slice(0,10).reverse();
        var ids = filtered.otu_ids;
        var labels =  filtered.otu_labels;
        // get top 10 otu ids and reversing for the plot OTU. 
        var top_ids = ( filtered.otu_ids.slice(0, 10)).reverse();
        var otuIds = top_ids.map(d => "otu " + d);

        // build trace for Bar chart
        var trace1 =[{
            type: 'bar',
            orientation: 'h',
            x: values,
            y: otuIds,
            text: labels,
        }];

        // Build trace for Bubble graph
        var trace2 = [{
            x: filtered.otu_ids.slice(0, 10),
            y: filtered.sample_values.slice(0,10),
            mode: "markers",
            marker: {
                size: filtered.sample_values.slice(0,10),
                color: filtered.otu_ids.slice(0, 10)
            },
            text:  labels,
        }];

        // bar chart layout
        var layout1 = {
            title: "Top 10 OTUs",
            width: 500
        }

        // Insert Plots
        Plotly.newPlot('bar', trace1, layout1);
        Plotly.newPlot('bubble', trace2);
    });
};

// Call samples for demographic data, collect washing data to variable
function getDemo(id) {
    d3.json("samples.json").then((data)=> {
        var metadata = data.metadata;
    
        // select demo panel filter meta data by id and append to list
        var demographicInfo = d3.select("#sample-metadata");
        var result = metadata.filter(meta => meta.id.toString() === id)[0];
        demographicInfo.html("");
        var wfreq = result.wfreq
        Object.entries(result).forEach((key) => {   
            demographicInfo.append("h5").text(key[0].toUpperCase() + ": " + key[1] + "\n");

        // console.log(wfreq);

        // Guage: define position of guade (0 to 9) by wash frequency
        var level = (wfreq/9) * 180;
        var degrees = 180 - level, radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX, space, pathY, pathEnd);

        // build trace for guage
        var trace3 = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 18, color:'850000'},
            showlegend: false,
            name: 'Frequency',
            text: wfreq,
            hoverinfo: 'name+:+text'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors: ['rgba(119, 170, 221, .5)', 
                'rgba(153, 221, 255, .5)', 'rgba(68, 187, 153, .5)', 
                'rgba(187, 204, 51, .5)', 'rgba(170, 170, 0, .5)', 
                'rgba(238, 221, 136, .5)', 'rgba(238, 136, 102, .5)', 
                'rgba(255, 170, 187, .5)', 'rgba(221, 221, 221, .5)', 
                'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];

        var layout2 = {
            shapes:[{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        xaxis: {
            zeroline:false, 
            showticklabels:false,
            showgrid: false, 
            range: [-1, 1]
        },
        yaxis: {
            zeroline:false, 
            showticklabels:false,
            showgrid: false, 
            range: [-1, 1]}
        };
        Plotly.newPlot("gauge", trace3, layout2);
        });
    });
}

function optionChanged(id) {
    getPlots(id);
    getDemo(id);
}

// // Call updatePlotly() when a change takes place
d3.selectAll("#selDataset").on("change", updatePlotly);

// // This function is called when a dropdown menu item is selected
function updatePlotly() {
  // Use D3 to select the dropdown menu
  var dropdownMenu = d3.select("#selDataset");
  // Assign the value of the dropdown menu option to a variable
  var dataset = dropdownMenu.property("value");
}

// **** Scratch code ****

// var data = d3.json("samples.json")
//     //  Create the Traces
// var trace1 = {
//     x: data.sample_values,
//     y: data.otuIdss,
//     type: "bar",
//     name: "top 10 OTUs found",
// }

// var ids = data.samples[0].otuIdss;

// // console.log(data);
// console.log(ids);

// function filterIds() {
//     return samples[0].id = 941;
//   }
// console.log(filterIds())
// var sample = 940
// data = 'samples.json';
// names = d3.json(data.samples);
// console.log(names);

// console.log(samples.filter(s => s.id === id)[0]);

// var Trace3 = [
//     {
//       type: "indicator",
//       mode: "gauge+number+delta",
//       value: 420,
//       title: { text: "Speed", font: { size: 24 } },
//       delta: { reference: 400, increasing: { color: "RebeccaPurple" } },
//       gauge: {
//         axis: { range: [null, 500], tickwidth: 1, tickcolor: "darkblue" },
//         bar: { color: "darkblue" },
//         bgcolor: "white",
//         borderwidth: 2,
//         bordercolor: "gray",
//         steps: [
//           { range: [0, 250], color: "cyan" },
//           { range: [250, 400], color: "royalblue" }
//         ],
//         threshold: {
//           line: { color: "red", width: 4 },
//           thickness: 0.75,
//           value: 490
//         }
//       }
//     }
//   ];

// var result = metadata.filter(meta => meta.id.toString() === id)[0];
// demographicInfo.html("");
// var wfreq = result.wfreq
// console.log(`otu_ids: ${otuIds}`)
// console.log(`otu_labels: ${labels}`)