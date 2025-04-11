<?php
include '../cors.php';
include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por usuario_id
if (isset($_GET['usuario_id'])) {
    $whereClauses[] = "usuario_id = :usuario_id";
    $params[':usuario_id'] = $_GET['usuario_id'];
}

// Filtrado por tipo
if (isset($_GET['tipo'])) {
    $whereClauses[] = "tipo = :tipo";
    $params[':tipo'] = $_GET['tipo'];
}

// Filtrado por leida
if (isset($_GET['leida'])) {
    $whereClauses[] = "leida = :leida";
    $params[':leida'] = $_GET['leida'];
}

$sql = "SELECT * FROM notificaciones";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $notificaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notificaciones);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
