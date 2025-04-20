<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_notificacion.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de notificación inválido");
    }
    if (!isset($data->usuario_id) || !is_numeric($data->usuario_id) || $data->usuario_id <= 0) {
        throw new Exception("ID de usuario inválido");
    }
    if (!isset($data->titulo) || empty($data->titulo)) {
        throw new Exception("Título inválido");
    }
    if (!isset($data->mensaje) || empty($data->mensaje)) {
        throw new Exception("Mensaje inválido");
    }
    if (!isset($data->tipo) || !in_array($data->tipo, ['cita', 'sistema', 'promocion'])) {
        throw new Exception("Tipo de notificación inválido");
    }

    $sql = "UPDATE notificaciones SET usuario_id = :usuario_id, titulo = :titulo, mensaje = :mensaje, tipo = :tipo, leida = :leida WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':usuario_id', $data->usuario_id);
    $stmt->bindParam(':titulo', $data->titulo);
    $stmt->bindParam(':mensaje', $data->mensaje);
    $stmt->bindParam(':tipo', $data->tipo);
    $stmt->bindParam(':leida', $data->leida);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Notificación actualizada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar notificación"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
