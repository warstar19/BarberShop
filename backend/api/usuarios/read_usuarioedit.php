<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrar por id (obtenido dinámicamente a través de los parámetros de la consulta)
if (isset($_GET['id'])) {
    $whereClauses[] = "id = :id";
    $params[':id'] = $_GET['id'];
} else {
    echo json_encode(["mensaje" => "ID no proporcionado."]);
    exit();
}

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

    // Si encontramos algún usuario, lo devolvemos
    if (!empty($usuarios)) {
        echo json_encode($usuarios[0]); // Devuelve el primer usuario encontrado
    } else {
        echo json_encode(["mensaje" => "Usuario no encontrado."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
