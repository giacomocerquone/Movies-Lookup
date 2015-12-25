var express = require('express'),
app         = express(),
fs          = require('fs'),
omdb        = require('omdb'),
Trakt       = require('trakt-api'),
trakt       = Trakt("1b760a511b5e173f51878ec13ff3ebbc80267502d7d1a541618bde514e81da21");

var getData = function(path, cb) {
    var cbCounter1 = 0,
        ratings = [];

    fs.readdir(path, function(err, files) {
        // Delete from the array every file that isn't a movie and trim the extension of the movies' filenames
        if(typeof files === 'undefined') {
          console.log("You choose an empty directory or a non existing one.");
        } else {
          for(var i = files.length-1;i >= 0;i--) {
              name = files[i].split(".");
              ext = name.pop();
              if(ext != "mkv" && ext != "avi" && ext != "mp4" && ext != "mkv") {
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
                              tomato = (typeof movie.tomato === 'undefined' ? 'Not Available' : movie.tomato.rating);
                              ratings.push({"title": movie.title, "imdbI": item[0].movie.ids.imdb, "imdbR": movie.imdb.rating, "tomatoR": tomato, "trailer": "https://www.youtube.com/results?search_query="+movie.title+" trailer"});
                          }
                          cbCounter1++;
                          if(cbCounter1 == files.length) {
                              cb(ratings);
                          }
                      });
                  }
              });
          });
        }
    });
};

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/scan', function(req, res) {
    getData(req.query.path, function(ratings) {
        var html = "",
            cbCounter2 = 0;

        ratings.forEach(function(file, index) {
            red = {"imdb": "", "tomato": ""};
            red.imdb = (parseFloat(file.imdbR) <= 7.0) ? "style='color:red;'" : "";
            red.tomato = (parseFloat(file.tomatoR) <= 7.0) ? "style='color:red;'" : "";

            html += "<tr><td>"+file.title+"</td><td><a target='_blank' "+red.imdb+" href='http://imdb.com/title/"+file.imdbI+"'>"+file.imdbR+"</a></td><td "+red.tomato+">"+file.tomatoR+"</td><td><a target='_blank' href='"+file.trailer+"'>Trailer</a></td></tr>";
            cbCounter2++;
            if(cbCounter2 == ratings.length) {
                res.send(html);
            }
        });
    });
});

var server = app.listen(8080, function() {
    console.log("Listening on 8080");
});
