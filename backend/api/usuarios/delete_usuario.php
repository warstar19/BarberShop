<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de usuario inválido");
    }

    $sql = "UPDATE usuarios SET estado = 'inactivo' WHERE id = :id"; // Cambiar estado a "inactivo"
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Usuario desactivado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al desactivar usuario"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
