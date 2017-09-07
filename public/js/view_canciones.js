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

    $('.canciones').on('click', function (e) {


        $('header').css('background-image', 'none');
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');
        e.preventDefault();
        $.ajax({
            url: "/canciones",
            data:{
            },
            type: "POST",
            dataType:'json',
            beforeSend: function(){
                $("#loading").show();
            },
            success:function(data)
            {

                success_canciones(data);
                $('.tabla_canciones td:nth-child(1)').hide();
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

function reproducir_canciones() {
    var canciones_id=[];
    $('#tabla_canciones tr').each(function () {

        if( $(this).find("td").find('input[type="checkbox"]').is(':checked') ){
            canciones_id.push($(this).attr('id'));
        }
    });
    if(canciones_id.length>0){
        $.ajax({
            url: "/reproducir_canciones",
            data:{
                'canciones_id':canciones_id
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


}

function controlar_checkboxs(e) {
    e.preventDefault();
    if( $('.tabla_canciones').hasClass('checkbox_active')){
        $('.tabla_canciones').removeClass('checkbox_active');
        $('.tabla_canciones td:nth-child(1)').hide();
        $('.tabla_canciones td:nth-child(1)').find('input[type="checkbox"]').prop("checked", false);
        $(this).css('color','#444444');
        $(this).find('.text').text(" Seleccionar");

    }
    else {
        $(this).css('color','#157fff');
        $(this).find('.text').text(" Cancelar");
        $('.tabla_canciones').addClass('checkbox_active');
        $('.tabla_canciones td:nth-child(1)').show();
    }
}

function success_canciones(data) {
    if (data.canciones.length > 0) {
        var header = $('header').empty();
        var canvas = $('#canvas').empty();
        cargar_header(data, header, canvas);
        cargar_canciones(data,canvas);
    }
}

function success_canciones_sorted(data,tipo) {
    if (data.canciones.length > 0) {
        var header = $('header').empty();
        var canvas = $('#canvas').empty();
        cargar_header(data, header, canvas);
        var tabla = $('<table id="tabla_canciones" class="tabla_canciones table table-striped table-hover table-responsive"> </table>');
        var bodytabla = $('<tbody></tbody>');
        bodytabla.appendTo(tabla);
        $('.tabla_canciones td:nth-child(1)').hide();
        cargar_canciones_sort(data, bodytabla,tipo,canvas,tabla);
        tabla.appendTo(canvas);
        $('.tabla_canciones td:nth-child(1)').hide();
    }
}

function cargar_header(data,header,canvas) {
    header.removeClass('header_lista_curso');
    header.addClass('header_basico');
    canvas.removeClass('canvas_lista_curso');
    canvas.addClass('canvas_basico');

    if(data.tipo == "admin"){
        var tag= $("<h3 class='col-xs-12'>Canciones</h3><br>"+
            "<ul class='col-xs-12'><li><a href='#' id='reproducir_canciones'><span class='glyphicon glyphicon-play'></span><span class='hidden-xs hidden-sm text' > Reproducir </span></a></li>"+
            "<li class='dropdown' id='canciones_dropdown_ordenar'></li>"+
            "<li><a href='#' id='seleccionar_canciones'><span class='glyphicon glyphicon-list'></span><span class='hidden-xs hidden-sm text'> Seleccionar</span></a></li>" +
            "</ul>");
        header.append(tag);
        tag.find('#seleccionar_canciones').click(controlar_checkboxs);
        tag.find('#reproducir_canciones').click(reproducir_canciones);
    }
    else{
        var tag= $("<h3 class='col-xs-12'>Canciones</h3><br>"+
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
    var artista=$('<li name="artist"><a href="#">Artista</a></li>');
    var album=$('<li name="album"><a href="#">Álbum</a></li>');

    fecha_adicion.click(sort_song);
    a_z.click(sort_song);
    artista.click(sort_song);
    album.click(sort_song);

    ul_dropdown.append(fecha_adicion);
    ul_dropdown.append(a_z);
    ul_dropdown.append(artista);
    ul_dropdown.append(album);

    tag.find('#canciones_dropdown_ordenar').append(ordenar_por);
    ul_dropdown.insertAfter(ordenar_por);

}

function cargar_canciones(data,canvas) {
    var tabla = $('<table id="tabla_canciones" class=" tabla_canciones table table-striped table-hover table-responsive"> </table>');
    var bodytabla = $('<tbody></tbody>');
    bodytabla.appendTo(tabla);

    tipo_session=data.tipo;
    data=data.canciones;
    for (var i = 0; i< data.length; i++) {
        var duracion=null;
        if(data[i].duration == "Desconocido"){
            duracion = "0:00"
        }
        else {
            duracion= data[i].duration.toHHMMSS();
        }

        var fila=$('<tr> <td id="col_checkbox"><input type="checkbox" /></td><td scope="row" class="columna_title" id="columna_title"><span class="glyphicon glyphicon-music"></span>'+" "+data[i].title+'</td> <td class="hidden-xs hidden-sm " id="columna_artist">'+data[i].artist+'</td><td id="columna_duration" class="text-muted">'+duracion+'</td> </tr>');
        fila.attr('name',data[i].ruta);
        fila.attr('id',data[i].id);

        if(tipo_session == "admin"){
            fila.dblclick(play_song);
            fila.click(cambiar_estilo_fila);
        }
        else {
            fila.click(cambiar_estilo_fila_basico);
        }

        fila.appendTo(bodytabla);
    }
    tabla.appendTo(canvas);

}

function cargar_canciones_sort(data,bodytabla,tipo_sort,canvas,tabla) {
    tipo_session=data.tipo;
    data=data.canciones;
    if(tipo_sort == "artist"){
        tipo=data[0].artist;

        subtitle=$('<h3 style="cursor: pointer;color: #2497E3;">'+tipo+'<h3/>');
        subtitle.attr('name',tipo);
        if(tipo_session == "admin"){
            subtitle.dblclick(m_reproducir_artista);
        }
        canvas.append(subtitle);

        tabla = $('<table id="tabla_canciones" class="tabla_canciones table table-striped table-hover table-responsive"> </table>');
        bodytabla = $('<tbody></tbody>');
        bodytabla.appendTo(tabla);
        tabla.appendTo(canvas);
    }

    if(tipo_sort == "album"){
        tipo=data[0].album;

        subtitle=$('<h3 style="cursor: pointer;color: #2497E3;">'+tipo+'<h3/>');
        subtitle.attr('name',tipo);
        if(tipo_session == "admin"){
            subtitle.dblclick(m_reproducir_album);
        }

        canvas.append(subtitle);

        tabla = $('<table id="tabla_canciones" class="tabla_canciones table table-striped table-hover table-responsive"> </table>');
        bodytabla = $('<tbody></tbody>');
        bodytabla.appendTo(tabla);
        tabla.appendTo(canvas);
    }



    for (var i = 0; i< data.length; i++) {
        var duracion=null;
        if(data[i].duration == "Desconocido"){
            duracion = "0:00"
        }
        else {
            duracion= data[i].duration.toHHMMSS();
        }

        if(tipo_sort == "artist"){
            if( tipo != data[i].artist.toString()){
                tipo = data[i].artist;

                subtitle=$('<h3 style="cursor: pointer;color: #2497E3;">'+tipo+'<h3/>');
                subtitle.attr('name',tipo);
                if(tipo_session == "admin"){
                    subtitle.dblclick(m_reproducir_artista);
                }
                canvas.append(subtitle);

                tabla = $('<table id="tabla_canciones" class="tabla_canciones table table-striped table-hover table-responsive"> </table>');
                bodytabla = $('<tbody></tbody>');
                bodytabla.appendTo(tabla);
                tabla.appendTo(canvas);
            }
        }

        else if(tipo_sort == "album"){
            if( tipo != data[i].album.toString()){
                tipo = data[i].album;
                subtitle=$('<h3 style="cursor: pointer;color: #2497E3;">'+tipo+'<h3/>');
                subtitle.attr('name',tipo);
                if(tipo_session == "admin"){
                    subtitle.dblclick(m_reproducir_album);
                }
                canvas.append(subtitle);

                tabla = $('<table id="tabla_canciones" class="tabla_canciones table table-striped table-hover table-responsive"> </table>');
                bodytabla = $('<tbody></tbody>');
                bodytabla.appendTo(tabla);
                tabla.appendTo(canvas);
            }
        }


        var fila=$('<tr> <td id="col_checkbox"><input type="checkbox" /></td><td scope="row" class="columna_title" id="columna_title"><span class="glyphicon glyphicon-music"></span>'+" "+data[i].title+'</td> <td class="hidden-xs hidden-sm" id="columna_artist">'+data[i].artist+'</td><td id="columna_duration" class="text-muted">'+duracion+'</td> </tr>');
        fila.attr('name',data[i].ruta);
        fila.attr('id',data[i].id);

        fila.appendTo(bodytabla);
        if(tipo_session == "admin"){
            fila.dblclick(play_song);
            fila.click(cambiar_estilo_fila);
        }
        else {
            fila.click(cambiar_estilo_fila_basico);
        }

    }

}

function sort_song() {
    var tipo=$(this).attr('name');
    $.ajax({
        url: "/sort_canciones",
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
            success_canciones_sorted(data,tipo);
        },
        complete: function(){
            $("#loading").hide();
        }

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
            get_song_curso()
        },
        complete: function(){
            $("#loading").hide();
        }
    });

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
            get_song_curso()
        },
        complete: function(){
            $("#loading").hide();
        }
    });

}

function m_reproducir_artista() {
    $.ajax({
        url: "/reproducir_artista",
        data:{
            'artist':$(this).attr('name')
        },
        type: "POST",
        dataType:'json',
        beforeSend: function(){
            $("#loading").show();
        },
        success:function(data)
        {
            get_song_curso()
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
    tipo="song";
    if(tipo == "album"){
        a_play_song.click(m_reproducir_album);
    }
    else  if (tipo == "artist"){
        a_play_song.click(m_reproducir_artista);
    }

    else  if (tipo == "song"){

        a_play_song.click(play_song);
        a_add_song.click(add_song);
    }

    //li_lista_rep.click(add_song);
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
    tipo="song";
    if(tipo == "album"){

    }
    else  if (tipo == "artist"){

    }

    else  if (tipo == "song"){
        a_add_song.click(add_song);
    }

    //li_lista_rep.click(add_song);
    $(this).attr('class','fila_active');
    columna_title.append(a_add_song);
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

function add_album(e) {
    e.preventDefault();
    $.ajax({
        url: "/add_album",
        data:{
            'album':$(this).attr('name')
        },
        type: "POST",
        dataType:'json'
    });
}

function add_artist(e) {
    e.preventDefault();
    $.ajax({
        url: "/add_artist",
        data:{
            'artist':$(this).attr('name')
        },
        type: "POST",
        dataType:'json'
    });
}