<?php
include '../cors.php';
include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por servicio_id
if (isset($_GET['servicio_id'])) {
    $whereClauses[] = "servicio_id = :servicio_id";
    $params[':servicio_id'] = $_GET['servicio_id'];
}

// Filtrado por sucursal_id
if (isset($_GET['sucursal_id'])) {
    $whereClauses[] = "sucursal_id = :sucursal_id";
    $params[':sucursal_id'] = $_GET['sucursal_id'];
}

// Filtrado por disponible
if (isset($_GET['disponible'])) {
    $whereClauses[] = "disponible = :disponible";
    $params[':disponible'] = $_GET['disponible'];
}

$sql = "SELECT * FROM servicios_sucursal";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $servicios_sucursal = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($servicios_sucursal);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
