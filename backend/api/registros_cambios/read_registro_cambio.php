<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por tabla_afectada
if (isset($_GET['tabla_afectada'])) {
    $whereClauses[] = "tabla_afectada = :tabla_afectada";
    $params[':tabla_afectada'] = $_GET['tabla_afectada'];
}

// Filtrado por usuario_id
if (isset($_GET['usuario_id'])) {
    $whereClauses[] = "usuario_id = :usuario_id";
    $params[':usuario_id'] = $_GET['usuario_id'];
}

// Filtrado por tipo_cambio
if (isset($_GET['tipo_cambio'])) {
    $whereClauses[] = "tipo_cambio = :tipo_cambio";
    $params[':tipo_cambio'] = $_GET['tipo_cambio'];
}

$sql = "SELECT * FROM registros_cambios";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($registros);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
