/**
 * Created by lezhi on 5/8/2016.
 */
if(!d3.custom) d3.custom = {};

// http://bl.ocks.org/mbostock/2429963
d3.custom.packVis = function module() {
    var margin = {top: 0, right: 20, bottom: 0, left: 60},
        width = 1120 - margin.right - margin.left,
        height = 1000 - margin.top - margin.bottom;
    var svg;

    var map = {}, root = {children: []}, colorMap = {};
    var n_nodes = 34017, n_leaves = 17009, count= 0, timer;
    var color = d3.scale.cubehelix().domain([0, height]);

    var dispatch = d3.dispatch("nodeClicked");

    //var tip = d3.tip()
    //    .attr('class', 'd3-tip tip-inverse')
    //    .offset([-10, 0])
    //    .html(function(d) {
    //        return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.id + "</span>";
    //    });

    var diameter = 960,
        format = d3.format(",d");

    var pack = d3.layout.pack()
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return 1; });

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg')
                .attr("width", diameter)
                .attr("height", diameter)
                .append("g")
                .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

            //svg.call(tip);

            //all_leaves();
            root = build_tree(_data);

            update(root);
        });
    }

    function update(_top) {
        var focus = root,
            nodes = pack.nodes(root),
            view;

        var circle = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        //var text = svg.selectAll("text")
        //    .data(nodes)
        //    .enter().append("text")
        //    .attr("class", "label")
        //    .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        //    .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        //    .text(function(d) { return d.name; });

        var node = svg.selectAll("circle");

        svg .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }
    }

    function build_tree(children) {

        for (var i=0; i<children.length; i++) {
            var siblings_id = [+children[i][0], +children[i][1]];
            var siblings = siblings_id.map( function(d) {
                var node = map[d];
                if (!node) {
                    node = map[d] = {id: d, level: n_nodes-n_leaves+1};
                }
                return node;
            });
            var newNode = map[i+n_leaves] = {id: i+n_leaves, children: siblings, level: n_nodes-n_leaves-i};
            siblings.forEach( function(d) {
                d.parent = newNode;
            });
        }
        return map[n_nodes-1];
    }



    //function find_leaves(node) {
    //    var siblings = node.children.map( function(d) {
    //        return d.id;
    //    }), children0, children1;
    //
    //    if (map[siblings[0]].id < n_leaves) {
    //        children0 = [map[siblings[0]].id];
    //    } else {
    //        children0 = find_leaves(map[siblings[0]].id);
    //    }
    //    if (siblings[1] < n_leaves) {
    //        children1 = [map[siblings[0]].id];
    //    } else {
    //        children1 = find_leaves(map[siblings[1]].id);
    //    }
    //
    //    return children0.concat(children1);
    //}

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