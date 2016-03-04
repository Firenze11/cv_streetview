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
        queue()
            .defer(d3.csv, "data/boston_color.csv")
            .await(function(error, boston) {
                if (error) { 
                    console.log(error); 
                } else { 
                    console.log("all:", boston.length);
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
