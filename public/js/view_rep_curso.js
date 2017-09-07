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


$(document).on('ready',function() {

    io.on('add_album',function(data) {
        if ($('header').hasClass( "header_lista_curso" ) == false) {}
        else{
            success_rep_curso(data);

        }
    });


    io.on('add_songs_externas',function(data) {
        if ($('header').hasClass( "header_lista_curso" ) == false) {}
        else{
            success_rep_curso(data);

        }
    });



    io.on('reproducir_album',function(data) {
        if ($('header').hasClass( "header_lista_curso" ) == false) {}
        else{
            success_rep_curso(data);

        }
    });

    $('.reproduccion_en_curso').on('click',function(e){
        e.preventDefault();
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');
        var header=$('header').empty();
        var canvas=$('#canvas').empty();
         header.removeClass('header_basico');
         header.addClass('header_lista_curso');
         canvas.removeClass('canvas_basico');
         canvas.addClass('canvas_lista_curso');

         $.ajax({
                url: "/get_lista_curso",
                data:{
                },
                type: "GET",
                dataType:'json',
             beforeSend: function(){
                 $("#loading").show();
             },
             success:function(data)
             {
                 success_rep_curso(data)
             },
             complete: function(){
                 $("#loading").hide();
             }
            });


    });


    function success_rep_curso(data) {
        tipo=data.tipo;
        data=data.lista_cursoo;
        $('header').empty();
        var tag=$("<div class='header_reproduccion_en_curso col-xs-12'>"+
            "<h1>"+$('#titulo_rep_song').text()+"<h3> "+$('#album_rep_song').text()+"</h3></h1>" +
            "<h3>"+ $('#artistaa_rep_song').text()+"</h3>" +
            "</div>");

        $('header').append(tag);

        if($('#img_album_pekenno').attr('src') != "/img/caratula_disco.jpg"){
            url=$('#img_album_pekenno').attr('src').substring(1,$('#img_album_pekenno').attr('src').length);
            $('header').css({
                'backgroundImage': 'url('+ "\""+ url+ "\"" +')',
                'background-position': 'center center',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                "background-color":"black"
                //'background-size': '100% 100%'
            });
        }
        else{
            $('header').css('background-image', 'none');
            $('header').css({ "background-color":"black"});

        }


        var canvas=$('#canvas').empty();
        var tabla=$('<table id="table_rep_curso" class="table table-striped table-hover table-responsive"> </table>');
        var bodytabla=$('<tbody></tbody>');
        bodytabla.appendTo(tabla);
        for (var i = 0; i< data.length; i++) {
            var duracion=null;
            if(data[i].duration == "Desconocido"){
                duracion = "0:00"
            }
            else {
                duracion= data[i].duration.toHHMMSS();
            }
            var fila=$('<tr> <td scope="row" id="columna_title"><span class="glyphicon glyphicon-music text-muted"></span>'+" "+data[i].title+'</td> <td class="text-muted hidden-xs" id="columna_artist">'+data[i].artist+'</td> <td class="text-muted" id="columna_album" hidden>'+data[i].album+'</td> <td id="columna_duration" class="text-muted">'+duracion+'</td> </tr>');
            fila.attr('name',data[i].ruta);
            fila.attr('id',data[i].id);
            if(tipo == "admin"){
                fila.click(play_cancionn);
            }

            fila.appendTo(bodytabla);
        }
        tabla.appendTo(canvas);
        $('#table_rep_curso tr[id='+$('#id_rep_song').text()+']').addClass('fila_song_curso');

    }

    function play_cancionn() {
        var header=$('header').empty();
        header.addClass("header-fixed");

        tag="<div class='header_reproduccion_en_curso'>"+
            "<h1>"+$(this).find('#columna_title').text()+"( )</h1>" +
            "<h3>"+$(this).find('#columna_artist').text()+"</h3>" +
            "</div>";
        header.append(tag);

        $.ajax({

            url: "/set_song",
            data:{
                'id':$(this).attr('id')
            },
            type: "POST",
            dataType:'json',
            beforeSend: function(){
                $("#loading").show();
                },
            success:function(data)
            {

               get_song_curso();
            },
            complete: function(){
                $("#loading").hide();
            }
            });



    }
});


