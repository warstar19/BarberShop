<?php
$servername = "localhost"; // o 'localhost'
$username = "root";        // nombre de usuario correcto
$password = "";
$dbname = "barberiamvp";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["error" => "Conexión fallida: " . $e->getMessage()]);
    die();
}
?>
