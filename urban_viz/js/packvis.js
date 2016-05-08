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
        .size([diameter - 4, diameter - 4])//;
        .value(function(d) { return 1; });

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg')
                .attr("width", diameter)
                .attr("height", diameter)
                .append("g")
                .attr("transform", "translate(2,2)");

            //svg.call(tip);

            //all_leaves();
            timer = setInterval(function(){
                var top = build_tree(_data, count);
                if (count === 15) {
                    console.log(root);
                }
                update(root);
                count++;
                //console.log(count);
            }, 1);
        });
    }

    function update(_top) {
        var nodes = pack.nodes(_top);
        //console.log(nodes);

        var node = svg.selectAll(".node")
            .data(nodes, function(d) { return d.id; });
        var nodeEnter = node.enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "leaf node"; });

        nodeEnter.append("title")
            .text(function(d) { return d.id; });
            //.text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

        nodeEnter.append("circle");

        nodeEnter.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return "id: "+d.id+" depth: "+ d.depth; }); //.substring(0, d.r / 3); });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        node.select("circle").attr("r", function(d) { return d.r; });///////
        node.exit().remove();
    }

    function all_leaves() {
        var leaves = [];
        for (var i=0; i<n_leaves; i++) {
            if (!map[i]) {
                var node = map[i] = {id: i, level: n_nodes-n_leaves+1};
                leaves.push(node);
            }
        }
        return leaves;
    }

    function build_tree(children, c) {
        if(c >= 16) { //n_nodes-n_leaves) {
            clearInterval(timer);

            console.log("root",root);
            //console.log("map[13634].children",map[13634].children);
        } else {
            var siblings_id = [+children[c][0], +children[c][1]];
            var siblings = siblings_id.map( function(d) {
                var node = map[d];
                if (!node) {
                    node = map[d] = {id: d, level: n_nodes-n_leaves+1};
                    //root.children.push(node);
                    //console.log("node unrecorded", node);
                } else {
                    var ind = root.children.indexOf(node);
                    if (ind === -1) {
                        console.log("Error! -1!!!");
                        console.log(root.children);
                    } else {
                        console.log("old node!!!", node);
                        console.log(ind, root.children[ind]);
                        root.children.splice(ind,1);
                        console.log(root.children.map(function(d) { return d.id; }));
                    }
                }
                return node;
            });
            var newNode = map[c+n_leaves] = {id: c+n_leaves, children: siblings,
                                            level: n_nodes-n_leaves-c};
            siblings.forEach( function(d) {
                //var ind = root.children.indexOf(d);
                //if (ind === -1) {
                //    console.log("Error! -1!!!");
                //    console.log(root.children);
                //} else {
                //    root.children.splice(ind);
                //    console.log("old node!!!", d);
                //}

                //d.parent = newNode;
            });
            root.children.push(newNode);
            console.log("newnode", newNode);

            //ancestors.forEach( function(d, i) {
            //    map[i].ancedtors = d;
            //});

            //console.log(map[n_nodes-2].level);
            //return map[n_nodes-1];
        }
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