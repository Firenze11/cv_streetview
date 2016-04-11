
d3.custom.mapVis = function(model, parentElement) {

    var centers = {
        barcelona   :[41.390298, 2.162001],
        boston      :[42.352131, -71.090669],
        brasilia    :[-15.797616, -47.891761],
        chicago     :[41.875604, -87.645203],
        hongkong    :[22.302156, 114.170416],
        london      :[51.507360, -0.127630],
        munich      :[48.139741, 11.565510],
        paris       :[48.857527, 2.341560],
        newyork     :[40.747783, -73.968068],
        sanfrancisco:[37.767394, -122.447354],
        singapore   :[1.302876, 103.829547],
        tokyo       :[35.684226, 139.755518]
    };
    var category = "geojson";

    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function (_data) {

            var center = centers[_data.city];

            var ext = d3.extent(_data.arr, function(d) { return d.value; });
            var palette = d3.scale.linear()
                .domain([ext[0], 0.5*(ext[0]+ext[1]), ext[1]])
                .range(["red", "white", "green"]);

            L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
            var map = L.mapbox.map(this[0][0], 'mapbox.dark', { //"this" here is the _selection
                zoomControl: false
            }).setView(center, 12);



            if (category === 'geojson') {
                L.geoJson(_data.arr, {
                    style: function (feature) {
                        //console.log(dotColor(feature));
                        return {color: (category === 'color') ? feature.value : palette(feature.value),
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
                this.data.forEach(function (d) {
                    var coor = d.dir ? psudoCoor(d) : [+d.lat, +d.lng];

                    L.circleMarker(coor, {
                        stroke: false,
                        fillColor: (category === 'color') ? feature.value : palette(feature.value),
                        fillOpacity: 0.5,
                        radius: 5,
                        className: 'imgCircle ' + d.label
                    }).on('click', function () {
                        console.log(d.label);
                        var imgName = d.lat + "," + d.lng + "_" + d.dir + ".png";
                        $("img#pic").attr('src', _that.imgRoot + imgName);
                        console.log(d.label, d.cat_from_7, d.predLabel);
                    }).addTo(map);
                });
            }

        });
    }


    exports.width = function(_x) {
        if (!arguments.length) return width;
        width = parseInt(_x);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) return height;
        height = parseInt(_x);
        duration = 0;
        return this;
    };
    exports.gap = function(_x) {
        if (!arguments.length) return gap;
        gap = _x;
        return this;
    };
    exports.ease = function(_x) {
        if (!arguments.length) return ease;
        ease = _x;
        return this;
    };
    d3.rebind(exports, dispatch, 'on');

    this.updateVis = function () {

    };

    this.wrangleData = function (_options) {

        this.updateVis(); // call the update method
    };

    this.onDataChange = function (_data, _options) {
        this.data = _data;

        this.options = _options;

        var lat = centers [this.options.cityname] [0];
        this.lng_fix = Math.cos(lat * Math.PI / 180.0);

        //$.getJSON("data/boundary_boston.geojson", function(data) {
        //    L.geoJson(data, {
        //        //style: function (feature) {
        //        //    return {color: feature.properties.color};
        //        //},
        //        //onEachFeature: function (feature, layer) {
        //        //    layer.bindPopup(feature.properties.description);
        //        //}
        //    }).addTo(_that.map);
        //});

        this.wrangleData();
    };


    //............................................................ HELPER functions


    function psudoCoor(d) {
        var psudoLat = +d.lat,
            psudoLng = +d.lng;
        var sep = 0.0004;
        if (d.dir == 2) {
            psudoLat = +d.lat - sep;
        }
        if (d.dir == 0) {
            psudoLat = +d.lat + sep;
        }
        if (d.dir == 3) {
            psudoLng = +d.lng - sep / _that.lng_fix;
        }
        if (d.dir == 1) {
            psudoLng = +d.lng + sep / _that.lng_fix;
        }
        return [psudoLat, psudoLng];
    }

    //............................................................ RETURN self


    return exports;
};