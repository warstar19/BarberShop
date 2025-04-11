<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->nombre) || empty($data->nombre)) {
        throw new Exception("Nombre del servicio inválido");
    }
    if (!isset($data->precio) || !is_numeric($data->precio) || $data->precio <= 0) {
        throw new Exception("Precio inválido");
    }
    if (!isset($data->duracion_minutos) || !is_numeric($data->duracion_minutos) || $data->duracion_minutos <= 0) {
        throw new Exception("Duración en minutos inválida");
    }
    // imagen_url y descripcion son opcionales

    $sql = "INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos, imagen_url) VALUES (:nombre, :descripcion, :precio, :duracion_minutos, :imagen_url)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':nombre', $data->nombre);
    $stmt->bindParam(':descripcion', $data->descripcion);
    $stmt->bindParam(':precio', $data->precio);
    $stmt->bindParam(':duracion_minutos', $data->duracion_minutos);
    $stmt->bindParam(':imagen_url', $data->imagen_url);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Servicio creado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear servicio"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
