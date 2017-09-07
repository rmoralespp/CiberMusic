var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');

var controller_curso = function (router,repositorio_musica) {

    router.post('/set_song_cursoo', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var song_curso = _.find(obj.songs, function(element){ return element.id == obj.song_curso.id;});
            if (song_curso != undefined && song_curso.id_curso != null){
                if(req.body.tipo == "siguiente" && song_curso.id_curso < obj.ultimo_id_lista_curso){
                    var song_proxima = _.find(obj.lista_curso, function(element){ return element.id_curso == song_curso.id_curso+1});
                    obj.song_curso.id = song_proxima.id;
                }
                else if(req.body.tipo == "anterior" && song_curso.id_curso !=0 && song_curso.id_curso !=1){
                    var song_proxima=_.find(obj.lista_curso, function(element){ return element.id_curso == song_curso.id_curso-1});
                    obj.song_curso.id= song_proxima.id;
                }
                else if(req.body.tipo == "ramdom" ){
                    var pos= Math.floor((Math.random() * obj.lista_curso.length-1) + 1);
                    var song_ramdom=obj.lista_curso[pos];
                    obj.song_curso.id=song_ramdom.id;
                }
                else if(req.body.tipo == "manual" ){
                    obj.song_curso.id=req.body.id;
                }
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
            }
            res.json(null);
        });
    });

    router.post('/get_song_curso', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var id=obj.song_curso.id;

            if(id !=0 && id !=null){
                var song=_.find(obj.songs, function(element){ return element.id == id;});
                        router.io.broadcast('get_song_curso',{"control_audio":req.body.control_audio,"data":song,"data_config":obj.config});
                        res.json(null);
            }
            else {
                res.json(null);
            }

        });
    });

    router.get('/get_lista_curso', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            data=obj.lista_curso;
            if(req.session.user){
                res.json({tipo:"admin", lista_cursoo: data});
            }
            else{
                res.json({tipo:"user", lista_cursoo: data});
            }
        });

    });

    function generar_song_aleatorio() {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            var pos= Math.floor((Math.random() * obj.lista_curso.length-1) + 1);
            var song=obj.lista_curso[pos];
            obj.song_curso.id=song.id;
            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
            return song;
        });
    }

};

module.exports=controller_curso;

