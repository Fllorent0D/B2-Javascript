<?php
/**
 * Created by PhpStorm.
 * User: Floca
 * Date: 11/07/15
 * Time: 20:27
 */

class Calendar {

    static function drawCalendar($month, $year, $event = [])
    {

        $curday = date("d");
        $curmonth = date("m");
        $curyear = date("Y");
        $days = cal_days_in_month(CAL_GREGORIAN,$month,$year);  // Nombre de jours
        $lastmonth = date("t", mktime(0,0,0,$month-1,1,$year)); // Les derniers jours du mois avant
        $start = date("N", mktime(0,0,0,$month,1,$year));       // Début du mois demandé
        $finish = date("N", mktime(0,0,0,$month,$days,$year));  // Dernier jour du mois
        $laststart = $start - 1;

        $counter = 1;
        $nextMonthCounter = 1;

        if($start > 5)
            $rows = 6;
        else
            $rows = 5;

        $tab = array();

        for($i = 1; $i <= $rows; $i++)
        {
            $tab["week".$i] = array();
            for($x = 1; $x <= 7; $x++)
            {
                $active = true;
                $today = false;
                $eventDate = [];

                if(($counter - $start) < 0)
                {
                    $date = ($lastmonth - $laststart) + $counter;
                    $active = false;
                }
                else if(($counter - $start) >= $days)
                {
                    $date = $nextMonthCounter;
                    $nextMonthCounter++;
                    $active = false;
                }
                else
                {
                    $date = $counter - $start + 1;

                    if($curday == $date && $curmonth == $month && $curyear == $year)
                        $today = true;


                    $ldate = $year . '-'.str_pad($month, 2, 0, STR_PAD_LEFT) .'-'.str_pad($date, 2, 0, STR_PAD_LEFT);
                    foreach ($event as $key => $val)
                    {
                        if ($val['date'] == $ldate)
                        {
                            array_push($eventDate, $val);
                        }
                    }

                }
                $tab["week".$i][$x] = array("number" => $date,"currentMonth" => $active,"today" => $today, "events" => $eventDate);

                $counter++;
            }
        }

        echo json_encode($tab);

    }

}

