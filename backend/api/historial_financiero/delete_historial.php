<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de historial inválido");
    }

    $sql = "DELETE FROM historial_financiero WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Historial financiero eliminado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al eliminar historial financiero"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
