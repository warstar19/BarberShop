<?php
include '../includes.php';
//include '../cors.php';
//include '../conexion.php';


$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->username) || empty($data->username)) {
        throw new Exception("Nombre de usuario inválido");
    }
    if (!isset($data->password) || empty($data->password)) {
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
    // imagen_url es opcional

    $sql = "INSERT INTO usuarios (username, password, email, rol, nombre, apellido, telefono, imagen_url) VALUES (:username, :password, :email, :rol, :nombre, :apellido, :telefono, :imagen_url)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $data->username);
    $stmt->bindParam(':password', password_hash($data->password, PASSWORD_DEFAULT)); // Hash de la contraseña
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':rol', $data->rol);
    $stmt->bindParam(':nombre', $data->nombre);
    $stmt->bindParam(':apellido', $data->apellido);
    $stmt->bindParam(':telefono', $data->telefono);
    $stmt->bindParam(':imagen_url', $data->imagen_url);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Usuario creado con éxito"]);
    } else {
        echo json_encode(["error" => "Error al crear usuario"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
