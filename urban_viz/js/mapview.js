d3.custom.mapVis = function module() {
    var width = 265, // default width
        height = 265, // default height
        shapeType = "polygon", // OR "point"
        duration = 500;
    var svg;


    // actually exactly the same pattern as not using this internal
    // function object, and returning "this".
    // whether to return "this" or the internal function object ("my")
    // doesn't really matter because, in the end, you want to keep
    // those variables defined by "var" FROM being exposed to outside

    function my(_selection) {
        // generate chart here, using `width` and `height`
        _selection.each(function(_data) {
            // generate chart here; `d` is the data and `this` is the element
            svg = d3.select(this).append('svg');
            svg.transition().duration(duration).attr({width: width, height: height});

            var projection = d3.geo.mercator()
                .scale(132000)
                .rotate([-_data.center[0], -_data.center[1]])  // negative!!
                .translate([width/2, height/2]); // LONG - LAT of center point

            var path = d3.geo.path()
                .projection(projection);


            if(shapeType === "polygon") {
                svg.selectAll("path")
                    .data(_data.features)
                    .enter().append("path")
                    .attr("class", "district")
                    .attr("d", path);

            } else if(shapeType === "point") {
                svg.selectAll("circle")
                    .data(_data)
                    .enter().append("circle")
                    .attr("class", "cccc")
                    .attr("r", 1.2)
                    .attr("transform", function(d) {
                        var p = projection([d.lng, d.lat]);
                        return "translate("+p[0]+","+p[1]+")";
                    });
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

    my.shapeType = function(value) {
        if (!arguments.length) return shapeType;
        shapeType = value;
        return my;
    };

    return my;
};