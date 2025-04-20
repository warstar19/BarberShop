<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_historial.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de historial inválido");
    }
    if (!isset($data->cita_id) || !is_numeric($data->cita_id) || $data->cita_id <= 0) {
        throw new Exception("ID de cita inválido");
    }
    if (!isset($data->monto) || !is_numeric($data->monto) || $data->monto <= 0) {
        throw new Exception("Monto inválido");
    }
    if (!isset($data->metodo_pago) || !in_array($data->metodo_pago, ['efectivo', 'tarjeta', 'transferencia'])) {
        throw new Exception("Método de pago inválido");
    }
    if (isset($data->estado_pago) && !in_array($data->estado_pago, ['pendiente', 'completado', 'reembolsado'])) {
        throw new Exception("Estado de pago inválido");
    }

    $sql = "UPDATE historial_financiero SET cita_id = :cita_id, monto = :monto, metodo_pago = :metodo_pago, estado_pago = :estado_pago, notas = :notas WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':cita_id', $data->cita_id);
    $stmt->bindParam(':monto', $data->monto);
    $stmt->bindParam(':metodo_pago', $data->metodo_pago);
    $stmt->bindParam(':estado_pago', $data->estado_pago);
    $stmt->bindParam(':notas', $data->notas);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Historial financiero actualizado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar historial financiero"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
