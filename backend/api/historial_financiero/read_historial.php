<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$whereClauses = [];
$params = [];

// Filtrado por cita_id
if (isset($_GET['cita_id'])) {
    $whereClauses[] = "cita_id = :cita_id";
    $params[':cita_id'] = $_GET['cita_id'];
}

// Filtrado por metodo_pago
if (isset($_GET['metodo_pago'])) {
    $whereClauses[] = "metodo_pago = :metodo_pago";
    $params[':metodo_pago'] = $_GET['metodo_pago'];
}

// Filtrado por estado_pago
if (isset($_GET['estado_pago'])) {
    $whereClauses[] = "estado_pago = :estado_pago";
    $params[':estado_pago'] = $_GET['estado_pago'];
}

// Filtrado por notas
if (isset($_GET['notas'])) {
    $whereClauses[] = "notas LIKE :notas";
    $params[':notas'] = '%' . $_GET['notas'] . '%';
}

// Filtrado por fecha_creacion
if (isset($_GET['fecha_creacion'])) {
    $whereClauses[] = "fecha_creacion LIKE :fecha_creacion";
    $params[':fecha_creacion'] = '%' . $_GET['fecha_creacion'] . '%';
}

$sql = "SELECT * FROM historial_financiero";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $historiales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($historiales);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
