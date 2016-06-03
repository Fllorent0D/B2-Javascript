months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre','Décembre'];
var oldMonth;
var oldYear;

function formatPicker (state) {
    var $state = $('<span class="dots"><span class="text-'+state.id+'">.</span><span class="text"> '+state.text+'</span></span>');
    return $state;
}
$(function(){
    for(var i = 1; i <= 12; i++)
        $('#months').append('<li><a href="#" data-month="'+i+'">'+ months[i-1] +'</a></li>');
        //$('#months').append('<a href="#" class="btn btn-default btn-group-sm month" data-month="'+i+'">'+ months[i-1] +'</a>');
    for (i = new Date().getFullYear() + 10; i > 1900; i--)
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
        orientation: "bottom left"
    });

    refreshCalendar();

});

$('#months').on('click', 'a',function() {
    setMonth($(this).data('month'));
    refreshCalendar()
});
$('#years').on('click', 'a',function() {
    setYear($(this).data('year'));
    refreshCalendar()
});
$('#next').click(function(){
    nextMonth();
    //setYear(getYear() + 1 );
});
$('#previous').click(function(){
    previousMonth();
   // setYear(getYear() - 1 );
});
$('#today').click(function(){today();});
$('.calendar').on('click','td', function(){
    var datadate = $(this).data('date');

    if(datadate == null)
    {
        var date = $('.date', this).html();

        if(date < 15)
            nextMonth();
        else
            previousMonth();
    }
    else
    {
        var month = getMonth();
        var year = getYear();
        var day = datadate;
        if($('.current').length)
            $('.current').removeClass('current');
        $(this).addClass('current');
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
                                                    '<button class="btn btn-danger btn-sm deleteEvent" data-id="'+val.id+'">Supprimer</button> '+
                                                    '<button class="btn btn-info btn-sm editEvent" data-id="'+val.id+'">Modifier</button>'+
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

                $('#accordion').animateCss('fadeIn');

        });
    }
});
$("#accordion").on('click', '.deleteEvent', function(e){
    $("#deleteTitle").html("Supprimer '"+$("#event"+ $(e.target).data("id") +" a").html()+"'");
    $("#deleteBtn").data("id", $(e.target).data("id"));

    $('#deleteModal').modal('show');
});
$("#editModal input, #editModal textarea, #editModal select").on("change paste keyup", function() {
    var empty = 1;

    $.each($("*#editModal input, #editModal textarea, #editModal select"), function(index, value){
        if($(value).val().length== 0 && empty)
           empty = 0;
    });
    if(empty)
        $("#editModal #saveBtn").attr('disabled', false);
    else
        $("#editModal #saveBtn").attr('disabled', true);

});
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

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
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
function selectDate(n)
{
    $('[data-date="'+ parseInt(n) +'"]').click();
}
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
$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // <-
            previousMonth();
            break;

        case 39: // ->
            nextMonth();
            break;

        default: return;
    }
    e.preventDefault();
});

function today()
{
    var d = new Date();
    oldMonth = d.getMonth();
    oldYear = d.getFullYear();
    setMonth(d.getMonth()+1);
    setYear(d.getFullYear());
    refreshCalendar();
}
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

function getYear()
{
    return parseInt($('#dropYear').html());
}
function getMonth()
{
    return $("#months .active a").data('month');
}
function setYear(year)
{
    oldYear =  getYear();

    $('#dropYear').html(year);
    $('#years .active ').removeClass('active');

    $($('#years [data-year='+ year +']').parent()).addClass('active');

}
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
function refreshCalendar()
{
    var newMonth = getMonth();
    var newYear = getYear();
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var animationStart;
    var animationLast;

    $('#accordion').html('<h4 class="text-center animated fadeIn">Aucune date sélectionnée</h4>')
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
            $('#accordion').html('<h5 class="text-center animated fadeIn">Aucune date sélectionnée</h5>');


        });
    return $.Deferred().resolve();
};
