var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
path        = (typeof process.argv[2] !== 'undefined' ? process.argv[2] : ""),
Trakt       = require('trakt-api'),
trakt       = Trakt("1b760a511b5e173f51878ec13ff3ebbc80267502d7d1a541618bde514e81da21"),
cbCounter  = 0;


if(path == "") {

    app.get('/', function (req, res) {
        res.sendFile(__dirname+'/index.html');
    });
    
    app.get('/scan', function(req, res) {
        path = req.query.path;
            
            
        fs.readdir(path, function(err, files) {
            var html = "";
            files.forEach(function(file) {
                name = file.split(".");
                name.pop();
                
                trakt.searchMovie(name.join(), function(err, item) {
                    if(err) return console.warn('oh noes', err);
                    omdb.get(item[0].movie.ids.imdb, {tomatoes: true}, function(err, movie) {
                        if(err) return console.error(err);
                        if(!movie) return console.log('Movie not found!');
    
                        tomato = (typeof movie.tomato === 'undefined' ? 'null' : movie.tomato.rating);
                        html += "<p>Title: "+movie.title+"</p><p>IMDB Rating: "+movie.imdb.rating+"</p><p>Tomatoes rating: "+tomato+"</p><hr>";
                        //Increment to check at what point the callback is
                        cbCounter++;
                        if(cbCounter == files.length) {
                            console.log(html);
                            res.send(html);
                        }
                    });
                });
            });
        });
        
    });
    
    var server = app.listen(8080, function() {
        console.log("Listening on 8080");
    });
    
} else {


    /*console.log('Title: '+movie.title);
    console.log('IMDB rating: '+movie.imdb.rating);
    console.log('Tomatoes rating: '+tomato);
    console.log('');
*/

console.log("wrong");

}
