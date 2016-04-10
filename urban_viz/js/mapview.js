MapView = function(model, parentElement) {

    //this.imgRoot = "/Dropbox/thesis/img/boston/";

    //............................................................ INTERNAL variables
    var _that = this;
    var _model = model;
    //console.log("valid:", this.data.length);
    var _parentElement = parentElement;
    var _map;

    //............................................................ EVENT binding
    this.eventHandler = $.Event(this); // event object
    this.brushed = $.Event(this);

    $(_model.eventHandler).bind("itemChanged", function() {
        console.log(this);
        this.updateVis();
    });

    initVis();


    this.updateVis = function () {
        $("#"+_parentElement).find('.imgCircle').remove();

        _map.setView(centers[this.options.cityname], 13);

        this.c20b = d3.scale.category20()
            .domain(Array.apply(null, Array(20)).map(function (_, i) {
                return i;
            }));

        var outof = 4;

        var dotColor = function (d) {
            if (_that.options.category === 'color') {
                return d.M;
            } else if (_that.options.category === 'deep_clusters') {
                return _that.c20b(d.label_num);
            } else if (_that.options.category === 'confusion') {
                //console.log(d.properties.NAME, _that.dataMap.get(d.properties.NAME), _that.dataMap.get('Allston'));
                return _that.c20b(19 - _that.dataMap.get(d.properties.NAME)['cluster_outof_' + outof]);
            } else {
                //console.log(d.cat_from_20, _that.c20b(d.cat_from_20));
                return _that.c20b(d['color_for_' + _that.options.category]);
            }
        };
    //
    //    if (_that.options.category === 'confusion') {
    //        _that.dataMap = d3.map(_that.data, function (d) {
    //            return d.NAME;
    //        });
    //        $.getJSON("data/boundary_boston.json", function (data) {
    //            //console.log('geojson',data, data.features._map(function(d) { return d.properties.NAME; }));
    //            // remove features with no name
    //            //data.features = data.features.filter(function(d) { return d.properties.NAME; });
    //            //console.log(_that.dataMap.get('Allston'));
    //            console.log(_that.data);
    //            L.geoJson(data, {
    //                style: function (feature) {
    //                    //console.log(dotColor(feature));
    //                    return {color: dotColor(feature), fillOpacity: 0.4};
    //                },
    //                onEachFeature: function (feature, layer) {
    //                    layer.bindPopup(feature.properties.NAME + ', cluster= ' + _that.dataMap.get(feature.properties.NAME)['cluster_outof_' + outof]);
    //                },
    //                //className: function(feature) {
    //                //    return 'imgCircle '+ feature.properpies.OBJECTID;
    //                //}
    //            }).addTo(_map);
    //        });
    //    } else {
    //        this.data.forEach(function (d) {
    //            var coor = d.dir ? psudoCoor(d) : [+d.lat, +d.lng];
    //
    //            L.circleMarker(coor, {
    //                stroke: false,
    //                fillColor: dotColor(d),
    //                fillOpacity: 0.5,
    //                radius: 5,
    //                className: 'imgCircle ' + d.label
    //            }).on('click', function () {
    //                console.log(d.label);
    //                var imgName = d.lat + "," + d.lng + "_" + d.dir + ".png";
    //                $("img#pic").attr('src', _that.imgRoot + imgName);
    //                console.log(d.label, d.cat_from_7, d.predLabel);
    //            }).addTo(_map);
    //        });
    //    }
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
        //    }).addTo(_that._map);
        //});

        this.wrangleData();
    };


    //............................................................ HELPER functions


    function initVis() {
        L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
        //http://stackoverflow.com/questions/10337640/how-to-access-the-dom-element-that-correlates-to-a-d3-svg-object
        _map = L.mapbox.map(_parentElement, 'mapbox.dark', {
            zoomControl: false
        }).setView([42.352131, -71.090669], 13);
    }

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

    return this;
};