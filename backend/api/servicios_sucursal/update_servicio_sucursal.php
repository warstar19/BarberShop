<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_servicio_sucursal.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de servicio de sucursal inválido");
    }
    if (!isset($data->servicio_id) || !is_numeric($data->servicio_id) || $data->servicio_id <= 0) {
        throw new Exception("ID de servicio inválido");
    }
    if (!isset($data->sucursal_id) || !is_numeric($data->sucursal_id) || $data->sucursal_id <= 0) {
        throw new Exception("ID de sucursal inválido");
    }

    $sql = "UPDATE servicios_sucursal SET servicio_id = :servicio_id, sucursal_id = :sucursal_id, disponible = :disponible WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':servicio_id', $data->servicio_id);
    $stmt->bindParam(':sucursal_id', $data->sucursal_id);
    $stmt->bindParam(':disponible', $data->disponible);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Servicio de sucursal actualizado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar servicio de sucursal"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
