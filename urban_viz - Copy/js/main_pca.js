/**
 * Created by lezhi on 3/17/2016.
 */

$(function(){

    var data = [];

    // preprocessing: reformatting data
    var dataLoaded = function (_data) {
        data = _data;
        var MyEventHandler = new Object();
        var myScatterVis = new ScatterVis(d3.select("#scatterVis"), data, MyEventHandler);

    }

    var startHere = function(){
        console.log(queue);
        queue()
            .defer(d3.csv, "data/boston_hist.csv")
            .await(function(error, boston) {
                if (error) {
                    console.log(error);
                } else {
                    boston.forEach( function(d) {
                        for(var i= 0; i<24; i++){
                            d[i] = +d[i];
                        }
                    });
                    return dataLoaded(boston);
                }
            });
    }
    startHere();
})

