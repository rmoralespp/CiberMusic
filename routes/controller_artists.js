var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');
var controller_artists = function (router,repositorio_musica) {

    router.post('/artistas', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            data=_.uniq(obj.songs,false, function(element){ return element.artist.toString(); });
            if(req.session.user){
                res.json({tipo:"admin", artistas: data});
            }
            else{
                res.json({tipo:"user", artistas: data});
            }
        });
    });




    router.post('/artistas/artist', function(req, res) {
        var artist=req.body.artist;
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            data=_.filter(obj.songs, function(element){return element.artist.toString()==artist.toString()});
            var result=_.sortBy(data, 'album');
            if(req.session.user){
                res.json({tipo:"admin", artist: result});
            }
            else{
                res.json({tipo:"user", artist: result});
            }
        });
    });



    router.post('/reproducir_artista', function(req, res) {
        var artist=req.body.artist;
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
                var songs=_.filter(obj.songs, function(element){ return element.artist.toString() == artist.toString()});
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


    router.post('/add_artist', function(req, res) {
        var artist=req.body.artist.toString();
        fs.readFile(repositorio_musica, function read(err, data) {
                obj = JSON.parse(data);
                var id_curso=obj.ultimo_id_lista_curso;
                var songs=_.filter(obj.songs, function(element){ return element.artist.toString() == artist});
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

    router.post('/reproducir_artistas', function(req, res) {
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


    router.post('/sort_artistas', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);

            if(req.body.tipo == "title"){
                data=_.sortBy(_.uniq(obj.songs,false, function(element){ return element.artist.toString()}),'artist');
            }

            else {
                data= _.uniq(obj.songs,false, function(element){ return element.artist.toString() });
            }

            if(req.session.user){
                res.json({tipo:"admin", artistas: data});
            }
            else{
                res.json({tipo:"user", artistas: data});
            }
        });
    });


};

module.exports=controller_artists;


