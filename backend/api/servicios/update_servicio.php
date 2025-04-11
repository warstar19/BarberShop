<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_servicio.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de servicio inválido");
    }
    if (!isset($data->nombre) || empty($data->nombre)) {
        throw new Exception("Nombre del servicio inválido");
    }
    if (!isset($data->precio) || !is_numeric($data->precio) || $data->precio <= 0) {
        throw new Exception("Precio inválido");
    }
    if (!isset($data->duracion_minutos) || !is_numeric($data->duracion_minutos) || $data->duracion_minutos <= 0) {
        throw new Exception("Duración en minutos inválida");
    }

    $sql = "UPDATE servicios SET nombre = :nombre, descripcion = :descripcion, precio = :precio, duracion_minutos = :duracion_minutos, imagen_url = :imagen_url WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':nombre', $data->nombre);
    $stmt->bindParam(':descripcion', $data->descripcion);
    $stmt->bindParam(':precio', $data->precio);
    $stmt->bindParam(':duracion_minutos', $data->duracion_minutos);
    $stmt->bindParam(':imagen_url', $data->imagen_url);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Servicio actualizado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar servicio"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
