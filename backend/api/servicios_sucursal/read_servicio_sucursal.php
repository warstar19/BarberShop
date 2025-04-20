<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por sucursal_id
if (isset($_GET['sucursal_id'])) {
    $whereClauses[] = "sucursal_id = :sucursal_id";
    $params[':sucursal_id'] = $_GET['sucursal_id'];
}

// Filtrado por disponible (opcional)
if (isset($_GET['disponible'])) {
    $whereClauses[] = "disponible = :disponible";
    $params[':disponible'] = $_GET['disponible'];
}

$sql = "SELECT * FROM servicios_sucursal WHERE " . implode(" AND ", $whereClauses);

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $servicios_sucursal = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Si hay resultados, obtenemos los detalles completos de los servicios
    if (count($servicios_sucursal) > 0) {
        $servicioIds = array_map(function ($item) {
            return $item['servicio_id'];
        }, $servicios_sucursal);

        $placeholders = implode(",", array_fill(0, count($servicioIds), "?"));
        $sqlServicios = "SELECT * FROM servicios WHERE id IN ($placeholders)";

        $stmtServicios = $conn->prepare($sqlServicios);
        $stmtServicios->execute($servicioIds);
        $servicios = $stmtServicios->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($servicios);
    } else {
        echo json_encode([]); // No hay servicios disponibles
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
