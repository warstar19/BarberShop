<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    $sql = "UPDATE citas SET estado = 'cancelada' WHERE id = :id"; // Cambiar estado a 'cancelada'
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Cita cancelada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al cancelar cita"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
