<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->servicio_id) || !is_numeric($data->servicio_id) || $data->servicio_id <= 0) {
        throw new Exception("ID de servicio inválido");
    }
    if (!isset($data->sucursal_id) || !is_numeric($data->sucursal_id) || $data->sucursal_id <= 0) {
        throw new Exception("ID de sucursal inválido");
    }

    $sql = "INSERT INTO servicios_sucursal (servicio_id, sucursal_id, disponible) VALUES (:servicio_id, :sucursal_id, :disponible)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':servicio_id', $data->servicio_id);
    $stmt->bindParam(':sucursal_id', $data->sucursal_id);
    $stmt->bindParam(':disponible', $data->disponible); // Puedes establecer disponible como 1 por defecto

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Servicio de sucursal creado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear servicio de sucursal"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
