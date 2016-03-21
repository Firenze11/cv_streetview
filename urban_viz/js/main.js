// this function is called after the HTML document is fully loaded 
$(function(){ 
    //==========================================
    //--- HERE IS WHERE ALL THE MAGIC STARTS --
    //==========================================
    // variables keeping global knowledge of the data
    var data = [];
    
    // preprocessing: reformatting data
    var dataLoaded = function (_data) {
        data = _data;
        var MyEventHandler = new Object();
        var myMapVis = new MapVis(d3.select("#mapVis"), data, MyEventHandler);

    }

    var startHere = function(){
        console.log(queue);
        queue()
            .defer(d3.csv, "data/coordinates_for_request.csv")
            .await(function(error, boston) {
                if (error) {
                    console.log(error); 
                } else {
                    console.log(boston);
                    //boston.forEach( function(d) {
                    //    d.lat = +d.lat;
                    //    d.lng = +d.lng;
                    //    d.dir = +d.dir;
                    //})
                    return dataLoaded(boston); 
                }
            });
    }
    startHere();
})
    
/* ==================================
 * From here on only HELPER functions
 * ==================================*/
function sstr(str) { //clean string
  return str.replace(/\s+/g, '').replace("&", "").replace(",","");
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
