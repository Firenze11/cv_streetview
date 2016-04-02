MapVis = function(_parentElement, _eventHandler){

    this.imgRoot = "/Dropbox/thesis/img_dense/boston/";

    this.parentElement = _parentElement;
    this.options = {};
    this.eventHandler = _eventHandler;

    //console.log("valid:", this.data.length);

    // Create a map in the div #map
    L.mapbox.accessToken = 'pk.eyJ1IjoibGV6aGlsaSIsImEiOiIwZTc1YTlkOTE1ZWIzYzNiNDdiOTYwMDkxM2U1ZmY0NyJ9.SDXoQBpQys6AdTEQ9OhnpQ';
    //http://stackoverflow.com/questions/10337640/how-to-access-the-dom-element-that-correlates-to-a-d3-svg-object
    this.map = L.mapbox.map(this.parentElement[0][0], 'mapbox.dark', {
                  zoomControl: false
                });
                //.setView( centers[cityname], 13);
    //this.initVis();
}

//MapVis.prototype.initVis = function(){
//    var that = this;
//    //this.svg = d3.select(this.map.getPanes().overlayPane).append("svg"),
//    //this.g = this.svg.append("g").attr("class", "leaflet-zoom-hide");
//
//    // default
//    //this.options = {"type": "publication", "groupby": "dptm", "year":2014};
//
//}

MapVis.prototype.updateVis = function(){
    var that = this;
    $('.imgCircle').remove();

    this.map.setView( centers[this.options.cityname], 13);

    this.c20b = d3.scale.category20()
        .domain(unique(this.data.map( function(d) {
            return d.label;
        })));

    var dotColor = function(d) {
        if(that.options.category === 'color') {
            return d.M;
        } else {
            return that.c20b(d.predLabel_num);
        }
    };
    this.data.forEach( function(d) {
        var coor = d.dir ? psudoCoor(d) : [+d.lat,+d.lng] ;

        L.circleMarker(coor, {  stroke: false,
                                fillColor: dotColor(d),
                                fillOpacity: 0.5,
                                radius: 5,
                                className: 'imgCircle '+ d.label
        }).on('click', function() {
            //console.log(d.label);
            var imgName = d.lat + "," + d.lng + "_" + d.dir + ".png";
            $("img#pic").attr('src', that.imgRoot + imgName);
        }).addTo(that.map);
    });

    function psudoCoor(d) {
        var psudoLat = +d.lat,
            psudoLng = +d.lng;
        var sep = 0.0004;
        if (d.dir == 2) {psudoLat = +d.lat - sep; }
        if (d.dir == 0) {psudoLat = +d.lat + sep; }
        if (d.dir == 3) {psudoLng = +d.lng - sep/that.lng_fix; }
        if (d.dir == 1) {psudoLng = +d.lng + sep/that.lng_fix; }
        return [psudoLat, psudoLng];
    }
};

MapVis.prototype.wrangleData= function(_options){
    var that = this;

    this.updateVis(); // call the update method
};

MapVis.prototype.onDataChange= function(_data, _options) {
    this.data = _data;

    this.options = _options;

    var lat = centers [this.options.cityname] [0];
    this.lng_fix = Math.cos(lat * Math.PI/180.0);

    this.wrangleData();
};