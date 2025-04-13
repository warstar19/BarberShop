<?php
include '../cors.php';
include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por barbero (usuario_id)
if (isset($_GET['usuario_id'])) {
    $whereClauses[] = "barbero_id = :usuario_id";
    $params[':usuario_id'] = $_GET['usuario_id'];
}

// Filtrado por tipo de cambio (servicio)
if (isset($_GET['tipo'])) {
    $whereClauses[] = "servicio = :tipo";
    $params[':tipo'] = $_GET['tipo'];
}

// Filtrado por estado de lectura (leida)
if (isset($_GET['leida'])) {
    $whereClauses[] = "leida = :leida";
    $params[':leida'] = $_GET['leida'];
}

$sql = "SELECT * FROM notificacion"; // Se cambia a la vista notificacion

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
