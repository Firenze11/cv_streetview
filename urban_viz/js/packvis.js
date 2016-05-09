/**
 * Created by lezhi on 5/8/2016.
 */
if(!d3.custom) d3.custom = {};

// http://bl.ocks.org/mbostock/2429963
d3.custom.packVis = function module() {
    var margin = {top: 0, right: 20, bottom: 0, left: 20},
        width = 1170 - margin.right - margin.left,
        height = 300 - margin.top - margin.bottom;
    var svg;

    var map = {}, root = {children: []}, colorMap = {};
    var n_nodes = 34017, n_leaves = 17009, count= 0, timer;
    var color = d3.scale.cubehelix().domain([0, height]);

    var dispatch = d3.dispatch("clusterClicked");

    //var tip = d3.tip()
    //    .attr('class', 'd3-tip tip-inverse')
    //    .offset([-10, 0])
    //    .html(function(d) {
    //        return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.id + "</span>";
    //    });

    var diameter = width;

    var pack = d3.layout.pack()
        .size([diameter - 4, diameter - 4])//;
        .value(function(d) { return 1; });

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate("+2+","+(height*4/5-diameter/2)+")");

            //svg.call(tip);

            //all_leaves();
            root = build_tree(_data);

            update(root);
        });
    }

    function update(_top) {
        var nodes = pack.nodes(_top);

        var node = svg.selectAll(".node")
            .data(nodes.filter(function(d) {
                return d.parent ? d.parent.value > 900 : d.value > 500; }), function(d) { return d.id; });
        var nodeEnter = node.enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
            .on("click", function(d) {
                var leaves = find_leaves(d);
                var imgId = leaves
                    .filter( function() { return Math.random() < 100 / d.value; })
                    .map( function(e) { return e.id; });
                //console.log(imgId);
                dispatch.clusterClicked(imgId);
            });

        nodeEnter.append("title")
            .text(function(d) { return d.id; });

        nodeEnter.append("circle");

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        node.select("circle").attr("r", function(d) { return d.r; });///////
        node.exit().remove();
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
            //siblings.forEach( function(d) {
            //    d.parent = newNode;
            //});
        }
        return map[n_nodes-1];
    }

    function find_leaves(node) {
        var siblings = node.children.map( function(d) {
            return d.id;
        }), children0, children1;

        if (map[siblings[0]].id < n_leaves) {
            children0 = [map[siblings[0]]];
        } else {
            children0 = find_leaves(map[siblings[0]]);
        }
        if (siblings[1] < n_leaves) {
            children1 = [map[siblings[0]]];
        } else {
            children1 = find_leaves(map[siblings[1]]);
        }
        return children0.concat(children1);
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