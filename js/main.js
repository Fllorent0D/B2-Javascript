months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre','Décembre'];
oldMonth = "";
oldYear = "";

$(function(){
    for(var i = 1; i <= 12; i++)
        $('#months').append('<a href="#" class="btn btn-default btn-group-sm month" data-month="'+i+'">'+ months[i-1] +'</a>');

    today();
});

$('#months').on('click', '.month',function() {
    setMonth($(this));
});
$('#next').click(function(){
    setYear(parseInt($('#year').html()) + 1 );
});
$('#previous').click(function(){
    setYear(parseInt($('#year').html()) - 1 );
});
$('#today').click(function(){today();});
$('.calendar').on('click','td', function(){
    var datadate = $(this).data('date');

    if(datadate == null)
    {
        var date = $('span', this).html();

        if(date < 15)
            nextMonth();
        else
            previousMonth();
    }
    else
    {
        var month = $("#months .active").data('month');
        var year = $('#year').html();
        var day = datadate;
        $('#calendar span.badge-success').removeClass('badge badge-success');
        $('span', this).addClass('badge badge-success');
        $.ajax({
            url: "server/event.php?year="+year+"&month="+month+"&day="+day

        }).done(function( data ) {
            $('#accordion').html("");
            if(data.length > 0)
            {
                $('#accordion').append('<h4 class="text-center">'+ data.length + ' évènements - '+day+'/'+month+'/'+year+'</h4>');
                $.each(data, function(k, val){
                    var newEvent = $('<div class="panel panel-default animated fadeIn"><div class="panel-heading" role="tab" id="event'+val.id+'"><h4 class="panel-title"><a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse'+val.id+'" aria-expanded="false" aria-controls="collapse'+val.id+'">'+val.titre+'</a> </h4> </div> <div id="collapse'+val.id+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="event'+val.id+'"> <div class="panel-body">'+val.description+'</div> </div> </div>')
                    $('#accordion').append(newEvent);
                })
            }
            else
            {
                $('#accordion').append('<h4 class="text-center animated fadeIn">Pas d\'évènements ce jour - '+day+'/'+month+'/'+year+'</h4>')
            }

        });
    }
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
    $('#months .active').removeClass('active');
    oldMonth = d.getMonth();
    oldYear = d.getFullYear();
    $('[data-month='+ (d.getMonth()+1)+']').addClass('active');
    $('#year').html(d.getFullYear());

    refreshCalendar();

}
function nextMonth()
{
    if($("#months .active").data('month') == 12)
    {
        oldMonth = $("#months .active").data('month');
        $('#months .active').removeClass('active');
        $('[data-month=1]').addClass('active');
        setYear(parseInt($('#year').html()) + 1);
    }
    else
    {
        setMonth($("[data-month="+($("#months .active").data('month')+1)+"]"));
    }
}
function previousMonth()
{
    if($("#months .active").data('month') == 1)
    {
        oldMonth = $("#months .active").data('month');
        $('#months .active').removeClass('active');
        $('[data-month=12]').addClass('active');
        setYear(parseInt($('#year').html()) - 1);
    }
    else
    {
        setMonth($("[data-month="+($("#months .active").data('month')-1)+"]"));
    }
}


function setYear(year)
{
    oldYear =  $('#year').html();

    $('#year').html(year);
    refreshCalendar();
}
function setMonth(element)
{

    oldMonth = $("#months .active").data('month');
    oldYear =  $('#year').html();

    $('#months .active').removeClass('active');
    $(element).addClass('active');
    refreshCalendar();
}
function refreshCalendar()
{
    var newMonth = $("#months .active").data('month');
    var newYear =  $('#year').html();
    var animationStart;
    var animationEnd;
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
        else {
            return;
        }
    }

    var month = $('#months .active').data('month');
    var year = $('#year').html();
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    $.ajax({
            url: "server/api.php?year="+year+"&month="+month
        })
        .done(function( data ) {
            $('.cal').addClass('animated ' + animationStart).one(animationEnd, function() {
                $('.cal').removeClass('animated ' + animationStart);
                $("#weeks").html("");
                $('#calendar thead').html('<tr><th>Lun.</th><th>Mar.</th><th>Mer.</th><th>Jeu.</th><th>Ven.</th><th>Sam.</th><th>Dim.</th></tr>');

                $.each(data, function(index, value)
                {
                    var newWeek = $("<tr></tr>").addClass("week").attr('id', index);
                    $.each(value, function(key, val)
                    {
                        var newCell = $("<td></td>");

                        if(val.currentMonth == false)
                            newCell.addClass('active');
                        else
                            newCell.attr('data-date', val.number);

                        var newDay = $("<span>"+val.number+"</span>");
                        newCell.append(newDay);

                        if(val.today)
                            newDay.addClass('badge badge-default');
                        if(val.events.length > 0)
                        {
                            newCell.append("<div class=\"label label-success event\">"+val.events.length+" évènements</div>");
                        }
                        newWeek.append(newCell);
                    });
                    $("#weeks").append(newWeek);;

                });
                //$('.calendar').html(data);
                $('#mois').html(months[month-1] + ' ' +year);
                $('.cal').animateCss(animationLast)});
            $('#accordion').html('<h4 class="text-center animated fadeIn">Aucune date sélectionnée</h4>')

        });
};
