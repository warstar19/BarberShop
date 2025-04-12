<?php
include '../cors.php';
include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por cliente_id
if (isset($_GET['cliente_id'])) {
    $whereClauses[] = "c.cliente_id = :cliente_id";
    $params[':cliente_id'] = $_GET['cliente_id'];
}

// Filtrado por barbero_id
if (isset($_GET['barbero_id'])) {
    $whereClauses[] = "c.barbero_id = :barbero_id";
    $params[':barbero_id'] = $_GET['barbero_id'];
}

// Filtrado por fecha_inicio
if (isset($_GET['fecha_inicio'])) {
    $whereClauses[] = "c.fecha_inicio LIKE :fecha_inicio";
    $params[':fecha_inicio'] = '%' . $_GET['fecha_inicio'] . '%';
}

// Filtrado por estado
if (isset($_GET['estado'])) {
    $whereClauses[] = "c.estado = :estado";
    $params[':estado'] = $_GET['estado'];
}

$sql = "SELECT
            c.*,
            u1.username AS cliente_nombre,
            u2.username AS barbero_nombre
        FROM citas c
        LEFT JOIN usuarios u1 ON c.cliente_id = u1.id
        LEFT JOIN usuarios u2 ON c.barbero_id = u2.id";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($citas);

$conn = null;
?>
