<?php

if( !(isset($_POST['id'])) )
{
    http_response_code(401);
    die;
}

    $id = $_POST['id'];

    try {

        $dbh = new PDO('mysql:host=localhost;dbname=javascriptlabo', "root", "fca-1995");

        $query = $dbh->prepare('DELETE FROM events WHERE id = ?');
        $query->execute([$id]);

        $result = $query->rowCount();

        header('Content-Type: application/json');
        echo json_encode(($result));

    } catch (PDOException $e) {
        print "Erreur : " . $e->getMessage() . "<br/>";
        http_response_code(500);

        die();
    }







?>