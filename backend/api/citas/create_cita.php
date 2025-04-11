<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    $sql = "INSERT INTO citas (cliente_id, barbero_id, servicio_id, sucursal_id, fecha_inicio, fecha_fin, estado, notas, color_primario, color_secundario) VALUES (:cliente_id, :barbero_id, :servicio_id, :sucursal_id, :fecha_inicio, :fecha_fin, :estado, :notas, :color_primario, :color_secundario)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':cliente_id', $data->cliente_id);
    $stmt->bindParam(':barbero_id', $data->barbero_id);
    $stmt->bindParam(':servicio_id', $data->servicio_id);
    $stmt->bindParam(':sucursal_id', $data->sucursal_id);
    $stmt->bindParam(':fecha_inicio', $data->fecha_inicio);
    $stmt->bindParam(':fecha_fin', $data->fecha_fin);
    $stmt->bindParam(':estado', $data->estado);
    $stmt->bindParam(':notas', $data->notas);
    $stmt->bindParam(':color_primario', $data->color_primario);
    $stmt->bindParam(':color_secundario', $data->color_secundario);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Cita creada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear cita"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
