<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos (similar a create_usuario.php)
    if (!isset($data->id) || !is_numeric($data->id) || $data->id <= 0) {
        throw new Exception("ID de usuario inválido");
    }
    if (!isset($data->username) || empty($data->username)) {
        throw new Exception("Nombre de usuario inválido");
    }
    if (isset($data->password) && empty($data->password)) { // La contraseña es opcional al actualizar
        throw new Exception("Contraseña inválida");
    }
    if (!isset($data->email) || empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Correo electrónico inválido");
    }
    if (!isset($data->rol) || !in_array($data->rol, ['cliente', 'barbero', 'administrador'])) {
        throw new Exception("Rol inválido");
    }
    if (!isset($data->nombre) || empty($data->nombre)) {
        throw new Exception("Nombre inválido");
    }
    if (!isset($data->apellido) || empty($data->apellido)) {
        throw new Exception("Apellido inválido");
    }
    if (!isset($data->telefono) || empty($data->telefono)) {
        throw new Exception("Teléfono inválido");
    }

    $sql = "UPDATE usuarios SET username = :username, password = :password, email = :email, rol = :rol, nombre = :nombre, apellido = :apellido, telefono = :telefono, imagen_url = :imagen_url WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':username', $data->username);
    $stmt->bindParam(':password', isset($data->password) ? password_hash($data->password, PASSWORD_DEFAULT) : null); // Hash de la contraseña si se proporciona
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':rol', $data->rol);
    $stmt->bindParam(':nombre', $data->nombre);
    $stmt->bindParam(':apellido', $data->apellido);
    $stmt->bindParam(':telefono', $data->telefono);
    $stmt->bindParam(':imagen_url', $data->imagen_url);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Usuario actualizado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al actualizar usuario"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
