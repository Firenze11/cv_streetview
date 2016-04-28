/**
 * Created by lezhi on 4/17/2016.
 */
if(!d3.custom) d3.custom = {};

d3.custom.forceVis = function module() {
    var width = 1120,
        height = 300,
        numClusters = 5,
        duration = 500;
    var svg;

    var dispatch = d3.dispatch("nodeHovered");

    var tip = d3.tip()
        .attr('class', 'd3-tip tip-inverse')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.name + "</span>";
        });

    var color = d3.scale.category20(),
        foci = [];
    var xScale = d3.scale.ordinal();

    var force = d3.layout.force()
        .charge(-50)
        //.gravity(0)
        .linkStrength(function(d){
            //console.log(d.value);
            return  Math.min(1, d.value/10);
        })
        .linkDistance(function(d){
            return 12/ (d.value*d.value);
        })
        .size([width, height]);

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg');
            svg.transition().duration(duration).attr({width: width, height: height});

            svg.call(tip);


            xScale.domain(d3.range(numClusters))
                .rangePoints([0, width], 0.7);

            foci = xScale.range().map( function(d) {
                return {x: d, y: height/2};
            });

            //console.log(foci);

            force
                .nodes(_data.nodes)
                .links(_data.links)
                .start();

            var link = svg.selectAll(".link")
                .data(_data.links)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return Math.sqrt(d.value); });

            var node = svg.selectAll(".node")
                .data(_data.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 5)
                .style("fill", function(d) { return color(d.cluster_outof_4); })
                .on('mouseover', mouseOverNode)
                .on('mouseout', function() { tip.hide(); })
                .call(force.drag);

            force.on("tick", function() {
                var k = .1 * force.alpha();
                //console.log(force,k);

                // Push nodes toward their designated focus.
                _data.nodes.forEach(function(d) {
                    //d.y += (foci[d["cluster_outof_"+numClusters]].y - d.y) * k;
                    //d.x += (foci[d["cluster_outof_"+numClusters]].x - d.x) * k;

                    //d.x += (1 /(d.x - 0)) * k;
                    //d.x += (1 /(d.x - width)) * k;
                    //d.y += (1 /(d.y - 0)) * k;
                    //d.y += (1 /(d.y - height)) * k;
                });

                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });

        });
    }

    function mouseOverNode(d) {
        dispatch.nodeHovered(d.name);
        tip.show(d);
    }

    my.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    };

    my.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return my;
    };

    my.numClusters = function(value) {
        if (!arguments.length) return numClusters;
        numClusters = value;
        return my;
    };

    d3.rebind(my, dispatch, 'on');
    return my;
};