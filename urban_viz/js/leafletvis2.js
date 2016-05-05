if(!d3.custom) d3.custom = {};

d3.custom.leafletVis = function() {
    L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';

    var shapeType = "point", // OR "point"
        duration = 750;
    var category = "color";
    var color = d3.scale.cubehelix()
        .range([
            d3.hsl(-100, 0.75, 0.40),
            d3.hsl(  80, 1.50, 0.85),
            d3.hsl( 260, 0.75, 0.40)
        ]),
        colorMap; // cluster# -> color

    var selection, data = [], map, svg, g, markers = [];

    var dispatch = d3.dispatch("locClicked");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Neighborhood:</strong> <br> <span class='selected'>" + d.neighborhood + "</span>";
        });

    function my(_selection) {
        selection = _selection;
        selection.each(function (_data) {

            var center = [_data.center[1], _data.center[0]];
            map = L.mapbox.map(this, 'mapbox.dark', { //"this" here is the _selection
                //zoomControl: false
            }).setView(center, 13);

            svg = d3.select(map.getPanes().overlayPane).append("svg");
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
            svg.call(tip);

        });

        update();
    }

    function update() {
        selection.each(function (_data) {
            for(i=0;i<markers.length;i++) {
                map.removeLayer(markers[i]);
            }
            markers = [];

            var center = [_data.center[1], _data.center[0]];
            map.setView(center, 13);

            var ext = d3.extent(_data.filter( function(d) { return d[category]; }),
                                function(d) { return +d[category]; });
            color.domain([ext[0], 0.5*(ext[0]+ext[1]), ext[1]]);

            //var picCircles = svg.selectAll("circle")
            //    .data(_data);
            //
            //picCircles.enter()
            //    .append("circle")
            //    .attr("r", 6)
            //    .style('opacity', 0.8)
            //    .on("click",  function(d) {
            //        dispatch.locClicked(d);
            //    });
            //
            //picCircles.style("fill", function (d) {
            //    return d[category];
            //});//return that.c20b(d.label); })
            //
            //picCircles.exit().remove();
            //
            //map.on("viewreset", reset);
            //reset();
            //
            //// Reposition the SVG to cover the features.
            //function reset() {
            //    var xBounds = d3.extent(_data, function(d) { return projectPoint(d.lat, d.lng)[0]; }),
            //        yBounds = d3.extent(_data, function(d) { return projectPoint(d.lat, d.lng)[1]; });
            //
            //    svg.attr("width", xBounds[1] - xBounds[0])
            //        .attr("height", yBounds[1] - yBounds[0])
            //        .style("left", xBounds[0] + "px")
            //        .style("top", yBounds[0] + "px");
            //
            //    g.attr("transform", "translate(" + -xBounds[0] + "," + -yBounds[0] + ")");
            //    picCircles
            //        .attr("transform", function(d) {
            //            var psudoLat = +d.lat,
            //                psudoLng = +d.lng;
            //            return "translate(" + projectPoint(psudoLat, psudoLng) + ")";
            //        })
            //}
            //
            //// Use Leaflet to implement a D3 geometric transformation.
            //function projectPoint(x, y) {
            //    var point = map.latLngToLayerPoint(new L.LatLng(x, y));
            //    return [point.x, point.y];
            //}
            if (shapeType === "polygon") {
                L.geoJson(_data.arr, {
                    style: function (feature) {
                        //console.log(dotColor(feature));
                        return {color: (cluster === 'color') ? feature.value : palette(feature.value),
                            fillOpacity: 0.4};
                    },
                    onEachFeature: function (feature, layer) { // probably need to change to more generic representation
                        layer.bindPopup(feature.properties.NAME + ', cluster= ' + _that.dataMap.get(feature.properties.NAME)['cluster_outof_' + outof]);
                    },
                    className: function(feature) {
                        return 'imgCircle '+ feature.properpies.OBJECTID;
                    }
                }).addTo(map);

            } else {
                _data.forEach(function (d) {
                    var coor = d.dir ? psudoCoor(d) : [+d.lat, +d.lng];

                    var marker = L.circleMarker(coor, {
                        stroke: false,
                        fillColor: (category === 'color') ? d[category] : color(+d[category]),
                        fillOpacity: d[category] ? 0.8 : 0,
                        radius: 6,
                        className: 'imgCircle ' + d.label
                    })
                    .on('click', function(d) { dispatch.locClicked(d); })
                    .addTo(map);
                    markers.push(marker);
                });
            }
        });
    }

    //my.width = function(_x) {
    //    if (!arguments.length) return width;
    //    width = parseInt(_x);
    //    return this;
    //};
    my.category = function(_x) {
        if (!arguments.length) return category;
        category = _x;
        return this;
    };

    my.update = update;

    d3.rebind(my, dispatch, 'on');


    //this.onDataChange = function (_data, _options) {
    //    this.data = _data;
    //
    //    this.options = _options;
    //
    //    var lat = centers [this.options.cityname] [0];
    //    this.lng_fix = Math.cos(lat * Math.PI / 180.0);
    //
    //    //$.getJSON("data/boundary_boston.geojson", function(data) {
    //    //    L.geoJson(data, {
    //    //        //style: function (feature) {
    //    //        //    return {color: feature.properties.color};
    //    //        //},
    //    //        //onEachFeature: function (feature, layer) {
    //    //        //    layer.bindPopup(feature.properties.description);
    //    //        //}
    //    //    }).addTo(_that.map);
    //    //});
    //
    //    this.wrangleData();
    //};

    return my;
};