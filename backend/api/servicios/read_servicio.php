<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por nombre
if (isset($_GET['nombre'])) {
    $whereClauses[] = "nombre LIKE :nombre";
    $params[':nombre'] = '%' . $_GET['nombre'] . '%';
}

// Filtrado por precio
if (isset($_GET['precio'])) {
    $whereClauses[] = "precio = :precio";
    $params[':precio'] = $_GET['precio'];
}

// Filtrado por activo
if (isset($_GET['activo'])) {
    $whereClauses[] = "activo = :activo";
    $params[':activo'] = $_GET['activo'];
}

$sql = "SELECT * FROM servicios";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($servicios);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
