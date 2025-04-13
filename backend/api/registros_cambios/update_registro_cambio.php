<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_mbio.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de registro de cambio inválido");
    }
    if (!isset($data->tabla_afectada) || empty($data->tabla_afectada)) {
        throw new Exception("Tabla afectada inválida");
    }
    if (!isset($data->registro_id) || !is_numeric($data->registro_id) || $data->registro_id <= 0) {
        throw new Exception("ID de registro inválido");
    }
    if (!isset($data->tipo_cambio) || !in_array($data->tipo_cambio, ['creacion', 'actualizacion', 'eliminacion'])) {
        throw new Exception("Tipo de cambio inválido");
    }
    if (!isset($data->usuario_id) || !is_numeric($data->usuario_id) || $data->usuario_id <= 0) {
        throw new Exception("ID de usuario inválido");
    }

    $sql = "UPDATE registros_cambios SET tabla_afectada = :tabla_afectada, registro_id = :registro_id, tipo_cambio = :tipo_cambio, usuario_id = :usuario_id, datos_anteriores = :datos_anteriores, datos_nuevos = :datos_nuevos WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':tabla_afectada', $data->tabla_afectada);
    $stmt->bindParam(':registro_id', $data->registro_id);
    $stmt->bindParam(':tipo_cambio', $data->tipo_cambio);
    $stmt->bindParam(':usuario_id', $data->usuario_id);
    $stmt->bindParam(':datos_anteriores', $data->datos_anteriores);
    $stmt->bindParam(':datos_nuevos', $data->datos_nuevos);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Registro de cambio actualizado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar registro de cambio"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
