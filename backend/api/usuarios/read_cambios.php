<?php
include __DIR__ . '/../cors.php';  // Incluir manejo de CORS (si lo necesitas)
include __DIR__ . '/../conexion.php';  // Incluir la conexión a la base de datos

$whereClauses = [];
$params = [];

// Filtrado por tabla afectada (opcional)
if (isset($_GET['tabla_afectada'])) {
    $whereClauses[] = "tabla_afectada LIKE :tabla_afectada";
    $params[':tabla_afectada'] = '%' . $_GET['tabla_afectada'] . '%';
}

// Filtrado por registro_id (opcional)
if (isset($_GET['registro_id'])) {
    $whereClauses[] = "registro_id = :registro_id";
    $params[':registro_id'] = $_GET['registro_id'];
}

// Filtrado por tipo_cambio (opcional)
if (isset($_GET['tipo_cambio'])) {
    $whereClauses[] = "tipo_cambio = :tipo_cambio";
    $params[':tipo_cambio'] = $_GET['tipo_cambio'];
}

// Filtrado por usuario_id (opcional)
if (isset($_GET['usuario_id'])) {
    $whereClauses[] = "usuario_id = :usuario_id";
    $params[':usuario_id'] = $_GET['usuario_id'];
}

// Filtrado por fecha de cambio (opcional)
if (isset($_GET['fecha_inicio']) && isset($_GET['fecha_fin'])) {
    $whereClauses[] = "fecha_cambio BETWEEN :fecha_inicio AND :fecha_fin";
    $params[':fecha_inicio'] = $_GET['fecha_inicio'];
    $params[':fecha_fin'] = $_GET['fecha_fin'];
}

$sql = "SELECT * FROM registros_cambios";

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($registros)) {
        echo json_encode($registros);
    } else {
        echo json_encode(["mensaje" => "No se encontraron registros de cambios."]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
