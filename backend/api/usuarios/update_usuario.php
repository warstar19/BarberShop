<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Validación de datos
    if (!isset($data->email_original) || empty($data->email_original)) {
        throw new Exception("Email original inválido");
    }
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

    // Construir la consulta SQL
    $sql = "UPDATE usuarios SET username = :username, email = :email, telefono = :telefono, direccion = :direccion, fecha_nacimiento = :fechaNacimiento, genero = :genero";
    $params = [
        ':username' => $data->username,
        ':email' => $data->email,
        ':telefono' => $data->telefono,
        ':direccion' => $data->direccion,
        ':fechaNacimiento' => $data->fechaNacimiento,
        ':genero' => $data->genero,
    ];

    // Añadir la contraseña si se proporciona
    if (isset($data->password) && !empty($data->password) && isset($data->newPassword) && !empty($data->newPassword)) {
        $sql .= ", password = :newPassword";
        $params[':newPassword'] = password_hash($data->newPassword, PASSWORD_DEFAULT);

        // Verificar la contraseña actual
        $sql_verify = "SELECT password FROM usuarios WHERE email = :email_original";
        $stmt_verify = $conn->prepare($sql_verify);
        $stmt_verify->bindParam(':email_original', $data->email_original);
        $stmt_verify->execute();
        $row = $stmt_verify->fetch(PDO::FETCH_ASSOC);

        if (!$row || !password_verify($data->password, $row['password'])) {
            throw new Exception("Contraseña actual incorrecta");
        }
    }

    $sql .= " WHERE email = :email_original";
    $params[':email_original'] = $data->email_original;

    $stmt = $conn->prepare($sql);

    if ($stmt->execute($params)) {
        echo json_encode(["mensaje" => "Usuario actualizado con éxito"]);
    } else {
        // Obtener información detallada del error de la consulta
        $errorInfo = $stmt->errorInfo();
        echo json_encode(["error" => "Error al actualizar usuario: " . $errorInfo[2]]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
