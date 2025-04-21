<?php
// backend/api/usuarios/edit_usuario.php

include '../includes.php'; // Conexión $conn y CORS
// require_once __DIR__ . '/../includes/session_config.php'; // Opcional

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS/OPTIONS ya manejado (Asegúrate que permita PUT o POST)

// Verificar Método (Usaremos PUT, pero podrías usar POST)
if ($_SERVER['REQUEST_METHOD'] != 'PUT') { /* ... error 405 ... */
}

// Verificar Autenticación y Rol Admin
if (!isset($_SESSION['user_id'])) { /* ... error 401 ... */
}
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') { /* ... error 403 ... */
}

// --- Lógica para Editar Usuario ---
$data = json_decode(file_get_contents("php://input"));

// Validar datos (necesitamos el ID para saber a quién editar)
if (!$data || !isset($data->id) || !filter_var($data->id, FILTER_VALIDATE_INT) || !isset($data->username) || !isset($data->email) /* ... otros campos requeridos ... */) {
    /* ... error 400: Faltan datos o ID inválido ... */
}
// ... (más validaciones: email, rol, estado, etc.) ...

$userIdToEdit = intval($data->id);
$username = trim($data->username);
$email = trim($data->email);
$telefono = $data->telefono ?? null;
$rol = $data->rol;
$estado = $data->estado;
$token = $data->token ?? null; // Recoger token si viene del form

// Verificar duplicados de email/username (EXCLUYENDO al propio usuario)
$sql_check = "SELECT id FROM usuarios WHERE (email = :email OR username = :username) AND id != :id LIMIT 1";
try {
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt_check->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt_check->bindParam(':id', $userIdToEdit, PDO::PARAM_INT); // ID del usuario a excluir
    $stmt_check->execute();
    if ($stmt_check->fetch()) { /* ... error 409: Usuario/Email ya existe en OTRO usuario ... */
    }
} catch (PDOException $e) { /* ... manejo error 500 [CHK_EDIT] ... */
}


// Consulta UPDATE (¡NO ACTUALIZAR PASSWORD AQUÍ!)
// Ajusta columnas si es necesario
$sql_update = "UPDATE usuarios SET
                    username = :username,
                    email = :email,
                    telefono = :telefono,
                    rol = :rol,
                    estado = :estado,
                    token = :token /* <-- Actualizar token si aplica */
                WHERE id = :id"; // Condición WHERE crucial
try {
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bindParam(':username', $username);
    $stmt_update->bindParam(':email', $email);
    $stmt_update->bindParam(':telefono', $telefono);
    $stmt_update->bindParam(':rol', $rol);
    $stmt_update->bindParam(':estado', $estado);
    $stmt_update->bindParam(':token', $token); // Bind token
    $stmt_update->bindParam(':id', $userIdToEdit, PDO::PARAM_INT); // Bind ID

    if ($stmt_update->execute()) {
        // rowCount() > 0 indica que algo cambió
        if ($stmt_update->rowCount() > 0) {
            http_response_code(200); // OK
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(["success" => true, "message" => "Usuario actualizado con éxito."]);
        } else {
            http_response_code(200); // OK, pero no hubo cambios
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(["success" => false, "message" => "No se realizaron cambios (datos iguales o usuario no encontrado)."]);
        }
    } else {
        /* ... error 500: Falló execute ... */
    }
} catch (PDOException $e) {
    /* ... manejo error 500 / 409 (si es duplicado por concurrencia) ... */
} finally {
    $conn = null;
}
exit();
?>