/**
 * Created by lezhi on 3/10/2016.
 */
ScatterVis = function(_parentElement, _data, _eventHandler){

    //this.lng_fix = Math.cos(42.352131 * Math.PI/180.0);
    //this.imgRoot = "/Dropbox/thesis/img/boston/";

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
    this.data = _data.filter( function(d) { return d[0]; } );
    console.log("valid:", this.data.length);
    this.eventHandler = _eventHandler;

    // console.log(this.parentElement.node());
    this.initVis();
}

ScatterVis.prototype.initVis = function(){
    var that = this;

    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = $(this.parentElement.node()).width() - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.x = d3.scale.linear()
        .range([0, this.width]);
    this.y = d3.scale.linear()
        .range([this.height, 0]);

    this.color = d3.scale.category20() ////////////////////
        .domain(unique(this.data.map( function(d) {
            return d.label;
        })));

    this.xAxis = d3.svg.axis()  ////////////might need to change on data change
        .scale(this.x)
        .orient("bottom");
    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // default
    //this.options = {"type": "publication", "groupby": "dptm", "year":2014};
    this.options = {};

    this.wrangleData(this.options); // filter, aggregate, modify data
    this.updateVis(); // call the update method

    function unique(list) {
        var result = [];
        $.each(list, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    }
}

ScatterVis.prototype.updateVis = function(){
    var that = this;

    this.x.domain(d3.extent(this.data, function(d) { return d.pc1; })).nice();
    this.y.domain(d3.extent(this.data, function(d) { return d.pc2; })).nice();

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", this.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("PC1");

    this.svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("PC2")

    this.svg.selectAll(".dot")
        .data(this.data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 2)
        .attr("cx", function(d) { return that.x(d.pc1); })
        .attr("cy", function(d) { return that.y(d.pc2); })
        .style("fill", function(d) { return that.color(d.label); });

    this.legend = this.svg.selectAll(".legend")
        .data(this.color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    this.legend.append("rect")
        .attr("x", this.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", this.color);

    this.legend.append("text")
        .attr("x", this.width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}

ScatterVis.prototype.wrangleData= function(_options){
    var that = this;

    //   if (_options.type) {
    //     this.initPackage(this.options);
    //   }
    //   this.changeYear(this.options.year);

    var matrix = [];
    this.data.map(function(d){
        var row = d3.values(d);
        row = row.slice(0,row.length-6); // get rid of string values
        matrix.push(row);
    });

    var pca = new PCA();
    matrix = pca.scale(matrix,true,true);  // normalize
    this.pc = pca.pca(matrix,2);

    this.data.map(function(d,i){
        d.pc1 = that.pc[i][0];
        d.pc2 = that.pc[i][1];
    });
}