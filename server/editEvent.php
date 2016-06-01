<?php
/*if($_SERVER["REQUEST_METHOD"] != "POST")
{
   http_response_code(401);
    die;
}*/
header('Content-Type: application/json');

$error = array();
if(empty($_POST['id']))
{
    http_response_code(401);
    die();
}
if(empty($_POST['titre']))
{
    $error["titre"] = "Vous devez renseigner un titre";
}
if(empty($_POST['description']))
{
    $error["description"] = "Vous devez renseigner une description";
}
if(empty($_POST['date']))
{
    $error["date"] = "Vous devez renseigner une date";
}else
 {
     $date = DateTime::createFromFormat('d/m/Y',$_POST['date']); //Factory wouuuu :D
     if(!$date)
     {
         $error["date"] = "Veuillez rentrer une date valide";
     }
 }
if(empty($_POST['couleur']))
{
    $error["couleur"] = "Vous devez renseigner une couleur";
}


if(empty($error))
{
    $id = htmlentities($_POST['id']);
    $titre = htmlentities($_POST['titre']);
    $description = htmlentities($_POST['description']);
    $couleur = $_POST['couleur'];

    try {
        $dbh = new PDO('mysql:host=localhost;dbname=javascriptlabo', "root", "root");
        $query = $dbh->prepare('UPDATE events set titre = ?, description = ? , couleur = ?, date = ? where id = ?');
        $query->execute([$titre, $description, $couleur, $date->format('Y-m-d'),$id]);
        $dbh = null;

        echo json_encode(true);

    } catch (PDOException $e) {
        echo json_encode(["Error" =>$e->getMessage()]);
    }
    http_response_code(200);
    die();
    //echo Calendar::drawCalendar($month, $year, $events);
}
else
{
    echo json_encode($error);
}

?>