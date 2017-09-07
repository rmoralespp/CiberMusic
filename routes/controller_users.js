var _ =require('underscore');
var fs = require('fs');


var controller_users=function (router,repositorio_musica) {


    router.post('/login',function (req, res) {
        password = req.body.password;
        fs.readFile(repositorio_musica, function read(err, data) {
            obj = JSON.parse(data);


            if (password == obj.config.password) {
                req.session.user=true;

                res.json({'data': "/index"});
               // res.redirect("index");
            }
            else {
                res.json({'error': "La contraseña es incorecta"});
            }
        });
    });


    router.get('/logout' ,function (req, res) {
                req.session.destroy();
                res.json({'data': "/"});
    });

};
module.exports=controller_users;