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

    $('.albumes').on('click', function (e) {
        e.preventDefault();
        $('header').css('background-image', 'none');
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');



        $.ajax({
            url: "/albumes",
            type: "POST",
            dataType:'json',

            beforeSend: function(){
                $("#loading").show();
            },
            success:function(data)
            {
                success_albumes(data);
            },
            complete: function(){
                $("#loading").hide();
            }




        });
    });


    $('input[type="file2"]').on('change',function(){
        var audio=$('#audio');
        var files = this.files;
        //alert(files);
        var file = URL.createObjectURL(files[0]);
        //alert(file);
        audio.attr('src',file);
        // audio[0].play();

    });

});

function sort_album() {
    var tipo=$(this).attr('name');
    $.ajax({
        url: "/sort_albumes",
        data:{
            'tipo': tipo
        },
        type: "POST",
        dataType:'json',
        beforeSend: function(){
            $("#loading").show();
        },
        success:function(data)
        {
            success_albumes(data);
        },
        complete: function(){
            $("#loading").hide();
        }

    });
}

function reproducir_albumes() {
    $.ajax({
        url: "/reproducir_albumes",
        data:{

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

function success_albumes(data) {
    //Limpiar header y canvas---------------------------------------------------------------------------------------
    var header=$('header').empty();
    var canvas=$('#canvas').empty();

    //Desactivar el disenno de reproduccion en curso y activar el disenno basico------------------------------------
    header.removeClass('header_lista_curso');
    canvas.removeClass('canvas_lista_curso');
    header.addClass('header_basico');
    canvas.addClass('canvas_basico');

    //Cabezera------------------------------------------------------------------------------------------------------

    if(data.tipo == "admin"){
        var tag= $("<h3 class='col-xs-12'>Álbumes</h3><br>"+
            "<ul class='col-xs-12'><li><a href='#' id='reproducir_albumes'><span class='glyphicon glyphicon-random'></span><span class='hidden-xs hidden-sm'> Reproducir aleatoriamente</span></a></li>"+
            "<li class='dropdown' id='canciones_dropdown_ordenar'></li>"+
            "</ul>");
        header.append(tag);
        tag.find('#reproducir_albumes').click(reproducir_albumes);
    }

    else {
        var tag= $("<h3 class='col-xs-12'>Álbumes</h3><br>"+
            "<ul class='col-xs-12'>"+
            "<li class='dropdown' id='canciones_dropdown_ordenar'></li>"+
            "</ul>");
        header.append(tag);
        tag.find('#reproducir_albumes').click(reproducir_albumes);
    }


    var ordenar_por=$('' +
        '<a href="#" class="dropdown-toggle glyphicon glyphicon-sort" data-toggle="dropdown">' +
        '<span class="hidden-xs hidden-sm" style="font-size: 17px;">Ordenar:</span>'+
        '</a>');
    var ul_dropdown=$('<ul id="ul_dropdown" class=" ul_dropdown dropdown-menu"></ul>');

    var fecha_adicion=$('<li name="fecha"><a href="#">Fecha de adición</a></li>');
    var a_z=$('<li name="title"><a href="#">De la A a la Z</a></li>');

    fecha_adicion.click(sort_album);
    a_z.click(sort_album);
    ul_dropdown.append(fecha_adicion);
    ul_dropdown.append(a_z);


    tag.find('#canciones_dropdown_ordenar').append(ordenar_por);
    ul_dropdown.insertAfter(ordenar_por);

    data=data.albumes;
    cargar_body_albumes(data,canvas)

}

function cargar_body_albumes(data,canvas) {
    for (var i = 0; i< data.length; i++) {
        if(data[i].image_2 == true){
            var img= $('<img class="caratula_album"/>').attr('src',data[i].image.toString());
        }
        else {
            var img= $('<img src="/img/caratula_disco.jpg" class="caratula_album"/>');
        }

        var a = $('<a href="#" class="albumm"></a>');
        var div = $('<div class="datos_album_song col-xs-2 col-sm-2 col-md-2 col-lg-3"></div>');
        var p_album_texto=$('<p class="album_texto"></p>').text(data[i].album).attr('name',data[i].album);
        var p_artista=$('<small class="text-muted album_sub_texto"></small>').text(data[i].artist);
        if(data[i].album.toString() == "Desconocido"){
            p_artista.hide();
        }
        a.appendTo(canvas);
        div.appendTo(a);
        img.appendTo(div);
        p_album_texto.appendTo(div);
        $('<br>').appendTo(p_album_texto);
        p_artista.appendTo(p_album_texto);
        a.click(get_album);
    }
}

function get_album() {
    var album=$(this).find(".album_texto").attr('name');
    var artist=$(this).find(".album_sub_texto").text();
    $.ajax({
        url: "/albumes/album",
        data:{
            'album':album,
            'artist':artist
        },
        type: "POST",
        dataType:'json',
        beforeSend: function(){
            $("#loading").show();
        },
        success:function(data)
        {
            success_album(data);
        },
        complete: function(){
            $("#loading").hide();
        }

    });
}

function success_album(data) {
    if (data.album.length >0){
        var header=$('header').empty();
        var canvas=$('#canvas').empty();
        header.addClass('header_basico');
       // header.addClass('header_lista_curso');
        canvas.removeClass('canvas_basico');
        canvas.addClass('canvas_lista_curso');
        var tipo=data.tipo;
        data=data.album;
        if(data.length>0){
                if (data[0].image_2 != false) {
                    var img_album = $('<img class="pull-left col-xs-4 col-sm-4 col-md-4 col-lg-4 caratula_album_header"/>').attr('src', data[0].image);

                }

                else {
                    var img_album = $('<img src="/img/caratula_disco.jpg" class="pull-left col-xs-4 col-sm-4 col-md-4 col-lg-4 caratula_album_header"/>');
                }

                data={data:data};
                var reproducir_album=$('<li><a href="#"><span class="glyphicon glyphicon-play"></span> <span class="hidden-xs ">Reproducir</span></a></li>');
                reproducir_album.attr('name',data.data[0].album);
                reproducir_album.click(m_reproducir_album);
                var li_eliminar_album=$('<li name="li_eliminar_album"><a href="#">Eliminar álbum</a></li>');
                li_eliminar_album.click(eliminar_album);


                var agregar_a_album=$('' +
                    '<li class="dropdown">' +
                    '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
                    '<span class="glyphicon glyphicon-plus"></span> <span class="hidden-xs ">Agregar a</span> ' +
                    '</a>' +
                    '<ul id="ul_dropdown" class="dropdown-menu"></ul>'+
                    '</li>');

                var mas_album=$('' +
                    '<li class="dropdown">' +
                    '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
                    '<span>... </span><span class="hidden-xs">Más</span> ' +
                    '</a>' +
                    '<ul id="ul_dropdown" class="dropdown-menu"></ul>'+
                    '</li>');

                var lista_curso=$('<li name="lista_curso"><a href="#">Reproducción en curso</a></li>');

                lista_curso.click(add_albumm);
                agregar_a_album.find('ul').append(lista_curso);
                mas_album.find('ul').append(li_eliminar_album);



                var titulo_sartista_album=$('<div class="titulo_sartista_album col-xs-12 col-sm-6 col-md-6"><h3 id="album_album_name">'+data.data[0].album+'</h3><h4>'+data.data[0].artist+'</h4></div>');
                var opciones_album=$('<ul class="opciones_album col-xs-12 col-sm-4 col-md-7"></ul>');
                reproducir_album.appendTo(opciones_album);
                img_album.appendTo(header);
                titulo_sartista_album.appendTo(header);
                if(tipo == "admin"){
                    opciones_album.appendTo(header);
                    agregar_a_album.appendTo(opciones_album);
                    mas_album.appendTo(opciones_album);

                }



                var tabla=$('<table id="tabla_album" class="table table-striped table-hover table-responsive"> </table>');
                var bodytabla=$('<tbody></tbody>');
                bodytabla.appendTo(tabla);
                for (var i = 0; i< data.data.length; i++) {
                    var duracion=null;
                    if(data.data[i].duration == "Desconocido"){
                        duracion = "0:00"
                    }
                    else {
                        duracion =  parseInt(data.data[i].duration).toHHMMSS();
                    }
                    var fila=$('<tr></tr>');
                    var columna_scope=$('<td>'+(i+1)+'</td>');
                    var columna_title=$('<td class="columna_title">'+data.data[i].title+'</td>');
                    var columna_artist=$('<td class="columna_artist ">'+data.data[i].artist+'</td>');
                    var columna_duration=$('<td class="columna_duration text-muted">'+duracion+'</td>');
                    fila.attr('name',data.data[i].ruta);
                    fila.attr('id',data.data[i].id);
                    fila.append(columna_scope);
                    fila.append(columna_title);
                    fila.append(columna_artist);
                    fila.append(columna_duration);

                    if(tipo == "admin"){
                        fila.dblclick(play_song);
                        fila.click(cambiar_estilo_filaa);
                    }
                    else {
                        fila.click(cambiar_estilo_fila_basicoo);
                    }

                    fila.appendTo(bodytabla);
                }
                tabla.appendTo(canvas);
        }

    }
}

function m_reproducir_album() {
    $.ajax({
        url: "/reproducir_album",
        data:{
            'album':$(this).attr('name')
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

function cambiar_estilo_filaa() {
    $(this).parent().children().removeAttr('class','fila_active').find('a').remove();
    var columna_title = $(this).find('.columna_title');
    var a_play_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-play"></span></a>');
    var a_add_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-plus"></span></a>');
    a_play_song.attr('name',$(this).attr('name'));
    a_play_song.attr('id',$(this).attr('id'));
    a_play_song.click(play_song);
    a_add_song.attr('name',$(this).attr('name'));
    a_add_song.attr('id',$(this).attr('id'));
    a_add_song.click(add_song);
    $(this).attr('class','fila_active');
    columna_title.append(a_play_song);
    columna_title.append(a_add_song);
}

function cambiar_estilo_fila_basicoo() {
    $(this).parent().children().removeAttr('class','fila_active').find('a').remove();
    var columna_title = $(this).find('.columna_title');
    var a_add_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-plus"></span></a>');
    a_add_song.attr('name',$(this).attr('name'));
    a_add_song.attr('id',$(this).attr('id'));
    a_add_song.click(add_song);
    $(this).attr('class','fila_active');
    columna_title.append(a_add_song);
}

function add_albumm(e) {
    e.preventDefault();
    $.ajax({
        url: "/add_album",
        data:{
            'lista_name':$(this).attr('name'),
            'album':$('#album_album_name').text()
        },
        type: "POST",
        dataType:'json'
    });
}

function eliminar_album(e) {
    e.preventDefault();
    $.ajax({
        url: "/eliminar_album",
        data:{
            'album':$('#album_album_name').text()
        },
        type: "POST",
        dataType:'json'
    });
    $('.menu').find('a').css('color','#444444');
    $('.albumes').css('color','#157fff');
    $.ajax({
        url: "/albumes",
        type: "POST",
        dataType:'json',
        success:function(data)
        {
            success_albumes(data);
        }
    });
}

function add_song(e) {
    e.preventDefault();
    $.ajax({
        url: "/add_song",
        data:{
            'id':$(this).attr('id')
        },
        type: "POST",
        dataType:'json'
    });
}

function play_song() {
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


