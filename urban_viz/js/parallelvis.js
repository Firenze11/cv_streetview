/**
 * Created by lezhi on 4/17/2016.
 */
if(!d3.custom) d3.custom = {};

d3.custom.parallelVis = function module() {
    var margin = {top: 30, right: 10, bottom: 10, left: 10},
        width = 1120 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        duration = 500;
    var svg;
    var dispatch = d3.dispatch("brushed");

    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {};

    var line = d3.svg.line(),//.interpolate("basis"),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;


    function my(_selection) {
        // generate chart here, using `width` and `height`
        _selection.each(function(_data) {
            // generate chart here; `d` is the data and `this` is the element
            svg = d3.select(this).append('svg')
                //svg.transition().duration(duration)
                .attr({width: width + margin.left + margin.right,
                    height: height + margin.top + margin.bottom})
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var dimensions;
            // Extract the list of dimensions and create a scale for each.
            x.domain(dimensions = d3.keys(_data[0]).filter(function(d) {
                return d != "lat" && d != "lng" && d != "color" && d != "id" && d != "neighborhood" && d != "city"
                    && (y[d] = d3.scale.linear()
                        .domain(d3.extent(_data, function(p) { return +p[d]; }))
                        .range([height, 0]));
            }));

            // Add grey background lines for context.
            background = svg.append("g")
                .attr("class", "background")
                .selectAll("path")
                .data(_data)
                .enter().append("path")
                .attr("d", path);

            // Add blue foreground lines for focus.
            foreground = svg.append("g")
                .attr("class", "foreground")
                .selectAll("path")
                .data(_data)
                .enter().append("path")
                .attr("d", path);

            // Add a group element for each dimension.
            var g = svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function(d) { return d; });

            // Add and store a brush for each axis.
            g.append("g")
                .attr("class", "brush")
                .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);

            // Returns the path for a given data point.
            function path(d) {
                return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            }

            // Handles a brush event, toggling the display of foreground lines.
            function brush() {
                var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
                    extents = actives.map(function(p) { return y[p].brush.extent(); });
                foreground.style("display", function(d) {
                    return actives.every(function(p, i) {
                        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                    }) ? null : "none";
                });
                //console.log(this);
                dispatch.brushed(actives, extents);
                //dispatch.brushed.call(actives, extents);
            }
        });
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

    d3.rebind(my, dispatch, 'on');
    return my;
};