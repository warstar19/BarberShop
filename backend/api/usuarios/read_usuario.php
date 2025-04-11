<?php
include __DIR__ . '/../cors.php';
include __DIR__ . '/../conexion.php';


$whereClauses = [];
$params = [];

// Filtrado por username
if (isset($_GET['username'])) {
    $whereClauses[] = "username LIKE :username";
    $params[':username'] = '%' . $_GET['username'] . '%';
}

// Filtrado por email
if (isset($_GET['email'])) {
    $whereClauses[] = "email = :email";
    $params[':email'] = $_GET['email'];
}

// Filtrado por rol
if (isset($_GET['rol'])) {
    $whereClauses[] = "rol = :rol";
    $params[':rol'] = $_GET['rol'];
}

// Filtrado por estado
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

    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
