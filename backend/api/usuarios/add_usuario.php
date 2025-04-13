<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->username) || empty($data->username)) {
        throw new Exception("Nombre de usuario inválido");
    }
    if (!isset($data->email) || empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Correo electrónico inválido");
    }
    if (!isset($data->telefono) || empty($data->telefono)) {
        throw new Exception("Teléfono inválido");
    }
    if (!isset($data->direccion) || empty($data->direccion)) {
        throw new Exception("Dirección inválida");
    }
    if (!isset($data->fechaNacimiento) || empty($data->fechaNacimiento)) {
        throw new Exception("Fecha de nacimiento inválida");
    }
    if (!isset($data->genero) || empty($data->genero)) {
        throw new Exception("Género inválido");
    }
    if (!isset($data->rol) || empty($data->rol) || !in_array($data->rol, ['admin', 'barbero', 'cliente'])) {
        throw new Exception("Rol inválido");
    }
    if (!isset($data->estado) || empty($data->estado) || !in_array($data->estado, ['activo', 'inactivo'])) {
        throw new Exception("Estado inválido");
    }

    // Determinar el token según el rol
    $token = $data->rol;

    // Verificar si la contraseña fue proporcionada
    if (!isset($data->password) || empty($data->password)) {
        throw new Exception("La contraseña es requerida.");
    }

    // Hash de la contraseña
    $passwordHash = password_hash($data->password, PASSWORD_DEFAULT);

    // Insertar nuevo usuario
    $sql = "INSERT INTO usuarios (username, email, telefono, direccion, fecha_nacimiento, genero, password_hash, rol, estado, token, fecha_creacion, fecha_actualizacion)
            VALUES (:username, :email, :telefono, :direccion, :fechaNacimiento, :genero, :password_hash, :rol, :estado, :token, NOW(), NOW())";
    $params = [
        ':username' => $data->username,
        ':email' => $data->email,
        ':telefono' => $data->telefono,
        ':direccion' => $data->direccion,
        ':fechaNacimiento' => $data->fechaNacimiento,
        ':genero' => $data->genero,
        ':password_hash' => $passwordHash,
        ':rol' => $data->rol,
        ':estado' => $data->estado,
        ':token' => $token
    ];

    $stmt = $conn->prepare($sql);
    if ($stmt->execute($params)) {
        echo json_encode(["mensaje" => "Usuario creado con éxito"]);
    } else {
        $errorInfo = $stmt->errorInfo();
        echo json_encode(["error" => "Error al crear usuario: " . $errorInfo[2]]);
    }

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
