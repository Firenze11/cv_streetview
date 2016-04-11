// this function is called after the HTML document is fully loaded 
$(function(){
    centers = {
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

    // variables keeping global knowledge of the data
    var data = [];
    var myMapVis;
    

    var MyEventHandler = new Object();
    myMapVis= new MapVis(d3.select("#mapVis"), MyEventHandler);

    // initially load color data
    var selectedVal = $('#sel_cate option[selected]').val();

    load_and_change_data(selectedVal, 'boston');



    //UI
    $('#sel_cate').on('change', function(){
        load_and_change_data(this.value, 'boston');
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
                    myMapVis.onDataChange(data, {category: cate, cityname: city});
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