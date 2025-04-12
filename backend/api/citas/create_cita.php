<?php
include '../cors.php';
include '../conexion.php';

// Verificar que se reciban los datos de la cita
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['cliente_id'], $data['barbero_id'], $data['servicio_id'], $data['sucursal_id'], $data['fecha_inicio'], $data['fecha_fin'], $data['estado'])) {
    // Preparar la consulta SQL
    $sql = "INSERT INTO citas (cliente_id, barbero_id, servicio_id, sucursal_id, fecha_inicio, fecha_fin, estado, notas, fecha_creacion, fecha_actualizacion)
            VALUES (:cliente_id, :barbero_id, :servicio_id, :sucursal_id, :fecha_inicio, :fecha_fin, :estado, :notas, NOW(), NOW())";

    try {
        // Preparar y ejecutar la consulta
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':cliente_id', $data['cliente_id']);
        $stmt->bindParam(':barbero_id', $data['barbero_id']);
        $stmt->bindParam(':servicio_id', $data['servicio_id']);
        $stmt->bindParam(':sucursal_id', $data['sucursal_id']);
        $stmt->bindParam(':fecha_inicio', $data['fecha_inicio']);
        $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
        $stmt->bindParam(':estado', $data['estado']);
        $stmt->bindParam(':notas', $data['notas']);

        $stmt->execute();

        echo json_encode(['message' => 'Cita creada con éxito']);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Faltan datos requeridos']);
}

$conn = null;
?>
