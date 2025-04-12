<?php
include __DIR__ . '/../cors.php';
include __DIR__ . '/../conexion.php';

$whereClauses = [];
$params = [];

// Leer solo el admin con id = 1 (simulando el admin activo)
$whereClauses[] = "id = :id";
$params[':id'] = 1;

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

    // Si encontramos algún usuario, devolvemos el primero (que debería ser el admin con id = 1)
    if (!empty($usuarios)) {
        echo json_encode($usuarios[0]); // Devuelve solo el primer usuario (admin)
    } else {
        echo json_encode(["mensaje" => "Admin no encontrado."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
