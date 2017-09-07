//Importaciones---------------------------------------------------------------------------------------------------------

var express = require('express.io');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig=require('swig');
var id3 = require('id3js');
var jsonfile = require('jsonfile');
var _ =require('underscore');
var fs = require('fs');
var mm = require('musicmetadata');
var window = require('node-window');




//Configuracion---------------------------------------------------------------------------------------------------------
var repositorio_musica=path.join(__dirname, 'public/js/repositorio_musica.json');
var router = express();

//Levanto socket.io en el mismo puerto de express
router.http().io();

//Motor de Templates
router.engine('html',swig.renderFile);
router.set('views',path.join(__dirname, 'views'));
router.set('view engine', 'html');


router.use(favicon());
router.use(logger('dev'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(cookieParser());

//Archivos Estaticos
router.use(express.static(path.join(__dirname, 'public')));
router.use(express.static("C:\\"));
router.use(express.static("D:\\"));
router.use(express.static("\\\\172.16.0.54\\"));

router.use(express.session({secret: "abcd"}));

//Controllers
var controller_albumes = require('./routes/controller_albumes');
var controller_rutas = require('./routes/controller_rutas');
var controller_artists = require('./routes/controller_artists');
var controller_curso = require('./routes/controller_curso');
var controller_songs = require('./routes/controller_songs');
var controller_sound = require('./routes/controller_sound');
var controller_users = require('./routes/controller_users');

controller_albumes(router,repositorio_musica);
controller_rutas(router,repositorio_musica);
controller_artists(router,repositorio_musica);
controller_curso(router,repositorio_musica);
controller_songs(router,repositorio_musica);
controller_sound(router,repositorio_musica);
controller_users(router,repositorio_musica);

//Rutas-----------------------------------------------------------------------------------------------------------------
var isntLoginIN= function (req,res, next) {
    if(!req.session.user){
        res.redirect('/');
        return;
    }
    next();
};

var inLoginIN= function (req,res, next) {
    if(req.session.user){
        res.redirect('/index');
        return;
    }
    next();
};

/* GET home page. */
router.get('/', inLoginIN ,function(req, res) {
    res.render('index_basico', { title: 'Express' });
});


router.get('/index', isntLoginIN,function(req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/get_image', function(req, res) {
    var ruta=req.body.ruta;
    var data=req.body.data;
    mm(fs.createReadStream(ruta),function (err, metadata) {
        if(metadata.picture.length>0){
            var base64String = "";
            for (var i = 0; i < metadata.picture[0].data.length; i++) {
                base64String += String.fromCharCode(metadata.picture[0].data[i]);
            }
            var dataUrl = "data:" + metadata.picture[0].format + ";base64," + window.btoa(base64String);
        }
        else{
            var dataUrl=null;
            }
        res.json({"url":dataUrl,"data":data});
    });
});

router.post('/buscar', function(req, res) {
    var texto=req.body.texto;
    fs.readFile(repositorio_musica, function read(err, data) {
        obj = JSON.parse(data);
        var songs=_.filter(obj.songs, function(element){
            title=element.title.toString().toLowerCase();
            texto=texto.toLowerCase();
            title = title.replace(/á/gi,"a");
            title = title.replace(/é/gi,"e");
            title = title.replace(/í/gi,"i");
            title = title.replace(/ó/gi,"o");
            title = title.replace(/ú/gi,"u");
            return title.indexOf(texto) !== -1;});
        var albumes=_.uniq(
            _.filter(obj.songs, function(element){
                album=element.album.toString().toLowerCase();
                texto=texto.toLowerCase();
                album = album.replace(/á/gi,"a");
                album = album.replace(/é/gi,"e");
                album = album.replace(/í/gi,"i");
                album = album.replace(/ó/gi,"o");
                album = album.replace(/ú/gi,"u");
                return album.indexOf(texto) !== -1;}),false,function(element) { return element.album.toString();});

        var artistas=_.uniq(
            _.filter(obj.songs, function(element){
                artist=element.artist.toString().toLowerCase();
                texto=texto.toLowerCase();
                artist = artist.replace(/á/gi,"a");
                artist = artist.replace(/é/gi,"e");
                artist = artist.replace(/í/gi,"i");
                artist = artist.replace(/ó/gi,"o");
                artist = artist.replace(/ú/gi,"u");
                return artist.indexOf(texto) !== -1;}),false,function(element) { return element.artist.toString();});


        if(req.session.user){
            var tipo="admin"
        }
        else{
            var tipo="user"
        }

        canciones={canciones:songs,tipo: tipo};
        albumes={albumes:albumes,tipo: tipo};
        artistas={artistas:artistas,tipo: tipo};
        res.json({canciones:canciones,artistas:artistas,albumes:albumes});

    });
});

router.post('/set_config', function(req, res) {
    var loop=req.body.loop;
    var ramdom=req.body.ramdom;
    var vol=req.body.vol;

    fs.readFile(repositorio_musica, function read(err, data) {
        obj = JSON.parse(data);
        obj.config.vol=vol;
        obj.config.loop=loop;
        obj.config.ramdom=ramdom;
        fs.writeFile(repositorio_musica, json);
        res.json(song_siguiente) ;

    });
});


//-------------------------------------------------------------


router.listen(3000);

//module.exports = router;
