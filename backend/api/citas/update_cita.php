<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    $sql = "UPDATE citas SET cliente_id = :cliente_id, barbero_id = :barbero_id, servicio_id = :servicio_id, sucursal_id = :sucursal_id, fecha_inicio = :fecha_inicio, fecha_fin = :fecha_fin, estado = :estado, notas = :notas, color_primario = :color_primario, color_secundario = :color_secundario WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
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
        echo json_encode(["mensaje" => "Cita actualizada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar cita"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
