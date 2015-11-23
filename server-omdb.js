var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
path        = (if typeof process.argv[2] !== undefined ? process.argv[2] : ""),
html        = "",
Trakt       = require('trakt-api'),
trakt       = Trakt("");

if(path == "") {
    app.get('/', function (req, res) {
        res.sendFile(__dirname+'/index.html');
    });
    
    app.get('/scan', function(req, res) {
        path = req.query.path;
    
        console.log(path);
    
        fs.readdir(path, function(err, files) {
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
                        html += "<p>Title: "+movie.title+"</p><p>IMDB Rating: "+movie.imdb.rating+"</p><p>Tomatoes rating: "+tomato+"</p><hr>";
                        console.log('Title: '+movie.title);
                        console.log('IMDB rating: '+movie.imdb.rating);
                        console.log('Tomatoes rating: '+tomato);
                        console.log('');
                    });
                });
            });
            res.send(html);
            html = "";
        });
    
    
    });
    
    
    
    var server = app.listen(8080, function() {
        console.log("Listening on 8080");
    });
    
} else {
    logic here
}
