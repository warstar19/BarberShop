<?php
include '../cors.php';
include '../conexion.php';

// Decodificar los datos recibidos
$data = json_decode(file_get_contents('php://input'), true);

// Simular que el cliente es el usuario con ID 4
$cliente_id = 4;

if (isset($data['barbero_id'], $data['servicio_id'], $data['sucursal_id'], $data['fecha_inicio'], $data['fecha_fin'], $data['estado'])) {
    // Preparar la consulta SQL
    $sql = "INSERT INTO citas (cliente_id, barbero_id, servicio_id, sucursal_id, fecha_inicio, fecha_fin, estado, notas, fecha_creacion, fecha_actualizacion)
            VALUES (:cliente_id, :barbero_id, :servicio_id, :sucursal_id, :fecha_inicio, :fecha_fin, :estado, :notas, NOW(), NOW())";

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':cliente_id', $cliente_id); // forzado a 4
        $stmt->bindParam(':barbero_id', $data['barbero_id']);
        $stmt->bindParam(':servicio_id', $data['servicio_id']);
        $stmt->bindParam(':sucursal_id', $data['sucursal_id']);
        $stmt->bindParam(':fecha_inicio', $data['fecha_inicio']);
        $stmt->bindParam(':fecha_fin', $data['fecha_fin']);
        $stmt->bindParam(':estado', $data['estado']);

        // Notas opcional
        $notas = isset($data['notas']) ? $data['notas'] : null;
        $stmt->bindParam(':notas', $notas);

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
