<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
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

    $sql = "INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leida) VALUES (:usuario_id, :titulo, :mensaje, :tipo, :leida)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':usuario_id', $data->usuario_id);
    $stmt->bindParam(':titulo', $data->titulo);
    $stmt->bindParam(':mensaje', $data->mensaje);
    $stmt->bindParam(':tipo', $data->tipo);
    $stmt->bindParam(':leida', $data->leida); // Puedes establecer leida como 0 por defecto

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Notificación creada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear notificación"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
