<?php
session_start();
include '../includes.php';
//include '../cors.php';

error_log("Llegando read_usuario.php"); // Debugging temporal


$whereClauses = [];
$params = [];

// Obtener el ID del usuario desde la sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "No autorizado"]);
    exit;
}


// Usar el ID del usuario logueado
$whereClauses[] = "id = :id";
$params[':id'] = $_SESSION['user_id'];


error_log("SESION: " . print_r($_SESSION, true));


// Filtrado por username (opcional)
if (isset($_GET['username'])) {
    $whereClauses[] = "username LIKE :username";
    $params[':username'] = '%' . $_GET['username'] . '%';
}

// Filtrado por email (opcional)
if (isset($_GET['email'])) {
    $whereClauses[] = "email = :email";
    $params[':email'] = $_GET['email'];
}

// Filtrado por rol (opcional)
if (isset($_GET['rol'])) {
    $whereClauses[] = "rol = :rol";
    $params[':rol'] = $_GET['rol'];
}

// Filtrado por estado (opcional)
if (isset($_GET['estado'])) {
    $whereClauses[] = "estado = :estado";
    $params[':estado'] = $_GET['estado'];
}

$sql = "SELECT * FROM usuarios";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Usuarios encontrados: " . print_r($usuarios, true)); // Debugging temporal
    // Si encontramos algún usuario, devolvemos el primero (que debería ser el admin con id = 1)
    if (!empty($usuarios)) {
        echo json_encode($usuarios[0]); // Devuelve solo el usuario logueado
    } else {
        echo json_encode(["mensaje" => "Admin no encontrado."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
