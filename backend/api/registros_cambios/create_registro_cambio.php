<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
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
    // No es necesario validar datos_anteriores y datos_nuevos, ya que pueden ser NULL o JSON válido

    $sql = "INSERT INTO registros_cambios (tabla_afectada, registro_id, tipo_cambio, usuario_id, datos_anteriores, datos_nuevos) VALUES (:tabla_afectada, :registro_id, :tipo_cambio, :usuario_id, :datos_anteriores, :datos_nuevos)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':tabla_afectada', $data->tabla_afectada);
    $stmt->bindParam(':registro_id', $data->registro_id);
    $stmt->bindParam(':tipo_cambio', $data->tipo_cambio);
    $stmt->bindParam(':usuario_id', $data->usuario_id);
    $stmt->bindParam(':datos_anteriores', $data->datos_anteriores);
    $stmt->bindParam(':datos_nuevos', $data->datos_nuevos);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Registro de cambio creado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear registro de cambio"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
