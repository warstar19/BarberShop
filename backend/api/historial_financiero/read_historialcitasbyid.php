<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por cliente (opcional)
if (isset($_GET['cliente'])) {
    $whereClauses[] = "cliente LIKE :cliente";
    $params[':cliente'] = '%' . $_GET['cliente'] . '%';
}

// Filtrado por barbero (opcional)
if (isset($_GET['barbero'])) {
    $whereClauses[] = "barbero LIKE :barbero";
    $params[':barbero'] = '%' . $_GET['barbero'] . '%';
}

// Filtrado por sucursal (opcional)
if (isset($_GET['sucursal'])) {
    $whereClauses[] = "sucursal LIKE :sucursal";
    $params[':sucursal'] = '%' . $_GET['sucursal'] . '%';
}

// Filtrado por servicio (opcional)
if (isset($_GET['servicio'])) {
    $whereClauses[] = "servicio LIKE :servicio";
    $params[':servicio'] = '%' . $_GET['servicio'] . '%';
}

// Filtrado por fecha de las citas (opcional)
if (isset($_GET['fecha_inicio']) && isset($_GET['fecha_fin'])) {
    $whereClauses[] = "fecha BETWEEN :fecha_inicio AND :fecha_fin";
    $params[':fecha_inicio'] = $_GET['fecha_inicio'];
    $params[':fecha_fin'] = $_GET['fecha_fin'];
}

$sql = "SELECT * FROM vista_citas_completadas_canceladas";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($citas)) {
        echo json_encode($citas);
    } else {
        echo json_encode(["mensaje" => "No se encontraron citas completadas o canceladas."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
