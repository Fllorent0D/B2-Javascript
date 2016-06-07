<?php
/**
 * Created by PhpStorm.
 * User: florentcardoen
 * Date: 13/04/16
 * Time: 16:08
 */

if( !(isset($_GET['year'])) && !isset($_GET['month']) && !isset($_GET['day'])  )
{
    http_response_code(401);
    die;
}


    try {

        $year = $_GET['year'];
        $month = $_GET['month'];
        $day = $_GET['day'];

        $dbh = new PDO('mysql:host=localhost;dbname=javascriptlabo', "root", "fca-1995");
        $ldate = $year . '-'.str_pad($month, 2, 0, STR_PAD_LEFT) .'-'.str_pad($day, 2, 0, STR_PAD_LEFT);

        $query = $dbh->prepare('SELECT * FROM events WHERE date = ?');
        $query->execute([$ldate]);

        $result = $query->fetchAll(PDO::FETCH_OBJ);

        header('Content-Type: application/json');
        echo json_encode(($result));

    } catch (PDOException $e) {
        print "Erreur : " . $e->getMessage() . "<br/>";
        http_response_code(500);

        die();
    }







?>
