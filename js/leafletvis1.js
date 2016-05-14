MapVis = function(_parentElement, _data){

    this.lng_fix = Math.cos(42.352131 * Math.PI/180.0);
    this.imgRoot = "/Dropbox/thesis/img/boston/";

    this.parentElement = _parentElement;
    this.data = _data.filter( function(d) { return d.color; } );
    // Create a map in the div #map
    L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
    //http://stackoverflow.com/questions/10337640/how-to-access-the-dom-element-that-correlates-to-a-d3-svg-object
    this.map = L.mapbox.map(this.parentElement[0][0], 'mapbox.dark', {
                  zoomControl: false
                })
                .setView([42.352131, -71.090669], 13);
                //console.log(this.parentElement[0][0]);
    this.initVis();
};

MapVis.prototype.initVis = function(){
    var that = this;    
    this.svg = d3.select(this.map.getPanes().overlayPane).append("svg"),
    this.g = this.svg.append("g").attr("class", "leaflet-zoom-hide");    
    // default
    this.options = {};
    this.c20b = d3.scale.category20()
        .domain(unique(this.data.map( function(d) {
            return d.label;
        })));
    this.wrangleData(this.options); // filter, aggregate, modify data   
    this.updateVis(); // call the update method

    function unique(list) {
        var result = [];
        $.each(list, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    }
};

MapVis.prototype.updateVis = function(){
    var that = this;

    // these two statements can be moved to initvis but projectpoint will need to be attached to MapVis directly, and the "this" in projectpoint need to be changed in order to refer to "point" in "{point: this.projectPoint}" below...
    // this.transform = d3.geo.transform({point: projectPoint}); //d3.geo.transform(methods): Creates a new stream transform using the specified hash of methods. The hash may contain implementations of any of the standard stream listener methods: sphere, point, lineStart, lineEnd, polygonStart and polygonStartonEnd
    // this.bldg_path = d3.geo.path().projection(this.transform); //projection(location): Projects forward from spherical coordinates (in degrees) to Cartesian coordinates (in pixels). Returns an array [x, y] given the input array [longitude, latitude].

    var picCircles = this.g.selectAll("circle")
                            .data(this.data);
    picCircles.enter()
        .append("circle")
        .attr("r", 6)
        .style("fill", function(d) { return d.color;})//return that.c20b(d.label); })
        .style('opacity', 0.8)
        .on("click", function(d) {
            console.log(d.label);
            var imgName = d.lat + "," + d.lng + "_" + d.dir + ".png";
            $("img#pic").attr('src', that.imgRoot + imgName);
        });
    picCircles.exit().remove();

    this.map.on("viewreset", reset);
    reset();

    // Reposition the SVG to cover the features.
    function reset() {
        var xBounds = d3.extent(that.data, function(d) { return projectPoint(d.lat, d.lng)[0]; }),
            yBounds = d3.extent(that.data, function(d) { return projectPoint(d.lat, d.lng)[1]; });

        that.svg.attr("width", xBounds[1] - xBounds[0])
            .attr("height", yBounds[1] - yBounds[0])
            .style("left", xBounds[0] + "px")
            .style("top", yBounds[0] + "px");

        that.g.attr("transform", "translate(" + -xBounds[0] + "," + -yBounds[0] + ")");
        picCircles
            .attr("transform", function(d) {
                var psudoLat = +d.lat,
                    psudoLng = +d.lng;
                return "translate(" + projectPoint(psudoLat, psudoLng) + ")";
            })
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
      var point = that.map.latLngToLayerPoint(new L.LatLng(x, y));
      return [point.x, point.y];
    }
};

MapVis.prototype.wrangleData= function(_data){
    this.data = _data;
    this.updateVis();
};