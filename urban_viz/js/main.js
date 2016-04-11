// this function is called after the HTML document is fully loaded 
$(function(){


    // model
    var data = []; //for map view
    var statsData = []; //for stats view
    var currentStatus = {
        city: "all",
        feature: 'color'
    };
    var cities = [  {name:"Boston", id:"boston"},
                    {name:"Chicago", id:"chicago"},
                    {name:"New York", id:"newyork"},
                    {name:"San Francisco", id:"sanfrancisco"} ];

    //view
    var myMaps;
    var myBarVis;

    var MyEventHandler = new Object();



    myMaps = new MapView(new Model(), "mapVis");
    myBarVis = d3.custom.barChart();
    //d3.select("#statsVis")
    //    .datum(statsData)
    //    .call(myBarVis);

    // initially load color data
    var selectedVal = $('#sel_cate option[selected]').val();

    load_and_change_data(selectedVal, 'boston');



    //UI
    $('#sel_layout').on('change', function(){
        var cityChoice = this.value;
        var _cities = cities.filter( function(d) {
            if(cityChoice==="all"){ return true; }
            else { return d.id === cityChoice; }
        });

        var subMapDivs = d3.select("#mapVis").selectAll("div").data(_cities);
        subMapDivs.enter()
            .append("div")
            .style("height", "100%");
        subMapDivs
            .attr("class", function(d) {
                var portion = Math.floor(12/_cities.length);
                return "col-md-"+portion;
            })
            .attr("id", function(d) {
                return "map_"+d.id;
            });
        subMapDivs.exit().remove();

        $(MyEventHandler).trigger("layoutChanged", this.value);
    });

    $('#sel_cate').on('change', function(){
        $(MyEventHandler).trigger("dataChanged", this.value);
        //load_and_change_data(this.value, 'boston');
    });

    // helper functions
    function load_and_change_data(cate, city) {
        queue()
            .defer(d3.csv, "data/"+ cate +"_"+ city +".csv")
            .await(function(error, _data){
                if (error) {
                    console.log(error);
                } else {

                    if (!myMapVis) {

                    }

                    if(cate === 'color') {
                        data = _data.filter( function(d) { return d.M; } );
                    } else if (cate === '') {
                        //........................................complete other preprocessing
                    } else {
                        data = _data;
                    }
                    //myMapVis.onDataChange(data, {category: cate, cityname: city});
                }
            });
    }
});

// static helper functions
function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}