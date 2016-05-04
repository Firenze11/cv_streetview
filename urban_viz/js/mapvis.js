if(!d3.custom) d3.custom = {};

d3.custom.mapVis = function module() {
    var width = 265, // default width
        height = 265, // default height
        shapeType = "polygon", // OR "point"
        duration = 500;
    var radius = 2;
    var color = d3.scale.cubehelix();

    var selection, data = [];

    var dispatch = d3.dispatch("locClicked");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.neighborhood + "</span>";
        });

    // actually exactly the same pattern as not using this internal
    // function object, and returning "this".
    // whether to return "this" or the internal function object ("my")
    // doesn't really matter because, in the end, you want to keep
    // those variables defined by "var" FROM being exposed to outside

    function my(_selection) {
        selection = _selection;
        selection.each(function(_data) {
            data = data.concat(_data);
        });
        update();
    }

    function update() {
        selection.each(function(_data) {
            // generate chart here; `d` is the data and `this` is the element
            var svg = d3.select(this).select('svg');
            if (!svg[0][0]) svg = d3.select(this).append('svg');
            //console.log(svg);
            svg.transition().duration(duration).attr({width: width, height: height});

            svg.call(tip);

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
                    .attr("class", function(d) {
                        return "district " + d.properties.NAME;
                    })
                    .attr("d", path);

            } else if (shapeType === "point") {  //.................................point map
                var symbols = svg.selectAll("circle")
                    .data(_data);
                symbols.enter().append("circle")
                    .attr("class", function (d) {
                        return d.city + "_" + d.id;
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .on("click", function(d) {
                        dispatch.locClicked(d);
                    });
                symbols.attr("r", radius)
                    .attr("transform", function (d) {
                        var p = projection([d.lng, d.lat]);
                        return "translate(" + p[0] + "," + p[1] + ")";
                    });
                symbols.exit().remove();

            } else if (shapeType === "hexbin") {  //................................hexbin map

                color.domain([0, 20]);

                var hexbin = d3.hexbin()
                    .size([width, height])
                    .radius(3);

                _data.forEach(function (d) {
                    var p = projection([d.lng, d.lat]);
                    d[0] = p[0];
                    d[1] = p[1];
                });

                var hexagons = svg.selectAll("path")
                    .data(hexbin(_data).sort(function (a, b) {
                        return b.length - a.length;
                    }));
                hexagons.enter().append("path")
                    .attr("class", "hexagon");
                hexagons.attr("d", function (d) {
                        return hexbin.hexagon(2.8);
                    })//radius(d.length)); })
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .style("fill", function (d) {
                        if(!d[0].category) {
                            return "#aaa";
                        } else {
                            return color(most(d, function(e) {
                                return d.category;
                            }));
                        }
                    });
                hexagons.exit().remove();
            }
        })
    }

    function most(arr, callback) {
        //var count = {};
        //var cateArr = arr.map(callback);
        //cateArr.forEach( function(d) {
        //    var cate = count[d];
        //    cate = cate ? 1 : cate++;
        //});
        // http://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
        if(arr.length == 0)
            return null;
        var modeMap = {};
        var maxEl = arr[0], maxCount = 1;
        var cateArr = arr.map(callback);
        for(var i = 0; i < cateArr.length; i++) {
            var el = cateArr[i];
            if(modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;
            if(modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
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

    my.tip = function(value) {
        //if (!arguments.length) return shapeTypee
        tip.html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d[value] + "</span>";
        });
        return my;
    };

    my.update = update;

    my.highlightSelection = function(_) {
        if(shapeType === 'point') {
            var actives = _[0], extents = _[1];
            selection.selectAll("circle").classed("highlight", function(d) {
                return actives.length > 0
                    &&
                    actives.every(function(p, i) {
                        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                    });// ? null : "none";
            });
        } else if (shapeType === "polygon") {
            var args = Array.prototype.slice.call(_); // convert "arguments" object to array
            console.log(_, arguments, args);
            selection.selectAll(".district").classed("highlight", function(d) {
                return args.indexOf(d.properties.NAME) !== -1;
            });
        }
    };

    my.highlightCluster = function(_) {
        if(shapeType === 'hexbin') {
            //selection.selectAll("hexagon").style("fill", function(d) {
            //    if(d.ancestors.indexOf(_) != -1) {
            //        console.log($(this));
            //        return "#f00";
            //    } else {
            //        return "#0ff";
            //    }
            //});
            var n_nodes = 34017;
            var isOpen = _.mode == "open" ? 1 : 0;
            data.forEach( function(d, i) {
                d.category = n_nodes - 1 - d.ancestors[isOpen + _.depth];
                if(i % 100 === 0) console.log(d.category);
            });

        } else if (shapeType === "polygon") {

        }
        update();
    };

    d3.rebind(my, dispatch, 'on');
    return my;
};