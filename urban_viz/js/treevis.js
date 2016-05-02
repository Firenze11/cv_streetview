/**
 * Created by lezhi on 5/2/2016.
 */
if(!d3.custom) d3.custom = {};

d3.custom.forceVis = function module() {
    var width = 1120,
        height = 500;
    var svg;

    var dispatch = d3.dispatch("nodeHovered");

    var tip = d3.tip()
        .attr('class', 'd3-tip tip-inverse')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.name + "</span>";
        });

    function my(_selection) {
        _selection.each(function(_data) {
            //console.log(_data);
            svg = d3.select(this).append('svg');
            svg.transition().duration(duration).attr({width: width, height: height});

            svg.call(tip);



        });
    }

    function build_tree(children) {
        var map = {};
        var n_nodes = 34017;
        var n_leaves = 17009;

        for (var i=0; i<children.length; i++) {
            var siblings_id = [+children[i][0], +children[i][1]];
            var siblings = siblings_id.map( function(d) {
                var node = map[d];
                if (!node) {
                    node = map[d] = {id: d};
                }
                return node;
            });
            var newNode = map[i+n_leaves] = {id: i+n_leaves, children: siblings};
            siblings.forEach( function(d) {
                d.parent = newNode;
            });
        }

        //var nodes = valuesToArray(map);
        //
        //function valuesToArray(obj) {
        //    return Object.keys(obj).map(function (key) { return obj[key]; });
        //}
        //var heads = nodes.filter( function(d) {
        //    return (!d.parent);
        //});
        //
        //console.log(heads);

        //console.log(map[n_nodes-1]);
        return map[n_nodes-1];
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