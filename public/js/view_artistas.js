$(document).on('ready',function() {



    $('.artistas').on('click', function (e) {
        e.preventDefault();
        $('header').css('background-image', 'none');
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');
        $.ajax({
            url: "/artistas",
            data:{
            },
            type: "POST",
            dataType:'json',
            beforeSend: function(){
                $("#loading").show();
            },
            success:function(data)
            {
                success_artistas(data);
            },
            complete: function(){
                $("#loading").hide();
            },

            error: function(jqXHR, textStatus, errorThrown)
            {
                console.log(errorThrown);
            }
        });


    });



});

function sort_artistas() {
    var tipo=$(this).attr('name');
    $.ajax({
        url: "/sort_artistas",
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
            success_artistas(data);
        },
        complete: function(){
            $("#loading").hide();
        }

    });
}


function reproducir_artistas() {
    $.ajax({
        url: "/reproducir_artistas",
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

function success_artistas(data) {
    var header=$('header').empty();
    var canvas=$('#canvas').empty();

    header.removeClass('header_lista_curso');
    canvas.removeClass('canvas_lista_curso');
    header.addClass('header_basico');
    canvas.addClass('canvas_basico');
    // header.removeClass("header-fixed");
    if(data.tipo == "admin"){
        var tag= $("<h3 class='col-xs-12'>Artistas</h3><br>"+
            "<ul class='col-xs-12'><li><a href='#' id='reproducir_artistas'><span class='glyphicon glyphicon-random'></span><span class='hidden-xs hidden-sm'> Reproducir aleatoriamente</span></a></li>"+
            "<li class='dropdown' id='canciones_dropdown_ordenar'></li>"+
            "</ul>");
        header.append(tag);
        tag.find('#reproducir_artistas').click(reproducir_artistas);
    }

    else {
        var tag= $("<h3 class='col-xs-12'>Artistas</h3><br>"+
            "<ul class='col-xs-12'>"+
            "<li class='dropdown' id='canciones_dropdown_ordenar'></li>"+
            "</ul>");
        header.append(tag);
    }


    var ordenar_por=$('' +
        '<a href="#" class="dropdown-toggle glyphicon glyphicon-sort" data-toggle="dropdown">' +
        '<span class="hidden-xs hidden-sm" style="font-size: 17px;">Ordenar:</span>'+
        '</a>');
    var ul_dropdown=$('<ul id="ul_dropdown" class="ul_dropdown dropdown-menu"></ul>');

    var fecha_adicion=$('<li name="fecha"><a href="#">Fecha de adición</a></li>');
    var a_z=$('<li name="title"><a href="#">De la A a la Z</a></li>');

    fecha_adicion.click(sort_artistas);
    a_z.click(sort_artistas);
    ul_dropdown.append(fecha_adicion);
    ul_dropdown.append(a_z);


    tag.find('#canciones_dropdown_ordenar').append(ordenar_por);
    ul_dropdown.insertAfter(ordenar_por);
    data=data.artistas;
    cargar_body_artista(data,canvas)

}


function cargar_body_artista(data,canvas) {
    for (var i = 0; i< data.length; i++) {
        var artist = $("<a href='#' class='datos_album_song col-xs-2 col-sm-2 col-md-2 col-lg-3'> " +
            "<img src='/img/caratula_artista.jpg' class='caratula_album img-circle'/> " +
            "<p class='text-muted' style='margin-left: 30px';>"+data[i].artist+"</p>" +
            "</a>");
        artist.attr('name',data[i].artist);
        artist.click(get_artist);
        $('#canvas').append(artist);
    }
}

function get_artist() {
    var artist=$(this).attr('name');
    $.ajax({
        url: "/artistas/artist",
        data:{
            'artist':artist
        },
        type: "POST",
        dataType:'json',
        beforeSend: function(){
            $("#loading").show();
        },
        success:function(data)
        {
            success_artist(data);
        },
        complete: function(){
            $("#loading").hide();
        }

    });
}

function success_artist(data) {
    var header=$('header').empty();
    var tag= $("<h3 class='col-xs-12'>"+data.artist[0].artist+"</h3>");
    header.append(tag);


    if(data.artist.length>0){
        var canvas=$('#canvas').empty();
        var tipo=data.artist[0].album.toString();
        subtitle=$('<h3 style="margin-left: 20px;cursor: pointer;color: #2497E3;" class="pull-left">'+tipo+'</h3>');
        subtitle.attr('name',tipo);
        if(data.tipo == "admin"){
            subtitle.click(m_reproducir_album);
        }
        img_album=$('<img class="caratula_album pull-left" src="/img/caratula_disco.jpg"><br>');
        div=$('<div class="div_album_artist"></div>');
        div.append(img_album);
        div.append(subtitle);
        canvas.append(div);
        tabla=$('<table  style="margin-bottom: 50px;" class="tabla_canciones col-xs-6 table table-striped table-hover table-responsive"> </table>');
        bodytabla=$('<tbody></tbody>');
        bodytabla.appendTo(tabla);
        tabla.appendTo(canvas);
        var tipo_session=data.tipo;
        data=data.artist;
        for (var i = 0; i< data.length; i++) {
            var duracion=null;
            if(data[i].duration == "Desconocido"){
                duracion = "0:00"
            }
            else {
                duracion =  parseInt(data[i].duration).toHHMMSS();
            }

            if( tipo != data[i].album.toString()){
                tipo = data[i].album.toString();
                subtitle=$('<h3 style="margin-left: 20px;cursor: pointer;color: #2497E3;" class="pull-left">'+tipo+'</h3>');
                subtitle.attr('name',tipo);

                if(tipo_session == "admin"){
                    subtitle.click(m_reproducir_album);
                }
                img_album=$('<img class="caratula_album pull-left" src="/img/caratula_disco.jpg"><br>');
                div=$('<div class="div_album_artist"></div>');
                div.append(img_album);
                div.append(subtitle);

                canvas.append(div);
                tabla=$('<table style="margin-bottom: 50px;" class="tabla_canciones col-xs-6 pull-right table table-striped table-hover table-responsive"> </table>');
                bodytabla=$('<tbody></tbody>');
                bodytabla.appendTo(tabla);
                tabla.appendTo(canvas);

            }


            var fila=$('<tr></tr>');
            var columna_title=$('<td class="columna_title">'+data[i].title+'</td>');
            var columna_duration=$('<td class="columna_duration text-muted">'+duracion+'</td>');
            fila.attr('name',data[i].ruta);
            fila.attr('id',data[i].id);
            fila.append(columna_title);
            fila.append(columna_duration);
            fila.dblclick(play_song);
            if(tipo_session == "admin"){
                fila.click(cambiar_estilo_fila);
            }
            else{
                fila.click(cambiar_estilo_fila_basico)
            }
            fila.appendTo(bodytabla);
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

function cambiar_estilo_fila() {
    $('.tabla_canciones tr').removeAttr('class','fila_active').find('a').remove();
    var columna_title = $(this).find('.columna_title');
    var a_play_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-play"></span></a>');
    var a_add_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-plus"></span></a>');
    a_play_song.attr('name',$(this).attr('name'));
    a_play_song.attr('id',$(this).attr('id'));
    a_add_song.attr('name',$(this).attr('name'));
    a_add_song.attr('id',$(this).attr('id'));
    a_play_song.click(play_song);
    a_add_song.click(add_song);
    $(this).attr('class','fila_active');
    columna_title.append(a_play_song);
    columna_title.append(a_add_song);
}

function cambiar_estilo_fila_basico() {
    $('.tabla_canciones tr').removeAttr('class','fila_active').find('a').remove();
    var columna_title = $(this).find('.columna_title');
    var a_add_song=  $('<a href="#" class="opcion_fila"><span class="glyphicon glyphicon-plus"></span></a>');
    a_add_song.attr('name',$(this).attr('name'));
    a_add_song.attr('id',$(this).attr('id'));
    $(this).attr('class','fila_active');
    columna_title.append(a_add_song);
    a_add_song.click(add_song);
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