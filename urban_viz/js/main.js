// this function is called after the HTML document is fully loaded 
/**
 * Created by lezhi on 3/17/2016.
 */

var imgroot = '/Dropbox/thesis/img/',
    imgroot_dense = '/Dropbox/thesis/img_dense/';
var cities = ['boston', 'chicago', 'newyork', 'sanfrancisco'];
var citynummap = {boston: 0, chicago: 1, newyork: 2, sanfrancisco: 3};
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

$(function(){




    var carousel_1 = $('#carousel1.jcarousel').jcarousel({
        transitions: true,
        wrap: "circular"
        //animation: {duration: 800}
    });
    var carousel_2 = $('#carousel2.jcarousel').jcarousel({
        transitions: true,
        wrap: "circular"
    });

    $('.jcarousel-control-prev')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=4'
        });
    $('.jcarousel-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        }).jcarouselControl({
            target: '+=4'
        });

    setInterval(function(){
        carousel_1.jcarousel('scroll', '+=4');
    }, 20000);


    var dataLoaded = function (_ptData, _pgData, _nodeData, _linkData, _imData, _childrenData, _ptAllData, _ancestorsData) {

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
            d.city = cities[i];
            d.metaData = _imData[i];
        });
        //_imData.forEach( function(d, i) {
        //    d.center = dataCenters[i];
        //});
        _childrenData.forEach( function(d) {
            d[0] = +d[0]; d[1] = +d[1];
        });
        _ptAllData.forEach( function(d, i) {
            d.ancestors = _ancestorsData[i];
        });

        var _ptAll = cities.map( function(d) {
            return _ptAllData.filter( function(e) {
                return e.label.split('_')[0] == d;
            })
        });
        _ptAll.forEach( function(d, i) {
            d.center = dataCenters[i];
        });

        var districtNodes = _nodeData;
        var districtNodesMap = d3.map(districtNodes, function(d) { return d.name; });
        //console.log(districtNodesMap);
        _linkData.forEach( function(d) {
            d.source = districtNodesMap.get(d.source);
            d.target = districtNodesMap.get(d.target);
        });
        var hidimData = _ptData
            .reduce(function(a, b){ return a.concat(b); }, [])
            .filter(function() { return Math.random() < 0.04; });
        //console.log(hidimData);


        //var pointMap = d3.custom.mapVis().shapeType("hexbin");//("point");
        var pointMap = d3.custom.mapVis().shapeType("point");
        var myParallelVis = d3.custom.parallelVis();
        var myLeafletVis = d3.custom.leafletVis().category("color");
        //var myLeafletVis = new MapVis(d3.select("#mapVis"), _ptData[0]);
        var myForceVis = d3.custom.forceVis();
        var polygonMap = d3.custom.mapVis().shapeType("polygon");
        var myDemersVis = d3.custom.demersVis();
        var myTreeVis = d3.custom.treeVis();
        var clusterMap = d3.custom.mapVis().shapeType("hexbin").tip('label');
        var myPackVis = d3.custom.packVis();


        d3.selectAll(".map-point")
            .data(_ptData)
            .call(pointMap);

        d3.select("#parallelVis")
            .datum(hidimData)
            .call(myParallelVis);

        d3.select("#mapVis")
            .datum(_ptData[0])
            .call(myLeafletVis);

        d3.select("#nodeVis")
            .datum({
                nodes: districtNodes,
                links: _linkData.filter(function (d) { return d.value > 0.01; })
            })
            .call(myForceVis);

        $("button#force").on("click", function() {
            myForceVis.toFoci();
        });

        d3.selectAll(".map-polygon")
            .data(_pgData)
            .call(polygonMap);


        d3.select("#appearanceVis")
            .call(myDemersVis);

        $("#sel_appearance").on("change", function() {
            if($(this).val() !== "") {
                d3.select("#appearanceVis")
                    .datum(_pgData[citynummap[$(this).val()]]);
                myDemersVis.update();
            }
        });

        d3.select("#hierarchyVis")
            .datum(_childrenData)
            .call(myTreeVis);

        d3.selectAll(".map-cluster")
            .data(_ptAll)
            .call(clusterMap);

        //$("button#pack").on("click", function() {
        //});
        d3.select("#hierarchyVis2")
            .datum(_childrenData)
            .call(myPackVis);

        myParallelVis.on("brushed", function() {
            pointMap.highlightSelection(arguments);
        });
        pointMap.on("locClicked", function(d) {
            // 1. select image for display
            for(var i= 0; i<4; i++) {
                var imsrc = imgroot+ d.city+"/"+ d.lat+","+ d.lng+"_"+i+".png";
                carousel_1.find('li:eq('+i+')')
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

        $("#sel_cate").on("change", function() {
            var colormap = {entropy: [d3.hsl(40, .6, 0.9), d3.hsl(-150, .6, 0.1)],
                            sky: [d3.hsl(276, .6, 0.1), d3.hsl(96, .6, 0.9)],
                            tree: [d3.hsl(60, .6, 0.8), d3.hsl(200, .6, 0.1)],
                            color: [null,null]};
            myLeafletVis
                .colorRange(colormap[$(this).val()])
                .category($(this).val())
                .update();
            //console.log();
        });
        $("#sel_city").on("change", function() {

            d3.select("#mapVis")
                .datum(_ptData[citynummap[$(this).val()]]);
            myLeafletVis.update();
        });

        myForceVis.on("nodeHovered", function() {
            polygonMap.highlightSelection(arguments);
        });
        myTreeVis.on("nodeClicked", function(d) {
            clusterMap.highlightCluster(d);
            myPackVis.colorClusters(d);
        });

        myPackVis.on("clusterClicked", function(arr) {
            // console.log(_ptAllData);
            // 1. select image for display
            for(var i= 0; i<arr.length; i++) {
                var d = _ptAllData[arr[i]];
                var imsrc = imgroot_dense+ d.label.split("_")[0]+"/"+ d.lat+","+ d.lng+"_"+ d.dir+".png";
                carousel_2.find('li:eq('+i+')')
                    .html("<img src='"+imsrc+"'/>");
            }
            //// 2. select point on its own to highlight
            //d3.select("#mapsdot").select(".selected").classed("selected", false);
            //d3.select("#mapsdot").select("."+ d.city+"_"+ d.id).classed("selected", true);
            //
            //// 3. select line in parallelvis to highlight
            //d3.select("#parallelVis").select(".selected").classed("selected", false);
            //d3.select("#parallelVis").select("."+ d.city+"_"+ d.id).classed("selected", true);
            ////console.log(d3.select(".map-point").select(city+"_"+id));
        });
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
            .defer(d3.csv, "data/neighborhood_all.csv")
            .defer(d3.csv, "data/link_all.csv")
            .defer(d3.csv, "data/best_img_boston.csv")
            .defer(d3.csv, "data/best_img_chicago.csv")
            .defer(d3.csv, "data/best_img_newyork.csv")
            .defer(d3.csv, "data/best_img_sanfrancisco.csv")
            .defer(d3.csv, "data/children.csv")
            .defer(d3.csv, "data/test_stats_all.csv")
            .defer(d3.json, "data/parents.json")
            .await(function(error, b_pt, c_pt, n_pt, s_pt, b_pg, c_pg, n_pg, s_pg, node, link, b_im, c_im, n_im, s_im, children, all_pt, ancestors) {
                if (error) {
                    console.log(error);
                } else {
                    //boston.forEach( function(d) {
                    //    for(var i= 0; i<24; i++){
                    //        d[i] = +d[i];
                    //    }
                    //});
                    return dataLoaded([b_pt, c_pt, n_pt, s_pt], [b_pg, c_pg, n_pg, s_pg],node, link, [b_im, c_im, n_im, s_im], children, all_pt, ancestors);
                }
            });
    }
    startHere();
})