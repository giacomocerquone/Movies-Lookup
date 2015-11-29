var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
path        = (typeof process.argv[2] !== 'undefined' ? process.argv[2] : ""),
Trakt       = require('trakt-api'),
trakt       = Trakt("1b760a511b5e173f51878ec13ff3ebbc80267502d7d1a541618bde514e81da21"),
cbCounter   = 0,
ratings     = [];

var getRatings = function(path, cb) {
    fs.readdir(path, function(err, files) {
        console.log(err);
        // Delete from the array every file that isn't a movie and trim the extension of the movies' filenames
        for(var i = files.length-1;i >= 0;i--) {
            name = files[i].split(".");
            ext = name.pop();
            if(ext != "mkv")
                files.splice(i, 1);
            else
                files[i] = name.join();
        }

        files.forEach(function(file) {
            trakt.searchMovie(file, function(err, item) {
                if(err) return console.warn('Errors with trakt.', err);
                omdb.get(item[0].movie.ids.imdb, {tomatoes: true}, function(err, movie) {
                    if(err) return console.error(err);
                    if(!movie) return console.log('Movie not found!');

                    tomato = (typeof movie.tomato === 'undefined' ? 'null' : movie.tomato.rating);
                    ratings.push({"title": movie.title, "imdb": movie.imdb.rating, "tomato": tomato});

                    //Increment to check at what point the callback is
                    cbCounter++;
                    if(cbCounter == files.length) {
                        cb(ratings);
                    }
                });
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
            ratings.forEach(function(file) {
                html += "<p>Title: "+file.title+"</p><p>IMDB Rating: "+file.imdb+"</p><p>Tomatoes rating: "+file.tomato+"</p><hr>";
            });
            res.send(html);
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
