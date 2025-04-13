<?php
include '../cors.php';
include '../conexion.php';

$data = json_decode(file_get_contents("php://input"));

try {
    if (!isset($data->email_original) || empty($data->email_original)) {
        throw new Exception("Email original es necesario");
    }

    // Validaciones mínimas necesarias para continuar...
    if (!isset($data->username) || !isset($data->email)) {
        throw new Exception("Datos incompletos");
    }

    // Validación para historial
    $modificadoPor = $data->modificado_por ?? 'desconocido';

    // Buscar usuario original
    $sql_check = "SELECT * FROM usuarios WHERE email = :email_original";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bindParam(':email_original', $data->email_original);
    $stmt_check->execute();
    $existingUser = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if (!$existingUser) {
        throw new Exception("Usuario no encontrado para editar.");
    }

    // Actualización condicional
    $updateFields = [];
    $params = [':email_original' => $data->email_original];
    $historial = [];

    function compararCampo($campo, $nuevoValor, $originalValor, &$updateFields, &$params, &$historial) {
        if ($nuevoValor !== $originalValor) {
            $updateFields[] = "$campo = :$campo";
            $params[":$campo"] = $nuevoValor;
            $historial[] = [
                'campo' => $campo,
                'anterior' => $originalValor,
                'nuevo' => $nuevoValor
            ];
        }
    }

    compararCampo('username', $data->username, $existingUser['username'], $updateFields, $params, $historial);
    compararCampo('email', $data->email, $existingUser['email'], $updateFields, $params, $historial);
    compararCampo('telefono', $data->telefono, $existingUser['telefono'], $updateFields, $params, $historial);
    compararCampo('direccion', $data->direccion, $existingUser['direccion'], $updateFields, $params, $historial);
    compararCampo('fecha_nacimiento', $data->fechaNacimiento, $existingUser['fecha_nacimiento'], $updateFields, $params, $historial);
    compararCampo('genero', $data->genero, $existingUser['genero'], $updateFields, $params, $historial);
    compararCampo('rol', $data->rol, $existingUser['rol'], $updateFields, $params, $historial);
    compararCampo('estado', $data->estado, $existingUser['estado'], $updateFields, $params, $historial);

    // Contraseña
    $passwordHash = $existingUser['password_hash'];
    if (isset($data->password) && !empty($data->password)) {
        $nuevoHash = password_hash($data->password, PASSWORD_DEFAULT);
        if (!password_verify($data->password, $existingUser['password_hash'])) {
            $passwordHash = $nuevoHash;
            $updateFields[] = "password_hash = :password_hash";
            $params[':password_hash'] = $passwordHash;
            $historial[] = [
                'campo' => 'password_hash',
                'anterior' => '[oculto]',
                'nuevo' => '[actualizado]'
            ];
        }
    }

    // Token
    $nuevoToken = ($data->rol === 'admin' || $data->rol === 'barbero') ? ($data->token ?? '') : null;
    if ($nuevoToken !== $existingUser['token']) {
        $updateFields[] = "token = :token";
        $params[':token'] = $nuevoToken;
        $historial[] = [
            'campo' => 'token',
            'anterior' => $existingUser['token'],
            'nuevo' => $nuevoToken
        ];
    }

    // Si no hay cambios
    if (empty($updateFields)) {
        echo json_encode(["error" => "No se realizaron cambios en los datos del usuario."]);
        exit;
    }

    // Actualizar usuario
    $sql = "UPDATE usuarios SET " . implode(", ", $updateFields) . ", fecha_actualizacion = NOW() WHERE email = :email_original";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    // Insertar en historial si hubo cambios
    $usuarioId = $existingUser['id'];
    foreach ($historial as $cambio) {
        $sqlHistorial = "INSERT INTO historial_usuarios (usuario_id, campo, valor_anterior, valor_nuevo, fecha, modificado_por)
                         VALUES (:usuario_id, :campo, :anterior, :nuevo, NOW(), :modificado_por)";
        $stmtHist = $conn->prepare($sqlHistorial);
        $stmtHist->execute([
            ':usuario_id' => $usuarioId,
            ':campo' => $cambio['campo'],
            ':anterior' => $cambio['anterior'],
            ':nuevo' => $cambio['nuevo'],
            ':modificado_por' => $modificadoPor
        ]);
    }

    echo json_encode(["mensaje" => "Usuario editado con éxito"]);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

$conn = null;
?>
