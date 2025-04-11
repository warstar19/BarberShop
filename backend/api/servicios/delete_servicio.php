<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de servicio inválido");
    }

    $sql = "UPDATE servicios SET activo = 0 WHERE id = :id"; // Cambiar activo a 0
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Servicio desactivado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al desactivar servicio"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
