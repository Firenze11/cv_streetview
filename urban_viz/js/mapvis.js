MapVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data.filter( function(d) { return d.M; } );
    console.log("valid:", this.data.length);
    this.eventHandler = _eventHandler;
    // Create a map in the div #map
    L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
    //http://stackoverflow.com/questions/10337640/how-to-access-the-dom-element-that-correlates-to-a-d3-svg-object
    this.map = L.mapbox.map(this.parentElement[0][0], 'mapbox.light', {
                  zoomControl: false
                })
                .setView([42.360067, -71.091809], 13);
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
                .attr("r", 5)
                .attr("transform", function(d) { return "translate(" + projectPoint(d.lat, d.lng) + ")"; })
                .style("fill", function(d) { return d.M; }); 
    picCircles.exit().remove();

    //this.map.on("viewreset", reset);
    //reset();

    // Reposition the SVG to cover the features.
    function reset() {
      var bounds = that.bldg_path.bounds(that.footprintMeta),
          topLeft = bounds[0],
          bottomRight = bounds[1];

      that.svg.attr("width", bottomRight[0] - topLeft[0])
              .attr("height", bottomRight[1] - topLeft[1])
              .style("left", topLeft[0] + "px")
              .style("top", topLeft[1] + "px");

      that.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
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