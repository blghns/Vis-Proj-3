var width = 960;
var height = 600;
var svg = d3.select("body").append("svg").attr("width", width + "px").attr("height", height + "px");

var color = d3.scaleOrdinal(d3.schemeCategory10);
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d["Country"]
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("cleanedData.json", function (err, cleanedData) {
    if (err) throw err;

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(cleanedData[1])
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.sqrt(d["Count"]);
        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(cleanedData[0])
        .enter().append("circle")
        .attr("r", function (d) {
            return Math.sqrt(d["Count"]);
        })
        .attr("fill", function (d) {
            return color(d["Country"]);
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function (d) {
            return d["Country"];
        });

    simulation.nodes(cleanedData[0])
        .on("tick", ticked);

    simulation.force("link")
        .links(cleanedData[1]);

    function ticked() {
        link
            .attr("x1", function (d) {
                return d["Source airport country"].x;
            })
            .attr("y1", function (d) {
                return d["Source airport country"].y;
            })
            .attr("x2", function (d) {
                return d["Destination airport country"].x;
            })
            .attr("y2", function (d) {
                return d["Destination airport country"].y;
            });

        node
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    }

});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
