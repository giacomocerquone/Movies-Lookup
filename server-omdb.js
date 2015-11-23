var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
path        = "",
Trakt       = require('trakt-api'),
trakt       = Trakt("");


app.get('/', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/scan', function(req, res) {
    path = req.param.path;

    fs.readdir(__dirname+"/movies/", function(err, files) {
        files.forEach(function(file) {
            name = file.split(".");
            name.pop();

            console.log(name.join());
            
            trakt.searchMovie(name.join(), function(err, item) {
                if(err) return console.warn('oh noes', err);
                omdb.get(item[0].movie.ids.imdb, {tomatoes: true}, function(err, movie) {
                    if(err) return console.error(err);
                    if(!movie) return console.log('Movie not found!');

                    tomato = (typeof movie.tomato === 'undefined' ? 'null' : movie.tomato.rating);
                    console.log('Title: '+movie.title);
                    console.log('IMDB rating: '+movie.imdb.rating);
                    console.log('Tomatoes rating: '+tomato);
                    console.log('');
                });
            });
        });
    });

});



var server = app.listen(8080, function() {
    console.log("Listening on 8080");
});