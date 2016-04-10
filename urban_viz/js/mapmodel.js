/**
 * Created by lezhi on 4/10/2016.
 */
MapModel = function(data) {
    var _that = this;
    var _data = data;
    var _displayData;

    this.eventHandler =  new Object(); // dummy object to bind event-handling functions on

    this.loadData = function(category) {

        $.getJSON("data/boundary_boston.json", function (data) {
            _data = data;
        });
        $(this.eventHandler).trigger("itemChanged");
    };

    this.getData = function () {
        _displayData = [].concat(_data);
        return _displayData;
    };

    this.filteredData = function(filterFunc) {
        _displayData = _data.filter(filterFunc);
        $(this.eventHandler).trigger("itemChanged");
    };

    this.setSelectedIndex = function (index) {
        var previousIndex;

        previousIndex = this._selectedIndex;
        this._selectedIndex = index;
        this.selectedIndexChanged.notify({ previous : previousIndex });
    };

    return this;
};