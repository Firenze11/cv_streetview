/**
 * Created by lezhi on 5/2/2016.
 */
if(!d3.custom) d3.custom = {};

d3.custom.treeVis = function module() {
    var margin = {top: 0, right: 20, bottom: 0, left: 60},
        width = 1120 - margin.right - margin.left,
        height = 300 - margin.top - margin.bottom;
    var svg;

    var map = {}, colorMap = {};
    var n_nodes = 34017, n_leaves = 17009;
    var color = d3.scale.cubehelix().domain([-0.1,.4, 1])
        .range([
            d3.hsl(-100, 0.75, 0.40),
            d3.hsl(  80, 1.50, 0.85),
            d3.hsl( 260, 0.75, 0.40)
        ]);
    var texts={ 1:"all",
                2: "non-urban",
                3: "open, suburban",
                4: "suburban - less intimate",
                5: "urban",
                6: "suburban - intimate",
                7: "industrial-like",
                8: "city canter-like",
                9: "suburban residential with limited greenery",
                10: "open, road, suburban residential",
                11: "medium-rise",
                12: "greenery, mixed",
                103: "greenery, pure" };

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

    var tree = d3.layout.cluster()
        .size([height, width])
        .sort( function(a,b) {
            return b.level - a.level;
        })
        .separation( function(a,b) {
            return a.parent == b.parent ? 1 : 1.5;
        });

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

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
            root.x0 = height / 2;
            root.y0 = 0;


            collapse(root);
            //root.children.forEach(collapse);
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

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = Math.min((d.level-1) * 170 + 20, width-8); });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("mouseover", function(d) { console.log(d.x); })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function(d) { return d._children ? color(d.x/height) : "#fff"; });

        nodeEnter.append("text")
            .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
            .text(function(d) { return texts[d.level]; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 7.5)
            .style("fill", function(d) { return d._children ? color(d.x/height) : "#fff"; });

        // update color map
        nodeUpdate.each( function(d) {
            colorMap[n_nodes-1-d.id] = d.x / height;
        });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
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