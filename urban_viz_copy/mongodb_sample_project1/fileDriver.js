/**
 * Created by lezhi on 3/23/2016.
 */
var ObjectID = require('mongodb').ObjectID,
    fs = require('fs'); //1

FileDriver = function(db) { //2
    this.db = db;
};

FileDriver.prototype.getCollection = function(callback) {
    this.db.collection('files', function(error, file_collection) { //1
        if( error ) callback(error);
        else callback(null, file_collection);
    });
};

//find a specific file
FileDriver.prototype.get = function(id, callback) {
    this.getCollection(function(error, file_collection) { //1
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //2
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else file_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //3
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

FileDriver.prototype.handleGet = function(req, res) { //1
    var fileId = req.params.id;
    if (fileId) {
        this.get(fileId, function(error, thisFile) { //2
            if (error) { res.send(400, error); }
            else {
                if (thisFile) {
                    var filename = fileId + thisFile.ext; //3
                    var filePath = './uploads/'+ filename; //4
                    res.sendfile(filePath); //5
                } else res.send(404, 'file not found');
            }
        });
    } else {
        res.send(404, 'file not found');
    }
};