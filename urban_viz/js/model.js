/**
 * Created by lezhi on 4/10/2016.
 */
Model = function() {
    var _status = {
        city:null,
        category:null
    };
    var _data = [];
    var cities = [  {name:"Boston", id:"boston"},
        {name:"Chicago", id:"chicago"},
        {name:"New York", id:"newyork"},
        {name:"San Francisco", id:"sanfrancisco"} ];

    this.eventHandler = {};

    this.reloadData = function(city, attr) {
        if(city !== _status.city || attr !== _status.category){
            _data = [];
            for(var i = 0; i<city.length; i++){ //..........................probably bad code!
                d3.csv("data/"+attr+"_"+city[i].id+".csv", function (d) {
                    _data.push({id: city[i].id, data: d});
                });
            }
        }
        $(this.eventHandler).trigger("dataChanged"); //......................notify the view
    };

    this.get = function() {
        return _data;
    };
    return this;
};