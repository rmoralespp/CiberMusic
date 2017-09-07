function cargar_nueva_ruta() {
    $('#nueva_ruta_formm').toggle();
    $('#modal_rutas').hide();

    var ruta=$('input[id="id_ruta"]').val();
    if(ruta != ""){
        $('#nueva_ruta_formm').hide();
        $('input[id="id_ruta"]').val("");
        /*
        $.ajax({
            url: "/cargar_ruta",
            data:{
                'ruta':ruta
            },
            type: "POST",
            dataType:'json',
            success:function(data) {}
        });
        */
        io.emit('cargar_ruta',{"ruta":ruta});
    }
}



$(document).on('ready',function() {


    $('.rutas').on('click', function (e) {
        $('header').css('background-image', 'none');
        //Activar color active en SideBar y desactivar el anterior
        $('.menu').find('a').css('color','#444444');
        $(this).css('color','#157fff');

        e.preventDefault();
        $.ajax({
            url: "/rutas",
            data:{
            },
            type: "GET",
            dataType:'json',
            success:function(data) {
                cargar_rutas(data)
            }
        });
    });


    function cargar_rutas(data) {
        $('#nueva_ruta_formm').hide();
        $('#rutas_modal').empty();
        var ruta_nueva=$("<a class='ruta rutanueva col-xs-4' href='#'><span id='nueva_ruta_div' class='glyphicon glyphicon-plus'></span></a>");
        ruta_nueva.click(mostra_nueva_ruta_form);
        $('#rutas_modal').append(ruta_nueva);

        for( var i=0;i<data.rutas.length;i++){
            var ruta=$("<div class='ruta col-xs-4' style='overflow-y: auto;'></div>");
            var div_left=$('<div class="col-xs-10 pull-left"><b></b><p></p><div>');
            var div_right=$('<div class="pull-right"><div>');
            var a_elminar_ruta=$('<a href="#" id="btn_eliminar_ruta"><span class="glyphicon glyphicon-remove"></span></a>');
            a_elminar_ruta.attr('name',data.rutas[i]);
            a_elminar_ruta.click(eliminar_ruta);
            ruta.append(div_left);
            ruta.append(div_right);
            div_right.append(a_elminar_ruta);
            ruta.find('b').text(filename = data.rutas[i].substring(data.rutas[i].lastIndexOf('\\')+1));
            ruta.find('p').text(data.rutas[i]);
            $('#rutas_modal').append(ruta);
        }

        $('#modal_rutas').show();

    }


    function mostra_nueva_ruta_form(e) {
        e.preventDefault();
        //$('#nueva_ruta_formm').fadeIn("slow");
        $('#nueva_ruta_formm').slideToggle();
    }


    function eliminar_ruta(e) {
        e.preventDefault();
        var ruta=$(this).attr('name');
        $.ajax({
            url: "/eliminar_ruta",
            data:{
                'ruta':ruta
            },
            type: "POST",
            dataType:'json',
            success:function(data) {
                cargar_rutas(data);
            }
        });
    }





    $('#nueva_ruta_div').on('click',function(e){
        e.preventDefault();
        $('#nueva_ruta_form').show();
    });







});