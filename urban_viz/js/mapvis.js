MapVis = function(_parentElement, _data, _eventHandler){

    this.lng_fix = Math.cos(42.352131 * Math.PI/180.0);
    this.imgRoot = "/Dropbox/thesis/img/boston/";
    //# barcelona   41.390298, 2.162001
    //# boston      42.352131, -71.090669
    //# brasilia    -15.797616, -47.891761
    //# chicago     41.875604, -87.645203
    //# HK          22.302156, 114.170416
    //# london      51.507360, -0.127630
    //# munich      48.139741, 11.565510
    //# paris       48.857527, 2.341560
    //# NY          40.747783, -73.968068
    //# SF          37.767394, -122.447354
    //# singapore   1.302876, 103.829547
    //# tokyo       35.684226, 139.755518

    this.parentElement = _parentElement;
    this.data = _data.filter( function(d) { return d.M; } );
    console.log("valid:", this.data.length);
    this.eventHandler = _eventHandler;
    // Create a map in the div #map
    L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
    //http://stackoverflow.com/questions/10337640/how-to-access-the-dom-element-that-correlates-to-a-d3-svg-object
    this.map = L.mapbox.map(this.parentElement[0][0], 'mapbox.dark', {
                  zoomControl: false
                })
                .setView([42.352131, -71.090669], 13);
                //console.log(this.parentElement[0][0]);
    this.initVis();
}

MapVis.prototype.initVis = function(){
    var that = this;    
    this.svg = d3.select(this.map.getPanes().overlayPane).append("svg"),
    this.g = this.svg.append("g").attr("class", "leaflet-zoom-hide");    
    // default
    //this.options = {"type": "publication", "groupby": "dptm", "year":2014};
    this.options = {};
    this.wrangleData(this.options); // filter, aggregate, modify data   
    this.updateVis(); // call the update method
}

MapVis.prototype.updateVis = function(){
    var that = this;

    // these two statements can be moved to initvis but projectpoint will need to be attached to MapVis directly, and the "this" in projectpoint need to be changed in order to refer to "point" in "{point: this.projectPoint}" below...
    // this.transform = d3.geo.transform({point: projectPoint}); //d3.geo.transform(methods): Creates a new stream transform using the specified hash of methods. The hash may contain implementations of any of the standard stream listener methods: sphere, point, lineStart, lineEnd, polygonStart and polygonStartonEnd
    // this.bldg_path = d3.geo.path().projection(this.transform); //projection(location): Projects forward from spherical coordinates (in degrees) to Cartesian coordinates (in pixels). Returns an array [x, y] given the input array [longitude, latitude].

    var picCircles = this.g.selectAll("circle")
                            .data(this.data);
    picCircles.enter()
        .append("circle")
        .attr("r", 4)
        .style("fill", function(d) { return d.M; })
        .on("click", function(d) {
            console.log(d);
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
                var sep = 0.0004;

                if (d.dir == 2) {psudoLat = +d.lat - sep; }
                if (d.dir == 0) {psudoLat = +d.lat + sep; }

                if (d.dir == 3) {psudoLng = +d.lng - sep/that.lng_fix; }
                if (d.dir == 1) {psudoLng = +d.lng + sep/that.lng_fix; }
                //psudoLat = d.lat;

                return "translate(" + projectPoint(psudoLat, psudoLng) + ")";
            })
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
      var point = that.map.latLngToLayerPoint(new L.LatLng(x, y));
      //this.stream.point(point.x, point.y);
      //console.log([point.x, point.y]);
      return [point.x, point.y];
    }
}

MapVis.prototype.wrangleData= function(_options){
  // var that = this;
    
  //   if (_options.type) {
  //     this.initPackage(this.options);
  //   }
  //   this.changeYear(this.options.year);
}