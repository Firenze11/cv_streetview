d3.custom = {};

d3.custom.mapVis = function module() {
    var width = 265, // default width
        height = 300; // default height


    // actually exactly the same pattern as not using this internal
    // function object, and returning "this".
    // whether to return "this" or the internal function object ("my")
    // doesn't really matter because, in the end, you want to keep
    // those variables defined by "var" FROM being exposed to outside
    function my(_selection) {
        // generate chart here, using `width` and `height`
        _selection.each(function(_data) {
            // generate chart here; `d` is the data and `this` is the element

            var a = _data.center;

            var projection = d3.geo.mercator()
                .scale(128000)
                .rotate([-a[0], -a[1]])
                .translate([width/2, height/2]); // LONG - LAT of center point

            var path = d3.geo.path()
                .projection(projection);
            var svg = d3.select(this).append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.selectAll("path")
                .data(_data.features)
                .enter().append("path")
                .attr("class", "district")
                .attr("d", path);
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

    return my;
}