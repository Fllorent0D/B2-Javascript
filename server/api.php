<?php
/**
 * Created by PhpStorm.
 * User: florentcardoen
 * Date: 13/04/16
 * Time: 16:08
 */
include 'calendar.class.php';

if( !(isset($_GET['month']) && isset($_GET['year'])) )
{
    http_response_code(401);
    die;
}
header('Content-Type: application/json');

if(isset($_GET['month']) && isset($_GET['year']))
{
    $month = $_GET['month'];
    $year = $_GET['year'];
    $events = [];
    try {
        $dbh = new PDO('mysql:host=localhost;dbname=javascriptlabo', "root", "");
        foreach($dbh->query('SELECT * from events') as $row) {
            array_push($events, ["id" => $row["id"], "date" => $row["date"], "title" => $row["titre"], 'color' => $row['couleur'], 'link' => '#']);
        }
        $dbh = null;
    } catch (PDOException $e) {
        print "Erreur : " . $e->getMessage() . "<br/>";
        die();
    }
    echo Calendar::drawCalendar($month, $year, $events);
}






?>
