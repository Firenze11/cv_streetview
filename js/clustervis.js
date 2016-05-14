/**
 * Created by lezhi on 5/4/2016.
 */
if(!d3.custom) d3.custom = {};

// http://bl.ocks.org/mbostock/2429963
d3.custom.clusterVis = function module() {
    var margin = {top: 0, right: 20, bottom: 0, left: 60},
        width = 1120 - margin.right - margin.left,
        height = 51190 - margin.top - margin.bottom;
    var svg;

    var map = {}, colorMap = {};
    var n_nodes = 34017, n_leaves = 17009;
    var color = d3.scale.cubehelix().domain([0, height]);

    var dispatch = d3.dispatch("nodeClicked");

    //var tip = d3.tip()
    //    .attr('class', 'd3-tip tip-inverse')
    //    .offset([-10, 0])
    //    .html(function(d) {
    //        return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.id + "</span>";
    //    });

    var i = 0,
        duration = 500,
        root;

    var cluster = d3.layout.cluster()
        .size([height, width - 160]);

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg')
                //svg.transition().duration(duration)
                .attr({width: width + margin.left + margin.right,
                    height: height + margin.top + margin.bottom})
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //svg.call(tip);

            root = build_tree(_data);

            update(root);

        });
    }

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function update() {
        var nodes = cluster.nodes(root);

        nodes.forEach(function(d){
            d.y = 60*Math.log2(d.level+1)-50;
        });

        var link = svg.selectAll(".link")
            .data(cluster.links(nodes))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", elbow);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

        node.append("circle")
            .attr("r", 4.5);

        node.append("text")
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", 3)
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });
    }

    function elbow(d, i) {
        return "M" + d.source.y + "," + d.source.x
            + "V" + d.target.x + "H" + d.target.y;
    }

    // Toggle children on click.
    function click(d) {
        var mode;
        if (d.children) {
            d._children = d.children;
            d.children = null;
            mode = "close";
        } else {
            d.children = d._children;
            d._children = null;
            mode = "open";
        }
        update(d);
        dispatch.nodeClicked({depth: d.depth, id: d.id, mode: mode, cmap: colorMap });
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
            //ancestors.forEach( function(d, i) {
            //    map[i].ancedtors = d;
            //});
        }
        //console.log(map[n_nodes-2].level);
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