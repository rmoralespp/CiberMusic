var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');


var controller_songs = function (router,repositorio_musica) {



    router.post('/add_songs_externas', function(req, res) {
       var canciones_externas=req.body.canciones_externas;
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var id_curso=obj.ultimo_id_lista_curso;
            for(var i=0;i<canciones_externas.length;i++){
                        id_curso=id_curso+1;
                        canciones_externas[i].id_curso=id_curso;
                        obj.lista_curso.push(canciones_externas[i]);

                }
                //Compruebo que se hayan adicionado canciones a la lista antes de actulizar el ultimo_id_lista_curso
            if( obj.ultimo_id_lista_curso!=id_curso){
                    obj.ultimo_id_lista_curso=id_curso;
                }

            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            res.json(null);
            router.io.broadcast('add_album',obj.lista_curso);

        });

    });

    router.post('/updateprogresss', function(req, res) {
        res.json(null);
        router.io.broadcast('updateprogresss',{'progress':req.body.progress,"current_time":req.body.current_time});

    });

    router.post('/updatevolumen', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            obj.config.vol=req.body.vol;
            if(obj.config.vol > 0){
                obj.config.muted=false;
            }
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            res.json(null);
            router.io.broadcast('updatevolumen',{'progress':req.body.progress,"vol":req.body.vol});

        });


    });

    router.get('/play', function(req, res) {
        res.json(null);
        router.io.broadcast('play',null);
    });

    router.get('/pause', function(req, res) {
        res.json(null);
        router.io.broadcast('pause',null);

    });

    router.post('/set_loop', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            obj.config.loop = req.body.loop;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            res.json(null);
            router.io.broadcast('set_loop', obj.config.loop);

        });
    });

    router.post('/set_muted', function(req, res) {

        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            obj.config.muted = req.body.muted;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            res.json(null);
            router.io.broadcast('set_muted', obj.config.muted);

        });
    });

    router.post('/set_song', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            obj.song_curso.id=req.body.id;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            res.json(null);
        });
    });

    router.post('/add_song', function(req, res) {
        var id_song=req.body.id;
        fs.readFile(repositorio_musica, function read(err, data) {
                obj = JSON.parse(data);
                var song=_.find(obj.songs, function(element){ return element.id == id_song;});
                if(song.id_curso == null){
                    song.id_curso=obj.ultimo_id_lista_curso+1;
                    obj.ultimo_id_lista_curso+=1;
                    obj.lista_curso.push(song);
                    var json = JSON.stringify(obj);
                    fs.writeFile(repositorio_musica, json);
                    router.io.broadcast('add_album',obj.lista_curso);
                }

            });

    });

    router.post('/canciones', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            data=obj.songs;
            if(req.session.user){
                res.json({tipo:"admin", canciones: data});
            }
            else{
                res.json({tipo:"user", canciones: data});
            }
        });
    });

    router.post('/reproducir_canciones', function(req, res) {
        var canciones=req.body.canciones_id;
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
                 for(var i=0;i<canciones.length;i++){
                     id_curso+=1;
                     var song=_.find(obj.songs, function(element){ return element.id == canciones[i];});
                     song.id_curso=id_curso;
                     obj.lista_curso.push(song);
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


    router.post('/sort_canciones', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            if(req.body.tipo == "album"){
                data=_.sortBy(obj.songs, 'album');
            }
            else if(req.body.tipo == "artist"){
                data=_.sortBy(obj.songs, 'artist');
            }

            else if(req.body.tipo == "title"){
                data=_.sortBy(obj.songs, 'title');
            }

            else {
                data= obj.songs;
            }

            if(req.session.user){
                res.json({tipo:"admin", canciones: data});
            }
            else{
                res.json({tipo:"user", canciones: data});
            }
        });
    });







};

module.exports=controller_songs;