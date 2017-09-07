$(document).on('ready',function() {


   // Socket.io---------------------------------------

    window.io=io.connect();
    io.on('connect',function(socket) {
        get_song_curso();
    });

    io.on('add_song_ruta',function(data) {
        $('header').find(".alert").remove();
        sms=$('<div class="alert alert-info col-xs-8" role="alert"></div>').text("Su colección a aumentado a "+data+" canciones");
        $('header').prepend(sms);
    });

    io.on('get_song_curso',function(data) {

        if(data !=null){
            $('#titulo_rep_song').text(data.data.title.substring(0,15)+"");
            $('#artistaa_rep_song').text(data.data.artist);
            $('#album_rep_song').text(data.data.album).hide();
            $('#id_rep_song').text(data.data.id).hide();

            if(data.control_audio != "false"){
                $('#audio').attr('src', "/" + data.data.ruta.substring(3));
                $('#audio')[0].play();
                $('#play').parent().hide();
                $('#pause').parent().show();

                $('#barra_volumen').val(data.data_config.vol*100);
                $('#text_vol').text(parseInt(data.data_config.vol*100));
                $('#text_vol').attr('name',data.data_config.vol);
                $('#audio')[0].volume=data.data_config.vol;
            }

            if( data.data.image_2 != false){
                $('#img_album_pekenno').attr('src',data.data.image);
            }
            else {
                $('#img_album_pekenno').attr('src',"/img/caratula_disco.jpg");
            }
        }

        if ($('header').hasClass( "header_lista_curso" ) == true) {
            $('header').empty();
            var tag=$("<div class='header_reproduccion_en_curso '>"+
                "<h1>"+data.data.title+"<h3> "+data.data.album+"</h3></h1>" +
                "<h3>"+data.data.artist+"</h3>" +
                "</div>");

            $('header').append(tag);

            if(data.data.image_2 != false){
                $('header').css({
                    'backgroundImage': 'url('+ "\""+ data.data.image+ "\"" +')',
                    'background-position': 'center center',
                    'background-repeat': 'no-repeat',
                    //'background-size': '100% 100%',
                    'background-size': 'cover',
                    "background-color":"black"
                });
            }
            else {
                $('header').css('background-image', 'none');
                $('header').css("background-color","black");

            }
            $('#table_rep_curso tr').removeClass('fila_song_curso');
            $('#table_rep_curso tr[id='+data.data.id+']').addClass('fila_song_curso');

        }
        else {

        }
    });

    io.on('updateprogresss',function(data) {
        var audio=$('#audio');
        if(audio .html() !=undefined){
            if(! isNaN(audio.get(0).duration)){
                $('#barra_reproduccion').val(data.progress);
                audio.get(0).currentTime = data.current_time;
            }
        }

    });

    io.on('updatevolumen',function(data) {
        var audio=$('#audio');
        if(audio .html() !=undefined){
            $('#text_vol').attr('name',parseInt(data.progress));
            $('#text_vol').text(parseInt(data.progress));
            $('#barra_volumen').val(parseInt(data.progress));
            if(! isNaN(audio.get(0).duration)){
                audio[0].volume=data.vol;
            }
            if (data.vol == 0 || data.vol == "0"){
                $("#a_mutex").removeClass("glyphicon-volume-up");
                $("#a_mutex").addClass("glyphicon-volume-off");
            }
            else {
                audio[0].muted=false;
                $("#a_mutex").addClass("glyphicon-volume-up");
                $("#a_mutex").removeClass("glyphicon-volume-off");
            }
        }
    });

    io.on('play',function(data) {
        var audio=$('#audio');
        if(audio .html() !=undefined){
            if(! isNaN(audio.get(0).duration)){
                audio.get(0).play();
                $('#pause').parent().show();
                $('#play').parent().hide();
            }
        }
    });

    io.on('pause',function(data) {
        var audio=$('#audio');
        if(audio .html() != undefined){
            if(! isNaN(audio.get(0).duration)){
                audio.get(0).pause();
                $('#play').parent().show();
                $('#pause').parent().hide();
            }
        }

    });

    io.on('set_loop',function(data) {
        if($("audio").html()!=undefined){
            var audio = document.getElementById("audio");
            var loop_ico = $('#loop').parent();
            if(data !="true"){
                audio.loop = true;
                loop_ico.addClass("loop_true");
                loop_ico.addClass("img-circle");



            }
            else{
                audio.loop = false;
                loop_ico.removeClass("loop_true");
                loop_ico.removeClass("img-circle");
            }
        }

    });

    io.on('set_muted',function(data) {
        var audio = document.getElementById("audio");
        if($("audio").html()!= undefined){
            var muted_ico = document.getElementById("a_mutex");
            if(data != "true"){
                audio.muted = true;
                muted_ico.classList.remove("glyphicon-volume-up");
                muted_ico.classList.add("glyphicon-volume-off");
                $('#barra_volumen').val(0);
                $('#text_vol').text("0");

            }
            else{
                audio.muted = false;
                if (! isNaN($('#audio')[0].volume)){
                    if($('#audio')[0].volume >0){
                        muted_ico.classList.remove("glyphicon-volume-off");
                        muted_ico.classList.add("glyphicon-volume-up");
                    }

                    $('#barra_volumen').val(parseInt($('#audio')[0].volume*100));
                    $('#text_vol').text(parseInt($('#audio')[0].volume*100));
                }

            }
        }

    });


    //Eventos de los controles del menu de reproduccion-----------------------------------------------------------------

    $('#play').on('click',function(e){
        $.ajax({
            url: "/play",
            data:{},
            type: "GET",
            success: function (data) {
            }
        });



    });

    $('#pause').on('click',function(e){
        $.ajax({
            url: "/pause",
            data:{},
            type: "GET",
            success: function (data) {
            }
        });

    });

    $('#next').on('click',function(e){
        e.preventDefault();
        set_song_curso('siguiente',null);
    });

    $('#back').on('click',function(e){
        e.preventDefault();
        set_song_curso('anterior',null);
    });


    $('.login').on('click', function (e) {
        $('div[id="sms_login"]').empty();
        $('header').css('background-image', 'none');
        //Activar color active en SideBar y desactivar el anterior
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');

        e.preventDefault();
        $('#modal_login').show();
    });


    $('.logout').on('click', function (e) {
        $('header').css('background-image', 'none');
        $("#id_password").removeClass('borde_rojo');
        //Activar color active en SideBar y desactivar el anterior
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');

        $.ajax({
            url: "/logout",
            data:{},
            type: "GET",
            success: function (data) {
                window.location="/"
            }
        });

    });


});

//Funciones para el manejo del DOM de la Vista Principal----------------------------------------------------------------

Number.prototype.toHHMMSS = function () {
    var seconds = Math.floor(this),
        hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes =  ""+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
};


function set_song_curso(tipo,id) {
    var control;
    if($("#ramdom").parent().hasClass("ramdom_true")){tipo="ramdom";}
    if($("#loop").parent().hasClass("loop_true")) {
        //get_song_curso();
    }

    $.ajax({
            url: "/set_song_cursoo",
            data:{
                "tipo":tipo,
                "id":id
            },
            type: "POST",
            dataType:'json',
            success:function() {
                get_song_curso();
            }
        });



}

function updateTrackTime(){
    var audio=$('#audio');
    var current_time=audio.get(0).currentTime;
    var duration=audio.get(0).duration;
    var progress=(current_time*100)/duration;
    $('#current_time').text(current_time.toHHMMSS());
    $('#barra_reproduccion').val(progress);
    if(! isNaN(duration)){
        $('#duracion_song').text(duration.toHHMMSS());
    }
}

function updateprogresss() {
    var audio=$('#audio');
    var duration = audio.get(0).duration;
    if(! isNaN(audio.get(0).duration)){
        var progress =parseInt($('#barra_reproduccion').val());
        $.ajax({
            url: "/updateprogresss",
            data:{'current_time': parseInt(progress * duration / 100),
                  'progress' :progress

            },
            type: "POST",
            success: function (data) {
            }

        });
    }
}

function updatevolumen() {

    var progress =parseInt($('#barra_volumen').val());
    $.ajax({
        url: "/updatevolumen",
        data:{ 'vol': (progress/100).toString(),
               'progress' :progress

        },
        type: "POST",
        success: function (data) {
        }
    });

    /*
    $('#text_vol').text(progress.toString());
    var vol=(progress/100).toString();
    $('#text_vol').attr('name',vol);
    if(! isNaN(audio.get(0).duration)){
        audio[0].volume=vol;
    }*/
}

function get_song_curso() {
    control_audio=false;
    if($("audio").html() != undefined){
        control_audio=true;
    }
    $.ajax({
        url: "/get_song_curso",
        data:{
            "control_audio":control_audio
        },
        type: "POST",
        dataType:'json'
    });
}

function set_muted() {
    var audio = document.getElementById("audio");
    $.ajax({
        url: "/set_muted",
        data:{'muted': audio.muted},
        type: "POST",
        success: function (data) {
        }
    });
}

function set_loop() {
    var audio = document.getElementById("audio");
    $.ajax({
        url: "/set_loop",
        data:{'loop': audio.loop},
        type: "POST",
        success: function (data) {
        }
    });
}

function set_ramdom() {
    var ramdom_ico = $("#ramdom").parent();
    if(ramdom_ico.hasClass("ramdom_true")){
        ramdom_ico.removeClass("ramdom_true");
        ramdom_ico.removeClass("img-circle");
    }
    else{
        ramdom_ico.addClass("img-circle");
        ramdom_ico.addClass("ramdom_true");
    }
}

function set_config() {
    var ramdom_ico = $("#ramdom");
    var loop_ico = document.getElementById("loop");
    var loop=false;
    var ramdom=false;
    var vol=$('#barra_volumen').val();
    if(ramdom_ico.hasClass("ramdom_true")){
        ramdom=true;
    }

    if(audio.loop ==true){
        loop=true;
    }

    $.ajax({
        url: "/set_config",
        data:{
            "ramdom":ramdom,
            "loop":loop,
            "vol":vol
        },
        type: "POST",
        dataType:'json',
        success:function(data)
        {

        }
    });


}


function login() {
    var password=$('input[id="id_password"]').val();
    if(password != ""){
        $('input[id="id_password"]').val("");
        $.ajax({
            url: "/login",
            data:{
                'password':password
            },
            type: "POST",
            dataType:'json',
            success:function(data) {
                if(data.error){
                    $('div[id="sms_login"]').empty().append($("<small style='color:darkred; margin: 20px'><small>").text(data.error));
                    $("#id_password").addClass('borde_rojo');
                }
                else {
                    window.location=data.data;
                }

            }
        });
    }
}





