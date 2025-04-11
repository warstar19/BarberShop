<?php
include '../cors.php';
include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por cliente_id
if (isset($_GET['cliente_id'])) {
    $whereClauses[] = "cliente_id = :cliente_id";
    $params[':cliente_id'] = $_GET['cliente_id'];
}

// Filtrado por barbero_id
if (isset($_GET['barbero_id'])) {
    $whereClauses[] = "barbero_id = :barbero_id";
    $params[':barbero_id'] = $_GET['barbero_id'];
}

// Filtrado por fecha_inicio
if (isset($_GET['fecha_inicio'])) {
    $whereClauses[] = "fecha_inicio LIKE :fecha_inicio";
    $params[':fecha_inicio'] = '%' . $_GET['fecha_inicio'] . '%';
}

// Filtrado por estado
if (isset($_GET['estado'])) {
    $whereClauses[] = "estado = :estado";
    $params[':estado'] = $_GET['estado'];
}

$sql = "SELECT * FROM citas";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($citas);

$conn = null;
?>
