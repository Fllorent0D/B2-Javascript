months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre','Décembre'];
var oldMonth;
var oldYear;

/**
 * Utilisé par le coulorPicker, crée une ligne hmtl pour chaque option du select
 * @param state
 * @returns {*|jQuery|HTMLElement}
 */
function formatPicker (state) {
    var $state = $('<span class="dots"><span class="text-'+state.id+'">.</span><span class="text"> '+state.text+'</span></span>');
    return $state;
}
/**
 * Init composants
 * Crée le select avec les mois
 * Crée le select avec les années
 * Init le couleur picker
 * Init le datepicker
 * Lance le premier calendrier
 */

$(function(){
    for(var i = 1; i <= 12; i++)
        $('#months').append('<li><a href="#" data-month="'+i+'">'+ months[i-1] +'</a></li>');
        //$('#months').append('<a href="#" class="btn btn-default btn-group-sm month" data-month="'+i+'">'+ months[i-1] +'</a>');
    for (i = new Date().getFullYear() + 20; i > 1900; i--)
    {
        $('#years').append('<li><a href="#" data-year="'+i+'">'+ i +'</a></li>');
    }
    today();
    $(".colorPicker").select2({
        minimumResultsForSearch: Infinity,
        templateResult: formatPicker
    });

    $('#editdate').datepicker({
        weekStart: 1,
        format: "dd/mm/yyyy",
        language: "fr",
        orientation: "top left"
    });

    refreshCalendar();
});

/**
 * Evenement
 * Changement de mois en choissisant dans le select #months
 */
$('#months').on('click', 'a',function() {
    setMonth($(this).data('month'));
    refreshCalendar()
});

/**
 * evenement
 * Changement d'année en choissant dans le select #years
 */
$('#years').on('click', 'a',function() {
    setYear($(this).data('year'));
    refreshCalendar()
});

/**
 * Evenement
 * Appuie sur le bouton ->
 */
$('#next').click(function(){
    nextMonth();
    //setYear(getYear() + 1 );
});

/**
 * Evenement
 * Appuie sur le bouton <-
 */
$('#previous').click(function(){
    previousMonth();
   // setYear(getYear() - 1 );
});

/**
 * Evenement
 * Appuie sur le bouton 'Aujourd'hui'
 */
$('#today').click(function(){today();});

/**
 * Evenement
 * Appuie sur une des cases du tableau/calendrier
 * Change de mois si on clique hors
 * Charge les événements à la date choisie
 */
$('.calendar').on('click','td', function(){
    var datadate = $(this).data('date');

    if(datadate == null)
    {
        var date = $('.date', this).html();

        if(date < 15)
        {
            nextMonth();
        }
        else
        {
            previousMonth();
        }
        setTimeout(function(){selectDate(date)}, 1000);
    }
    else
    {
        var month = getMonth();
        var year = getYear();
        var day = datadate;
        if($('.current').length)
            $('.current').removeClass('current');
        $(this).addClass('current');
        $('#accordion').html("");

        $.ajax({

            url: "server/event.php?year="+year+"&month="+month+"&day="+day
        })
            .done(function( data ) {

                $('#accordion').html("");
                $('#accordion').append('<h2 class="text-center">'+day+' '+months[month-1]+' '+year+'</h2>');

                if(data.length > 0)
                {

                    $('.current .label').html(data.length);
                    $('#accordion').append('<h4 class="text-center">'+data.length+' évènements</h4><hr class="separator">');
                    $.each(data, function(k, val){
                        var newEvent = $('<div class="panel panel-default">' +
                                            '<div class="panel-heading" role="tab" id="event'+val.id+'">' +
                                                '<h4 class="panel-title">' +
                                                    '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse'+val.id+'" aria-expanded="false" aria-controls="collapse'+val.id+'">'+val.titre+'</a> ' +
                                                    '<span class="dots"><span class="text-'+val.couleur+'">.</span></span>'+
                                                '</h4> ' +
                                            '</div> ' +
                                            '<div id="collapse'+val.id+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="event'+val.id+'">' +
                                                '<div class="panel-body">'+val.description+'</div> ' +
                                                '<div class="panel-footer">'+
                                                    '<button class="btn btn-danger btn-sm deleteEvent" data-id="'+val.id+'"><i class="fa fa-remove"></i> Supprimer</button> '+
                                                    '<button class="btn btn-info btn-sm editEvent" data-id="'+val.id+'"><i class="fa fa-pencil"></i> Modifier</button>'+
                                                '</div>'+
                                            '</div> ' +
                                        '</div>')
                        $('#accordion').append(newEvent);
                    })
                }
                else
                {
                    $('#accordion').append('<hr class="separator"><h4 class="text-center">Pas d\'évènements ce jour</h4>')
                }
                $('#accordion').append('<div class="row text-center"><h4 class="addEvent"><i class="fa fa-plus-circle fa-2x" style="cursor: pointer;"></i></h4></div>');

        }).fail(function(data){
            $('#accordion').html('<div class="row text-center text-danger"><i class="fa fa-warning fa-3x"></i></div><div class="row"><h4 class="col-md-12">Une erreur est survenue pendant le chargement des événements</h4></div>');

        });
    }
    $('#accordion').animateCss('fadeIn');

});

/**
 * Evenement
 * Appuie sur Supprimer
 * Lance la modal deleteModal
 */
$("#accordion").on('click', '.deleteEvent', function(e){
    $("#deleteTitle").html("Supprimer '"+$("#event"+ $(e.target).data("id") +" a").html()+"'");
    $("#deleteBtn").data("id", $(e.target).data("id"));

    $('#deleteModal').modal('show');
});

/**
 * Evenement
 * on active le bouton 'Enregistrer' dès que l'on modifie un champs dans la modal
 */
$("#editModal input, #editModal textarea, #editModal select").on("change paste keyup", function() {

    $("#editModal #saveBtn").attr('disabled', false);

});

/**
 * Evenement
 * Appuie sur Modifier
 * Init inputs/errorLabels
 * Lance la modal editModal
 */
$("#accordion").on('click', '.editEvent', function(e){
    var id = $(e.target).data("id");
    $('#editcouleur').val($(".dots span", $("#event"+ $(e.target).data("id"))).attr('class').substr(5)).trigger('change');
    $("#editTitleModal").html("Modifier '"+$("#event"+ $(e.target).data("id") +" a").html()+"'");
    $("#saveBtn").attr("data-id", id);

    $('#editModal input').each(function(){
        $('*.form-group').removeClass('has-error').removeClass('has-success');
        $('*.form-control').val("");
        $('*.error').html('');
    });

    $('#editModal #editdate').datepicker('update', new Date(getYear(), getMonth()-1, $(".current .date").html()));
    $("#editModal #edittitre").val($("#event"+id+" a").html());
    $("#editModal #editdescription").val($("#collapse"+id+" .panel-body").html());
    $("#editModal #edittitre").trigger('change');
    $("#editModal #saveBtn").prop('disabled', true);

    $('#editModal').modal('show');
});

/**
 * Evenement
 * Appuie sur 'Ajouter un événement'
 * Si une date est sélectionnée il remplit le champs
 */
$('body').on('click', '.addEvent', function(e){
    $("#editTitleModal").html("Ajouter un évènement");
    $("#saveBtn").removeAttr("data-id");

    $('#editcouleur').val('primary').trigger('change');
    $('#editModal input').each(function(){
        $('*.form-group').removeClass('has-error').removeClass('has-success');
        $('*.form-control').val("");
        $('*.error').html('');
    });

    if($(".current").length > 0)
        $('#editModal #editdate').datepicker('update', new Date(getYear(), getMonth()-1, $(".current .date").html()));
    $("#editModal #saveBtn").prop('disabled', true);

    $('#editModal').modal('show');
});

/**
 * Evenement
 * Appuie sur Enregistrer de la editModal
 * Détermine si c'est un nouvelle event ou une modification
 */
$('#saveBtn').click(function(e){
    if(!isNaN($(e.target).attr("data-id"))){
        $.ajax({
            type: "POST",
            url: 'server/editEvent.php',
            data: {
                id:$(e.target).attr("data-id"),
                titre:$("#editModal #edittitre").val(),
                description:$("#editModal #editdescription").val(),
                couleur:$("#editModal #editcouleur").val(),
                date:$("#editModal #editdate").val()
            }
        })

            .done(function(data){
                if(data != true)
                {
                    $('#editModal input').each(function(){
                        $('*.form-group').removeClass('has-error').addClass('has-success');
                        $('*.error').html('');
                    });
                    $.each(data,function(index, value){
                        $("#editModal #edit"+index).parent().addClass('has-error');
                        $("#editModal #edit"+index +' ~ .error').html(value);
                        $("#editModal #edit"+index).animateCss("shake");
                    });
                }
                else {
                    $('#editModal').modal('hide');
                    setMonth($("#editModal #editdate").val().substr(3,2));
                    setYear($("#editModal #editdate").val().substr(6, 4));

                    refreshCalendar().done(function(){
                        setTimeout(function(){selectDate($("#editModal #editdate").val().substr(0, 2))}, 1000);
                    });
                }
            });
    }
    else
    {
        $.ajax({
            type: "POST",
            url: 'server/addEvent.php',
            data: {
                titre:$("#editModal #edittitre").val(),
                description:$("#editModal #editdescription").val(),
                couleur:$("#editModal #editcouleur").val(),
                date:$("#editModal #editdate").val()
            }
        })

            .done(function(data){
                if(data != true)
                {
                    $('#editModal input').each(function(){
                        $('*.form-group').removeClass('has-error').addClass('has-success');
                        $('*.error').html('');
                    });
                    $.each(data,function(index, value){
                        $("#editModal #edit"+index).parent().addClass('has-error');
                        $("#editModal #edit"+index +' ~ .error').html(value);
                        $("#editModal #edit"+index).animateCss("shake");
                    });
                }
                else {
                    $('#editModal').modal('hide');
                    setMonth($("#editModal #editdate").val().substr(3,2));
                    setYear($("#editModal #editdate").val().substr(6, 4));

                    refreshCalendar().done(function(){
                        setTimeout(function(){selectDate($("#editModal #editdate").val().substr(0, 2))}, 1000);
                    });
                }
            });
    }

});

/**
 * Permet de simuler le click sur une des cases
 * @param n la date à selectionner
 */
function selectDate(n)
{
    $('[data-date="'+ parseInt(n) +'"]').click();
}

/**
 * Evenement
 * Appuie sur Supprimer de la deleteModal
 */
$("#deleteBtn").click(function(){
    var cur =$(".current .date").html();

    $.post("server/delete.php",
    {
        id: $("#deleteBtn").data('id'),
    },
    function(data, status){
        $('#deleteModal').modal('hide');
        setYear(getYear());
        setMonth(getMonth());
        refreshCalendar().done(function(){setTimeout(function(){selectDate(cur);}, 1000)});
    });
});

/**
 * Evenement
 * Gère les touches du clavier
 * Haut/Bas change l'année
 * Gauche/Droite change le mois
 */
$(document).keydown(function(e) {
    if(!($("#editModal").data('bs.modal') || {}).isShown) { //Check si la modal est ouverte
        switch (e.which) {
            case 37: // <-
                previousMonth();
                break;
            case 38:
                setYear(getYear() + 1);
                refreshCalendar();
                break;
            case 39: // ->
                nextMonth();
                break;
            case 40:
                setYear(getYear() - 1);
                refreshCalendar();
                break;

            default:
                return;
        }
        e.preventDefault();
    }
});
/**
 * Configure le calendrier pour afficher la date d'aujourd'hui
 */
function today()
{
    var d = new Date();
    oldMonth = d.getMonth();
    oldYear = d.getFullYear();
    setMonth(d.getMonth()+1);
    setYear(d.getFullYear());
    refreshCalendar().done(function(){setTimeout(function(){selectDate(d.getDate());}, 1000)});

}
/**
 * Gère le changement au mois suivant
 */
function nextMonth()
{
    if(getMonth() == 12)
    {
        setMonth(1);
        setYear(getYear() + 1);
    }
    else
    {
        setMonth((getMonth()+1));
    }
    refreshCalendar();

}
/**
 * Gère le changement au mois précédent
 */
function previousMonth()
{
    if(getMonth() == 1)
    {
        setMonth(12);
        setYear(getYear() - 1);
    }
    else
    {
        setMonth(getMonth()-1);
    }
    refreshCalendar();

}
/**
 * Getter
 * @returns {Number} l'année
 */
function getYear()
{
    return parseInt($('#dropYear').html());
}
/**
 * Getter
 * @returns {*|jQuery} le numéro du mois
 */
function getMonth()
{
    return $("#months .active a").data('month');
}
/**
 * Setter
 * @param year : l'année à mettre
 */
function setYear(year)
{
    oldYear =  getYear();

    $('#dropYear').html(year);
    $('#years .active ').removeClass('active');

    $($('#years [data-year='+ year +']').parent()).addClass('active');

}
/**
 * Setter
 * @param element : le numéro du mois
 */
function setMonth(element)
{
    oldMonth = getMonth();
    oldYear =  getYear();
    element = parseInt(element);
    $('#months .active ').removeClass('active');
    $($('#months [data-month='+ element +']').parent()).addClass('active');
    $('#dropMonth').html(months[getMonth()-1]);

    //refreshCalendar();
}

/**
 * Demande le calendrier au serveur
 * Gère les animations
 * Gère l'affichage du calendrier
 * @returns {*} signale pour synchroniser les appels
 */
function refreshCalendar()
{
    var newMonth = getMonth();
    var newYear = getYear();
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var animationStart;
    var animationLast;
    var dateSelected = false;
    if($(".current").length > 0)
        dateSelected = true;

    if(newYear > oldYear) {
        animationStart = "fadeOutLeft";
        animationLast = "fadeInRight";
    }
    else if (newYear < oldYear) {
        animationStart= "fadeOutRight";
        animationLast = "fadeInLeft";
    }
    else
    {
        if(newMonth > oldMonth) {
            animationStart = "fadeOutLeft";
            animationLast = "fadeInRight";
        }
        else if (newMonth < oldMonth) {
            animationStart = "fadeOutRight";
            animationLast = "fadeInLeft";
        }
        else
        {
            animationStart = "fadeOut";
            animationLast = "fadeIn";
        }
    }

    $.ajax({
            url: "server/api.php?year="+newYear+"&month="+newMonth
        })
        .done(function( data ) {

            $('.cal').addClass('animated ' + animationStart).one(animationEnd, function() {
                $('.cal').removeClass('animated ' + animationStart);
                $("#weeks").html("");
                $('#calendar thead').html('<tr class="active"><th>LUN</th><th>MAR</th><th>MER</th><th>JEU</th><th>VEN</th><th>SAM</th><th>DIM</th></tr>');

                $.each(data, function(index, value)
                {
                    var newWeek = $("<tr></tr>").addClass("week").attr('id', index);
                    $.each(value, function(key, val)
                    {
                        var newCell = $("<td></td>");
                        if(val.currentMonth == false)
                            newCell.addClass('notCurrent');
                        else
                            newCell.attr('data-date', val.number);

                        var newDay = $("<div class=\"date\">"+val.number+"</div>");

                        newCell.append(newDay);
                        if(val.events.length > 0)
                        {
                            var dots = $("<div class=\"dots\"></div>")
                            for(var dot = 0; dot < val.events.length; dot++)
                            {
                                dots.append("<span class=\"text-"+val.events[dot].color+"\">.</span>");
                            }
                            newCell.append(dots)

                        }
                        if(val.today)
                            newDay.addClass('circle');

                        newWeek.append(newCell);
                    });
                    $("#weeks").append(newWeek);;

                });

                $('#mois').html(months[newMonth-1] + ' ' +getYear());
                $('.cal').animateCss(animationLast)
            });

            if(dateSelected)
                $('#accordion').html('<h5 class="text-center animated fadeIn">Aucune date sélectionnée</h5>');


        })
        .fail(function()
        {
            $('.cal').html('<div class="row text-center text-danger"><i class="fa fa-warning fa-3x"></i></div><div class="row"><h4 class="col-md-12 text-center">Une erreur est survenue pendant le chargement du calendrier</h4></div>');
        });
    return $.Deferred().resolve();
};
