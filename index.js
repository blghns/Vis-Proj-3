var svg = d3.select("body").append("svg").attr("width", "100%").attr("height", "100%");
var svgGroup = svg.append("g");
var linkData, nodeData;
var link, node;
var width = parseInt(svg.style('width'));
var height = parseInt(svg.style('height'));
var color = d3.scaleOrdinal(d3.schemeCategory10);
var attractForce = d3.forceManyBody().strength(10).distanceMax(width).distanceMin(height);
var repelForce = d3.forceManyBody().strength(-height).distanceMax(height).distanceMin(10);
var filterOptions = [];

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1e-6);
tooltip.append('div')
    .attr('class', 'country');
tooltip.append('div')
    .attr('class', 'airports');

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d["Country"]
    }))
    .force("attractForce", attractForce)
    .force("repelForce", repelForce)
    .force("center", d3.forceCenter(width / 2, height / 2));

var transform = d3.zoomIdentity;

d3.json("newCleanedData.json", function (err, cleanedData) {
    if (err) throw err;
    linkData = cleanedData[1];
    nodeData = cleanedData[0];

    link = svgGroup.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(linkData)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return Math.log(d["value"]) + 1;
        })
        .attr("stroke", function () {
            return "#999"
        });

    node = svgGroup.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodeData)
        .enter().append("circle")
        .attr("r", function (d) {
            return Math.sqrt(d["Count"]) + 2;
        })
        .attr("fill", function (d) {
            return color(d["Continent"]);
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    simulation.nodes(nodeData)
        .on("tick", ticked);

    simulation.force("link")
        .links(linkData);

    svg.call(d3.zoom()
        .scaleExtent([1 / 2, 8])
        .on("zoom", zoomed));

    d3.select(window).on("resize", resize);
	
	var legend = svgGroup.selectAll(".legend")
		.data(color.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("circle")
		.attr("cx", width - 15)
		.attr("r", 8)
		.attr("cy", 12)
		.style("stroke", color)
		.style("fill", "white")
		.attr("stroke-width", 3)
		.on("click", function(d){
			if (toggleFilter(d) == 1){
				d3.select(this).style("fill", "black");
				d3.select(this).transition();
			}
			else{
				d3.select(this).style("fill", "white");
				d3.select(this).transition();
			}
		});

	legend.append("text")
		.attr("x", width - 30)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.style("fill;", color)
		.text(function(d) { return d; });

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

function toggleFilter(d){
	var index = filterOptions.indexOf(d)
	var filterAdded = true;
	if (index > -1){
		filterOptions.splice(index, 1);
		filterAdded = false;
	}
	else{
		filterOptions.push(d);
	}
	if (typeof filterOptions[0] == 'undefined'){
		filterContinents(["Asia",  "Europe", "North America", "Africa", "South America", "Oceania", "Antarctica"]);
	}
	else{
		filterContinents(filterOptions);
	}
	return filterAdded;
}

function resetFilter() {
	
}
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    link.attr("stroke", function (lk) {
        if (lk.source == d || lk.target == d)
            return "#6666D0";
    });
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    link.attr("stroke", function (lk) {
        if (lk.source == d || lk.target == d)
            return "#6666D0";
    });
    tooltip.transition()
        .duration(300)
        .style("opacity", 1e-6);
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    link.attr("stroke", function () {
        return "#999";
    });
    tooltip.style("opacity", 1e-6);
}

function zoomed() {
    svgGroup.attr("transform", d3.event.transform);
}

function mouseover(d) {
    tooltip.transition()
        .duration(300)
        .style("opacity", 1);
    link.attr("stroke", function (lk) {
        if (lk.source == d || lk.target == d)
            return "#6666D0";
        else
            return "#999";
    });
}

function mousemove(d) {
    tooltip.select('.country').html('<b>' + d["Country"]);
    tooltip.select('.airports').html('Airports: ' + d["Count"].toLocaleString());
    tooltip.style("left", (d3.event.x) + 10 + "px")
        .style("top", (d3.event.y) + 10 + "px");
}

function mouseout() {
    tooltip.transition()
        .duration(300)
        .style("opacity", 1e-6);
    link.attr("stroke", function () {
        return "#999";
    });
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    attractForce = d3.forceManyBody().strength(10).distanceMax(width).distanceMin(height);
    repelForce = d3.forceManyBody().strength(-height).distanceMax(height).distanceMin(10);

    simulation.force("center", d3.forceCenter(width / 2, height / 2))
        .force("attractForce", attractForce)
        .force("repelForce", repelForce);

    if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
        setTimeout(function () {
            simulation.alphaTarget(0)
        }, 500);
    }
}

function filterContinents(selectedContinents) {
    var newNodeData = nodeData.filter(function (d) {
        return selectedContinents.includes(d["Continent"]);
    });
    var newLinkData = linkData.filter(function (d) {
        return selectedContinents.includes(d.source.Continent) && selectedContinents.includes(d.target.Continent);
    });

    node.data(newNodeData)
        .exit().transition()
        .attr("r", 0)

    node.enter().append("circle").merge(node)
        .attr("r", function (d) {
            return Math.sqrt(d["Count"]) + 2;
        })
        .attr("fill", function (d) {
            return color(d["Continent"]);
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    link.data(newLinkData)
        .exit().transition()
        .attr("stroke-width", 0);

    link.enter().append("line").merge(link)
        .attr("stroke-width", function (d) {
            return Math.log(d["value"]) + 1;
        })
        .attr("stroke", function () {
            return "#999"
        });

}