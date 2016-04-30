// this function is called after the HTML document is fully loaded 
/**
 * Created by lezhi on 3/17/2016.
 */

var imgroot = '/Dropbox/thesis/img/';

$(function(){


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

    var carousel = $('.jcarousel').jcarousel({
        transitions: true,
        wrap: "circular",
        center: true//,
        //animation: {duration: 800}
    });

    $('.jcarousel-control-prev')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=1'
        });
    $('.jcarousel-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        }).jcarouselControl({
            target: '+=1'
        });

    setInterval(function(){
        carousel.jcarousel('scroll', '+=1');
    }, 20000);

    //var data = [];

    var dataLoaded = function (_ptData, _pgData, _nodeData, _linkData, _imData) {

        // pre-processing
        // assigning centers to geojson objects
        var dataCenters = [centers.boston, centers.chicago, centers.newyork, centers.sanfrancisco];
        dataCenters = dataCenters.map( function(d) {
            return [d[1], d[0]];
        });
        _ptData.forEach( function(d, i) {
            d.center = dataCenters[i];
        });
        _pgData.forEach( function(d, i) {
            d.center = dataCenters[i];
            d.metaData = _imData[i];
        });
        //_imData.forEach( function(d, i) {
        //    d.center = dataCenters[i];
        //});

        var districtNodes = _nodeData;
        var districtNodesMap = d3.map(districtNodes, function(d) { return d.name; });
        _linkData.forEach( function(d) {
            d.source = districtNodesMap.get(d.source);
            d.target = districtNodesMap.get(d.target);
        });
        var hidimData = _ptData
            .reduce(function(a, b){ return a.concat(b); }, [])
            .filter(function() { return Math.random() < 0.04; });
        //console.log(hidimData);

        var polygonMap = d3.custom.mapVis().shapeType("polygon");
        //var pointMap = d3.custom.mapVis().shapeType("hexbin");//("point");
        var pointMap = d3.custom.mapVis().shapeType("point");
        var myForceVis = d3.custom.forceVis().numClusters(3);
        var myParallelVis = d3.custom.parallelVis();
        var myDemersVis = d3.custom.demersVis();


        d3.selectAll(".map-point")
            .data(_ptData)
            .call(pointMap);

        d3.selectAll(".map-polygon")
            .data(_pgData)
            .call(polygonMap);

        d3.select("#nodeVis")
            .datum({nodes: districtNodes, links:_linkData.filter(function(d){ return d.value > 0.01; }) })
            .call(myForceVis);

        d3.select("#parallelVis")
            .datum(hidimData)
            .call(myParallelVis);

        d3.select("#appearanceVis")
            .datum(_pgData[0])
            .call(myDemersVis);

        myParallelVis.on("brushed", function() {
            pointMap.highlightSelection(arguments);
        });
        pointMap.on("locClicked", function(d) {
            // 1. select image for display
            for(var i= 0; i<4; i++) {
                var imsrc = imgroot+ d.city+"/"+ d.lat+","+ d.lng+"_"+i+".png";
                carousel.find('li:eq('+i+')')
                    .html("<img src='"+imsrc+"'/>");
            }
            // 2. select point on its own to highlight
            d3.select("#mapsdot").select(".selected").classed("selected", false);
            d3.select("#mapsdot").select("."+ d.city+"_"+ d.id).classed("selected", true);

            // 3. select line in parallelvis to highlight
            d3.select("#parallelVis").select(".selected").classed("selected", false);
            d3.select("#parallelVis").select("."+ d.city+"_"+ d.id).classed("selected", true);
            //console.log(d3.select(".map-point").select(city+"_"+id));
        });
        myForceVis.on("nodeHovered", function() {
            polygonMap.highlightSelection(arguments);
        })
    };

    var startHere = function(){

        queue()
            .defer(d3.csv, "data/boston.csv")
            .defer(d3.csv, "data/chicago.csv")
            .defer(d3.csv, "data/newyork.csv")
            .defer(d3.csv, "data/sanfrancisco.csv")
            .defer(d3.json, "data/boundary_boston.geojson")
            .defer(d3.json, "data/boundary_chicago.geojson")
            .defer(d3.json, "data/boundary_newyork.geojson")
            .defer(d3.json, "data/boundary_sanfrancisco.geojson")
            .defer(d3.csv, "data/deep_cluster_boston.csv")
            .defer(d3.csv, "data/link_boston.csv")
            .defer(d3.csv, "data/best_img_boston.csv")
            .defer(d3.csv, "data/best_img_chicago.csv")
            .defer(d3.csv, "data/best_img_newyork.csv")
            .defer(d3.csv, "data/best_img_sanfrancisco.csv")
            .await(function(error, b_pt, c_pt, n_pt, s_pt, b_pg, c_pg, n_pg, s_pg, node, link, b_im, c_im, n_im, s_im) {
                if (error) {
                    console.log(error);
                } else {
                    //boston.forEach( function(d) {
                    //    for(var i= 0; i<24; i++){
                    //        d[i] = +d[i];
                    //    }
                    //});
                    return dataLoaded([b_pt, c_pt, n_pt, s_pt], [b_pg, c_pg, n_pg, s_pg],node, link, [b_im, c_im, n_im, s_im]);
                }
            });
    }
    startHere();
})