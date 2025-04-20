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

// Filtrado por telefono
if (isset($_GET['telefono'])) {
    $whereClauses[] = "telefono LIKE :telefono";
    $params[':telefono'] = '%' . $_GET['telefono'] . '%';
}

// Filtrado por activa
if (isset($_GET['activa'])) {
    $whereClauses[] = "activa = :activa";
    $params[':activa'] = $_GET['activa'];
}

$sql = "SELECT * FROM sucursales";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($sucursales);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
