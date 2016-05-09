/**
 * Created by lezhi on 4/27/2016.
 */
if(!d3.custom) d3.custom = {};

d3.custom.demersVis = function module() {

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 960 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom,
        duration = 500;
        padding = 3;

    var projection, path,
    //radius = function() { return 25;},

        radius = d3.scale.sqrt()
            .domain([0, 3000])
            .range([0, 25]),

        force = d3.layout.force()
            .charge(0)
            .gravity(0)
            .size([width, height]);


    var selection;

    var dispatch = d3.dispatch("locClicked");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.name + "</span>";
        });

    function my(_selection) {
        selection = _selection;
        //update();
    }

    function update() {
        selection.each(function(_data) {
            //_data.features.forEach( function(d) {
            //    console.log(d.properties.NAME);
            //})

            var nbhMap = d3.map(_data.metaData, function(d) {
                return d.name;
            });

            var svg = d3.select(this).select('svg');
            svg.remove();
            svg = d3.select(this).append('svg');

            svg.transition().duration(duration).attr({width: width, height: height});

            svg.call(tip);

            projection = d3.geo.mercator()
                .scale(320000)
                .rotate([-_data.center[0], -_data.center[1]])  // negative!!
                .translate([width / 2, height / 2]); // LONG - LAT of center point

            path = d3.geo.path()
                .projection(projection);

            var area = svg.selectAll("path")
                .data(_data.features);
            area.enter().append("path")
                .attr("class", function(d) {
                    return "district " + d.properties.NAME;
                })
                .attr("d", path);

            var nodes = _data.features
                .map(function(d) {
                    var nbhName = d.properties.NAME.replace(/[\/ -]/g, ""),
                        point = path.centroid(d);
                        //value = 1; //_data.metaData[d.properties.NAME];;
                    //console.log(nbhName);
                    return {
                        x: point[0], y: point[1],
                        x0: point[0], y0: point[1],
                        r: radius(path.area(d)), /////////////////////
                        fileName: nbhMap.get(nbhName)[3]
                    };
                });

            force
                .nodes(nodes)
                .on("tick", tick)
                .start();

            var node = svg.selectAll("img")
                .data(nodes);
            node.enter().append("svg:image")
                .attr("xlink:href", function(d) {
                    return imgroot_dense+ d.fileName;
                })
                .attr("opacity",0.8)
                .attr("x", '-12px')
                .attr("y", '-12px')
                .attr("width", function(d) { return d.r * 2; })
                .attr("height", function(d) { return d.r * 2; });

            node.exit().remove();
            area.exit().remove();

            function tick(e) {
                node.each(gravity(e.alpha * .1))
                    .each(collide(.5))
                    .attr("transform", function(d) {
                        return "translate(" + (d.x - d.r) + "," + (d.y - d.r) + ")";
                    });
            }

            function gravity(k) {
                return function(d) {
                    d.x += (d.x0 - d.x) * k;
                    d.y += (d.y0 - d.y) * k;
                };
            }

            function collide(k) {
                var q = d3.geom.quadtree(nodes);
                return function(node) {
                    var nr = node.r + padding,
                        nx1 = node.x - nr,
                        nx2 = node.x + nr,
                        ny1 = node.y - nr,
                        ny2 = node.y + nr;
                    q.visit(function(quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== node)) {
                            var x = node.x - quad.point.x,
                                y = node.y - quad.point.y,
                                lx = Math.abs(x),
                                ly = Math.abs(y),
                                r = nr + quad.point.r;
                            if (lx < r && ly < r) {
                                if (lx > ly) {
                                    lx = (lx - r) * (x < 0 ? -k : k);
                                    node.x -= lx;
                                    quad.point.x += lx;
                                } else {
                                    ly = (ly - r) * (y < 0 ? -k : k);
                                    node.y -= ly;
                                    quad.point.y += ly;
                                }
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            }
        })
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

    my.update = update;


    d3.rebind(my, dispatch, 'on');
    return my;
};