function buscar() {

    if($('#id_buscar').val() !=""){
        $('.menu').find('a').css('color','#444444');
        $.ajax({
            url: "/buscar",
            type: "POST",
            data:{
                'texto': $('#id_buscar').val()
            },
            dataType:'json',
            beforeSend: function(){
                $("#loading").show();
            },
            success:function(data)
            {
                success_buscar(data);
            },
            complete: function(){
                $("#loading").hide();
            }

        });

    }

}


function buscar2() {

    if($('#id_buscar2').val() !=""){
        $('#modal_buscar').hide();
        $('.menu').find('a').css('color','#444444');
        $.ajax({
            url: "/buscar",
            type: "POST",
            data:{
                'texto': $('#id_buscar2').val()
            },
            dataType:'json',
            beforeSend: function(){
                $("#loading").show();
            },
            success:function(data)
            {
                success_buscar(data);
            },
            complete: function(){
                $("#loading").hide();
            }

        });

    }

}

function success_buscar(data) {
    //Limpiar header y canvas---------------------------------------------------------------------------------------
    var header=$('header').empty();
    var canvas=$('#canvas').empty();
    //Desactivar el disenno de reproduccion en curso y activar el disenno basico------------------------------------
    header.removeClass('header_lista_curso');
    canvas.removeClass('canvas_lista_curso');
    header.addClass('header_basico');
    canvas.addClass('canvas_basico');

    var title_artistas=$('<h3 class="col-xs-11" style="margin-top: 20px">Artistas</h3><br>');
    var title_albumes=$('<h3 class="col-xs-11" style="margin-top: 20px">Álbumes</h3><br>');
    var title_canciones=$('<h3 class="col-xs-11" style="margin-top: 20px">Canciones</h3><br>');
    var hr=$('<hr class="col-xs-11">');
    var hr1=$('<hr class="col-xs-11">');
    var hr2=$('<hr class="col-xs-11">');

    canvas.append(title_albumes);
    canvas.append(hr);
    cargar_body_albumes(data.albumes.albumes,canvas);

    canvas.append(title_artistas);
    canvas.append(hr1);
    cargar_body_artista(data.artistas.artistas,canvas);
    canvas.append(title_canciones);
    canvas.append(hr2);

    cargar_canciones(data.canciones,canvas);
    $('.tabla_canciones td:nth-child(1)').hide();

}

















$(document).on('ready',function() {


    //Este no se usa
    $('#buscar').on('click', function (e) {
        e.preventDefault();
        $('.menu').find('a').css('color','#444444');
        var texto=$('#menu_buscar_song').val();
        if (texto !=""){

            $.ajax({
                url: "/buscar",
                type: "POST",
                data:{
                    'texto': texto
                },
                dataType:'json',
                beforeSend: function(){
                    $("#loading").show();
                },
                success:function(data)
                {
                    success_buscar(data);
                },
                complete: function(){
                    $("#loading").hide();
                }

            });
        }

    });



});