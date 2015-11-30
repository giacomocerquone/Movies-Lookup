var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
path        = (typeof process.argv[2] !== 'undefined' ? process.argv[2] : ""),
Trakt       = require('trakt-api'),
trakt       = Trakt("1b760a511b5e173f51878ec13ff3ebbc80267502d7d1a541618bde514e81da21"),
ratings     = [];

var getRatings = function(path, cb) {
    fs.readdir(path, function(err, files) {
        // Delete from the array every file that isn't a movie and trim the extension of the movies' filenames
        for(var i = files.length-1;i >= 0;i--) {
            name = files[i].split(".");
            ext = name.pop();
            if(ext != "mkv") {
                files.splice(i, 1);
            } else {
                files[i] = name.join();
            }
        }

        files.forEach(function(file, index) {
            trakt.searchMovie(file, function(err, item) {
                if(err) console.warn('Errors with trakt.', err);
                else if(item.length == 0) console.log(file+' not found on Trakt'); 
                else {
                    omdb.get(item[0].movie.ids.imdb, {tomatoes: true}, function(err, movie) {
                        if(err) console.warn('Errors with imdb.', err);
                        else if(!movie) console.log(file+' not found on IMDB');
                        else {
                            tomato = (typeof movie.tomato === 'undefined' ? 'null' : movie.tomato.rating);
                            ratings.push({"title": movie.title, "imdb": movie.imdb.rating, "tomato": tomato});
                            
                        }
                        if(index == files.length-1) {
                            cb(ratings);
                            ratings = [];
                        } 
                    });
                }
            });
        });
    });
};

if(path == "") {

    app.get('/', function (req, res) {
        res.sendFile(__dirname+'/index.html');
    });
    
    app.get('/scan', function(req, res) {
        getRatings(req.query.path, function(ratings) {
            var html = "";
            ratings.forEach(function(file, index) {
                if(parseFloat(file.imdb) <= 7.0 || parseFloat(file.tomato) <= 7.0) 
                    red = "style='color:red;'";
                else
                    red = ""; 

                html += "<p>Title: "+file.title+"</p><p "+red+">IMDB Rating: "+file.imdb+"</p><p "+red+">Tomatoes rating: "+file.tomato+"</p><hr>";
                if(index == ratings.length-1) res.send(html);
            });
        });
    });
    
    var server = app.listen(8080, function() {
        console.log("Listening on 8080");
    });
    
} else {

    getRatings(path, function(ratings){ 
        console.log(ratings);
    });
    console.log("choose the console version");
}
