var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");

var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));

var color = d3.scaleOrdinal(d3.schemeCategory10);
var attractForce = d3.forceManyBody().strength(10).distanceMax(900).distanceMin(600);
var repelForce = d3.forceManyBody().strength(-600).distanceMax(600).distanceMin(10);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d["Country"]
    }))
    .force("attractForce", attractForce)
    .force("repelForce", repelForce)
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("newCleanedData.json", function (err, cleanedData) {
    if (err) throw err;

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(cleanedData[1])
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.log(d["value"]) + 1;
        });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(cleanedData[0])
        .enter().append("circle")
        .attr("r", function (d) {
            return Math.sqrt(d["Count"]) + 2;
        })
        .attr("fill", function (d) {
            return color(d["Continent"]);
        })
        .call(d3.drag()
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
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
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
