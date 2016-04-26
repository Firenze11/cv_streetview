if(!d3.custom) d3.custom = {};

d3.custom.mapVis = function module() {
    var width = 265, // default width
        height = 265, // default height
        shapeType = "polygon", // OR "point"
        duration = 500;
    var radius = 2;
    var selection;
    var dispatch = d3.dispatch("locClicked");


    // actually exactly the same pattern as not using this internal
    // function object, and returning "this".
    // whether to return "this" or the internal function object ("my")
    // doesn't really matter because, in the end, you want to keep
    // those variables defined by "var" FROM being exposed to outside

    function my(_selection) {
        selection = _selection;
        update();
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

    my.shapeType = function(value) {
        if (!arguments.length) return shapeType;
        shapeType = value;
        return my;
    };

    my.update = update;

    my.highlightSelection = function(_) {
        var actives = _[0], extents = _[1];
        selection.selectAll("circle").classed("highlight", function(d) {
            return actives.length > 0
                &&
                actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                });// ? null : "none";
        });
    };

    function update() {
        selection.each(function(_data) {
            // generate chart here; `d` is the data and `this` is the element
            var svg = d3.select(this).select('svg');
            if (!svg[0][0]) svg = d3.select(this).append('svg');
            //console.log(svg);
            svg.transition().duration(duration).attr({width: width, height: height});

            var projection = d3.geo.mercator()
                .scale(132000)
                .rotate([-_data.center[0], -_data.center[1]])  // negative!!
                .translate([width / 2, height / 2]); // LONG - LAT of center point

            var path = d3.geo.path()
                .projection(projection);


            if (shapeType === "polygon") {  //......................................polygon map
                svg.selectAll("path")
                    .data(_data.features)
                    .enter().append("path")
                    .attr("class", "district")
                    .attr("d", path);

            } else if (shapeType === "point") {  //.................................point map
                var symbols = svg.selectAll("circle")
                    .data(_data);
                symbols.enter().append("circle")
                    .attr("class", function (d) {
                        return "point_" + d.id;
                    })
                    .on("click", function(d) {
                        console.log(d.neighborhood);
                        dispatch.locClicked(d.city, d.lat, d.lng);
                    });
                symbols.attr("r", radius)
                    .attr("transform", function (d) {
                        var p = projection([d.lng, d.lat]);
                        return "translate(" + p[0] + "," + p[1] + ")";
                    });
                symbols.exit().remove();

            } else if (shapeType === "hexbin") {  //................................hexbin map

                var color = d3.time.scale()
                    .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
                    .range(["black", "steelblue"])
                    .interpolate(d3.interpolateLab);

                var hexbin = d3.hexbin()
                    .size([width, height])
                    .radius(3);

                _data.forEach(function (d) {
                    var p = projection([d.lng, d.lat]);
                    d[0] = p[0];
                    d[1] = p[1];
                });

                svg.append("g")
                    .attr("class", "hexagons")
                    .selectAll("path")
                    .data(hexbin(_data).sort(function (a, b) {
                        return b.length - a.length;
                    }))
                    .enter().append("path")
                    .attr("d", function (d) {
                        return hexbin.hexagon(2.8);
                    })//radius(d.length)); })
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .style("fill", function (d) {
                        return color(d3.median(d, function (d) {
                            return +d.date;
                        }));
                    });
            }
        })
    }

    //my.onBrush = function() {
    //    console.log(my.selection);
    //    //console.log(this, arguments ,"map knows brushed");
    //    // in the line above, "this" prints out the "my" object,
    //    // "arguments" prints out the arguments sent when the event was triggered.
    //
    //};

    d3.rebind(my, dispatch, 'on');
    return my;
};