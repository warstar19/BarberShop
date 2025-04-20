<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_sucursal.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de sucursal inválido");
    }
    if (!isset($data->nombre) || empty($data->nombre)) {
        throw new Exception("Nombre de sucursal inválido");
    }
    if (!isset($data->latitud) || !is_numeric($data->latitud)) {
        throw new Exception("Latitud inválida");
    }
    if (!isset($data->longitud) || !is_numeric($data->longitud)) {
        throw new Exception("Longitud inválida");
    }
    if (!isset($data->telefono) || empty($data->telefono)) {
        throw new Exception("Teléfono inválido");
    }
    if (!isset($data->correo) || empty($data->correo) || !filter_var($data->correo, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Correo electrónico inválido");
    }
    if (!isset($data->direccion) || empty($data->direccion)) {
        throw new Exception("Dirección inválida");
    }
    if (!isset($data->horario) || empty($data->horario)) {
        throw new Exception("Horario inválido");
    }

    $sql = "UPDATE sucursales SET nombre = :nombre, latitud = :latitud, longitud = :longitud, telefono = :telefono, correo = :correo, imagen_url = :imagen_url, whatsapp = :whatsapp, direccion = :direccion, horario = :horario WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':nombre', $data->nombre);
    $stmt->bindParam(':latitud', $data->latitud);
    $stmt->bindParam(':longitud', $data->longitud);
    $stmt->bindParam(':telefono', $data->telefono);
    $stmt->bindParam(':correo', $data->correo);
    $stmt->bindParam(':imagen_url', $data->imagen_url);
    $stmt->bindParam(':whatsapp', $data->whatsapp);
    $stmt->bindParam(':direccion', $data->direccion);
    $stmt->bindParam(':horario', $data->horario);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Sucursal actualizada con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar sucursal"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
