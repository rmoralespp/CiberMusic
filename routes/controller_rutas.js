var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');
var window = require('node-window');


var controller_rutas = function (router,repositorio_musica) {



    router.get('/rutas', function(req, res) {
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            data= obj.rutas;
            res.json({'rutas':data});

        });
    });


    router.io.route('cargar_ruta', function(req, res) {
        var ruta=req.data.ruta.toString();
        fs.readFile(repositorio_musica,function read(err, data){
            obj = JSON.parse(data);
            if(_.contains(obj.rutas,ruta) == false) {
                obj.rutas.push(ruta);
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                var files=findFilesInDir(ruta,'.mp3');
                for(var i=0;i<files.length;i++){
                    if (!fs.existsSync(files[i])){return}
                       add_song3(files[i],obj,repositorio_musica,req)
                     }

            }});


    });

    router.post('/cargar_ruta22', function(req, res) {
        var ruta=req.body.ruta.toString();
        fs.readFile(repositorio_musica,function read(err, data){
            obj = JSON.parse(data);
            if(_.contains(obj.rutas,ruta) == false) {
                obj.rutas.push(ruta);
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                find_files(ruta,repositorio_musica,obj,req);
            }});


    });


    router.post('/eliminar_ruta', function(req, res) {
        var ruta=req.body.ruta.toString();
        fs.readFile(repositorio_musica,function read(err, data){
            obj = JSON.parse(data);
            obj.rutas=_.without(obj.rutas, ruta);
            var songs=_.filter(obj.songs, function(element){ return element.ruta.toString().indexOf(ruta.toString()) != -1 });
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
            res.json({"rutas":obj.rutas})
        });


    });



    function eliminar_ruta(ruta) {
        fs.readFile(repositorio_musica,function read(err, data){
            obj = JSON.parse(data);
            obj.rutas=_.without(obj.rutas, ruta);
            var songs=_.filter(obj.songs, function(element){ return element.ruta.toString() == ruta.toString()});
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









            var lista=_.filter(obj.songs, function(element){ return element.ruta == ruta; });

            result=_.filter(obj.songs, function(element){ return element.ruta == ruta; });

            var json = JSON.stringify(obj);
            fs.writeFile(repositorio_musica, json);
        });

    }


    function add_ruta(ruta) {
        fs.readFile(repositorio_musica,function read(err, data){
            obj = JSON.parse(data);
            control=_.contains(obj.rutas,ruta);
            if(control == false) {
                obj.rutas.push(ruta);
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
                var files=findFilesInDir(ruta,'.mp3');

            }});

    }




    function findFilesInDir(startPath,filter){

        var results = [];
        if (!fs.existsSync(startPath)){
            console.log("no dir ",startPath);
            return;
        }

        var files=fs.readdirSync(startPath);
        for(var i=0;i<files.length;i++){
            try {
                var filename=path.join(startPath,files[i]);
                var stat = fs.lstatSync(filename);
                if (stat.isDirectory()){
                    results = results.concat(findFilesInDir(filename,filter)); //recurse
                }
                else if (filename.lastIndexOf(filter)>=0) {
                    console.log('-- found: ',filename);
                    results.push(filename);
                }
            }
            catch(e){
                console.log(e);
            }

        }
        return results;
    }


    function add_song(name) {

        fs.readFile(repositorio_musica, function read(err, data) {
            if (!fs.existsSync(repositorio_musica)){
                return
            }
            if(data != undefined &&  err == undefined){
                obj = JSON.parse(data);
                console.log("agregando "+name);
                mm(fs.createReadStream(name), { duration: true },function (err, metadata) {

                    if(err == undefined){
                        try {
                            id=obj.ultimo_id+1;
                            var songs=_.uniq(obj.songs,false, function(element){ return element.album.toString(); });
                            if(metadata.album.toString() == "" || metadata.album.toString() == undefined){
                                control=false
                            }
                            if(_.find(songs,function(element){ return element.album.toString()== metadata.album.toString()}) == undefined){
                                image_dir="./public/img_songs/"+metadata.album.toString()+".jpg";
                                if(metadata.picture.length>0){
                                    control=base64_decode(metadata.picture[0].data, image_dir);
                                }
                                else
                                    control=false;
                            }
                            else{
                                control=true
                            }


                            if(control== true){
                                image_dir="/img_songs/"+metadata.album.toString()+".jpg";
                            }
                            else
                                image_dir=undefined;
                            song = {
                                "id": id,
                                "id_curso": null,
                                "image": image_dir,
                                "image_2": control,
                                "ruta": name,
                                "title": comprobar_metadato(metadata.title),
                                "artist": comprobar_metadato(metadata.artist),
                                "album": comprobar_metadato(metadata.album),
                                "year": comprobar_metadato(metadata.year),
                                "genre": comprobar_metadato(metadata.genre[0]),
                                "duration":comprobar_metadato(metadata.duration)
                            };

                            obj.songs.push(song);
                            obj.ultimo_id=id;
                            var json = JSON.stringify(obj);
                            if (fs.existsSync(repositorio_musica)){
                                fs.writeFile(repositorio_musica, json);
                            }
                            router.io.emit("add_song_ruta", obj.ultimo_id)

                        }
                        catch(e){
                            console.log(e);
                        }
                    }


                });
            }



        });

    }


    function add_song2(name) {

        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);
            console.log(name);

            mm(fs.createReadStream(name), { duration: true },function (err, metadata) {
                var id=obj.ultimo_id+1;
                if(metadata.picture[0].data.length > 0){
                    var all= "./public/img_songs/"+id+".jpg";
                    for(var i=0; i<metadata.picture[0].data.length; i++){
                        var buffer = new Buffer( new Uint8Array(metadata.picture[0].data[i]) );
                        all.write(buffer);
                    }
                    all.end();
                }


                var song = {
                    "id": id,
                    "id_curso": null,
                    "image": null,
                    "image_2":null,
                    "ruta": name,
                    "title": comprobar_metadato(metadata.title),
                    "artist": comprobar_metadato(metadata.artist),
                    "album": comprobar_metadato(metadata.album),
                    "year": comprobar_metadato(metadata.year),
                    "genre": comprobar_metadato(metadata.genre[0]),
                    "duration":comprobar_metadato(metadata.duration)

                };
                obj.songs.push(song);
                obj.ultimo_id=id;
                var json = JSON.stringify(obj);
                fs.writeFile(repositorio_musica, json);
            });



        });

    }


    function add_song3(filename,obj,repositorio_musica,req) {
        mm(fs.createReadStream(filename), { duration: true },function (err, metadata) {
            if(err == undefined){
                try {
                    id=obj.ultimo_id+1;
                    var songs=_.uniq(obj.songs,false, function(element){ return element.album.toString(); });
                    if(metadata.album.toString() == "" || metadata.album.toString() == undefined){
                        control=false
                    }
                    if(_.find(songs,function(element){ return element.album.toString()== metadata.album.toString()}) == undefined){
                        image_dir="./public/img_songs/"+metadata.album.toString()+".jpg";
                        if(metadata.picture.length>0){
                            control=base64_decode(metadata.picture[0].data, image_dir);
                        }
                        else
                            control=false;
                    }
                    else{
                        control=true
                    }

                    if(control== true){
                        image_dir="/img_songs/"+metadata.album.toString()+".jpg";
                    }
                    else
                        image_dir=undefined;
                    song = {
                        "id": id,
                        "id_curso": null,
                        "image": image_dir,
                        "image_2": control,
                        "ruta": filename,
                        "title": comprobar_metadato(metadata.title),
                        "artist": comprobar_metadato(metadata.artist),
                        "album": comprobar_metadato(metadata.album),
                        "year": comprobar_metadato(metadata.year),
                        "genre": comprobar_metadato(metadata.genre[0]),
                        "duration":comprobar_metadato(metadata.duration)
                    };

                    obj.songs.push(song);
                    obj.ultimo_id=id;
                    var json = JSON.stringify(obj);
                    fs.writeFile(repositorio_musica, json);
                    console.log("agregando"+song.ruta);
                    req.io.emit("add_song_ruta", _.size(obj.songs))

                }
                catch(e){console.log(e);}
            }


        });


    }




    function comprobar_metadato(meta) {
        if (meta == undefined ||meta == ""||meta==null){
            meta="Desconocido";
        }
        return meta;
    }






    function base64_decode(base64str, file) {
        if(base64str == undefined){
            return false
        }
        else {
            if(base64str.length>0){
                // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
                var bitmap = new Buffer(base64str, 'base64');
                // write buffer to file
                fs.writeFileSync(file, bitmap);
                return true;
            }
            else {return false;}
        }



    }









};

module.exports = controller_rutas;
