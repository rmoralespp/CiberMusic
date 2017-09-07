var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');
var window = require('node-window');


var controller_albumes = function (router,repositorio_musica) {

    router.post('/albumes', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var songs=_.uniq(obj.songs,false, function(element){ return element.album.toString(); });
            if(req.session.user){
                res.json({tipo:"admin", albumes: songs});
            }
            else{
                res.json({tipo:"user", albumes: songs});
            }
        });
    });

    router.post('/albumes/album', function(req, res) {
        var album=req.body.album;
        var artist=req.body.artist;
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            if(album.toString() != "Desconocido"){
                data=_.filter(obj.songs, function(element){return element.album.toString() == album.toString() && element.artist.toString() == artist.toString() });
            }
            else {
                data=_.filter(obj.songs, function(element){return element.album.toString() == album.toString()});

            }
            if(req.session.user){
                res.json({tipo:"admin", album: data});
            }
            else{
                res.json({tipo:"user", album: data});
            }
        });
    });

    router.post('/add_album', function(req, res) {
        var album=req.body.album.toString();
            fs.readFile(repositorio_musica, function read(err, data) {
                obj = JSON.parse(data);
                var id_curso=obj.ultimo_id_lista_curso;
                var songs=_.filter(obj.songs, function(element){ return element.album.toString() == album});
                for(var i=0;i<songs.length;i++){
                    //Compruebo que no esten en la lista de reproduccion
                    if(songs[i].id_curso == null) {
                        id_curso=id_curso+1;
                        songs[i].id_curso=id_curso;
                        obj.lista_curso.push(songs[i]);
                    }
                }
                //Compruebo que se hayan adicionado canciones a la lista antes de actulizar el ultimo_id_lista_curso
                if( obj.ultimo_id_lista_curso!=id_curso){
                    obj.ultimo_id_lista_curso=id_curso;
                    // router.io.broadcast('add_album',obj.lista_curso);
                }

                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                router.io.broadcast('add_album',obj.lista_curso);

            });

    });

    router.post('/eliminar_album', function(req, res) {
        var album=req.body.album.toString();

        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var songs=_.filter(obj.songs, function(element){ return element.album.toString() == album});
            var songs_results=obj.songs;
            var lista_curso_results=obj.lista_curso;
            if(songs != undefined){
                for(var i=0;i<songs.length;i++){
                    if( songs[i].id != obj.song_curso.id){
                        songs_results=_.without(songs_results, _.findWhere(songs_results, {
                            id: songs[i].id
                        }));
                        lista_curso_results=_.without(lista_curso_results, _.findWhere(lista_curso_results, {
                            id: songs[i].id
                        }));

                    }
                }
                curso=0;
                for(var i=0;i<lista_curso_results.length;i++){
                    curso=i+1;
                    lista_curso_results[i].id_curso=curso;
                    song=_.find(obj.songs, function(element){ return element.id == lista_curso_results[i].id});
                    song.id_curso=curso;

                }
                obj.ultimo_id_lista_curso=curso;
                obj.songs=songs_results;
                obj.lista_curso=lista_curso_results;
            }

            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);




        });

    });

    router.post('/reproducir_album', function(req, res) {
        var album=req.body.album;
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            for(var i=0;i< obj.lista_curso.length;i++){
                var song=_.find(obj.songs, function(element){ return element.id == obj.lista_curso[i].id;});
                song.id_curso=null;
            }
            obj.lista_curso=[];
            obj.ultimo_id_lista_curso=0;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);

            fs.readFile(repositorio_musica, function read(err, data) {
                var songs=_.filter(obj.songs, function(element){ return element.album.toString() == album.toString()});
                var id_curso=obj.ultimo_id_lista_curso;
                for(var i=0;i<songs.length;i++){
                    id_curso+=1;
                    songs[i].id_curso=id_curso;
                    obj.lista_curso.push(songs[i]);

                }
                obj.ultimo_id_lista_curso=id_curso;
                obj.song_curso.id=obj.lista_curso[0].id;
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                data=obj.lista_curso[0];
                res.json(data);
                router.io.broadcast('reproducir_album',obj.lista_curso);
            });

        });
    });



    router.post('/reproducir_albumes', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            for(var i=0;i< obj.lista_curso.length;i++){
                var song=_.find(obj.songs, function(element){ return element.id == obj.lista_curso[i].id;});
                song.id_curso=null;
            }

            obj.lista_curso=[];
            obj.ultimo_id_lista_curso=0;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);

            fs.readFile(repositorio_musica, function read(err, data) {
                var id_curso=obj.ultimo_id_lista_curso;
                for(var i=0;i<obj.songs.length;i++){
                    id_curso+=1;
                    obj.songs[i].id_curso=id_curso;
                    obj.lista_curso.push(obj.songs[i]);
                }

                obj.ultimo_id_lista_curso=id_curso;
                obj.song_curso.id=obj.lista_curso[0].id;
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                data=obj.lista_curso[0];
                res.json(data);
                router.io.broadcast('reproducir_canciones',obj.lista_curso);
            });
        });


    });


    router.post('/sort_albumes', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);

            if(req.body.tipo == "title"){
                data=_.sortBy(_.uniq(obj.songs,false, function(element){ return element.album.toString(); }), 'album');
            }

            else {
                data= _.uniq(obj.songs,false, function(element){ return element.album.toString(); });
            }

            if(req.session.user){
                res.json({tipo:"admin", albumes: data});
            }
            else{
                res.json({tipo:"user", albumes: data});
            }
        });
    });





};

module.exports = controller_albumes;
