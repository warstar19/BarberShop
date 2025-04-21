<?php
// backend/api/usuarios/add_usuario.php

include '../includes.php'; // Conexión $conn y CORS
// require_once __DIR__ . '/../includes/session_config.php'; // Opcional

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS/OPTIONS ya manejado en includes.php/cors.php (Asegúrate que permita POST)

// Verificar Método POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') { /* ... error 405 ... */
}

// Verificar Autenticación y Rol Admin
if (!isset($_SESSION['user_id'])) { /* ... error 401 ... */
}
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') { /* ... error 403 ... */
}

// --- Lógica para Crear Usuario ---
$data = json_decode(file_get_contents("php://input"));

// Validaciones robustas (igual o mejor que en register.php)
if (!$data || !isset($data->username) || !isset($data->email) || !isset($data->password) || !isset($data->rol) || !isset($data->estado)) {
    /* ... error 400: Faltan datos ... */
}
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) { /* ... error 400: Email inválido ... */
}
if (strlen($data->password) < 6) { /* ... error 400: Password corto ... */
}
if (!in_array($data->rol, ['admin', 'barbero', 'cliente'])) { /* ... error 400: Rol inválido ... */
}
if (!in_array($data->estado, ['activo', 'inactivo'])) { /* ... error 400: Estado inválido ... */
}
// Añade más validaciones (ej: teléfono, token si es requerido)

$username = trim($data->username);
$email = trim($data->email);
$password = $data->password;
$telefono = $data->telefono ?? null;
$rol = $data->rol;
$estado = $data->estado;
$token = $data->token ?? null; // Recoger token si viene del form

// Hashear contraseña
$password_hash = password_hash($password, PASSWORD_DEFAULT);
if ($password_hash === false) { /* ... error 500: Falló hash ... */
}

// Verificar duplicados (igual que en register.php)
$sql_check = "SELECT id FROM usuarios WHERE email = :email OR username = :username LIMIT 1";
try {
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt_check->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt_check->execute();
    if ($stmt_check->fetch()) { /* ... error 409: Usuario/Email ya existe ... */
    }
} catch (PDOException $e) { /* ... manejo error 500 [CHK_ADD] ... */
}

// Insertar usuario (AJUSTA COLUMNAS A TU TABLA)
// Incluye 'telefono', 'token' si existen en tu tabla 'usuarios'
$sql_insert = "INSERT INTO usuarios (username, email, password_hash, telefono, rol, estado, token)
               VALUES (:username, :email, :password_hash, :telefono, :rol, :estado, :token)";
try {
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bindParam(':username', $username);
    $stmt_insert->bindParam(':email', $email);
    $stmt_insert->bindParam(':password_hash', $password_hash);
    $stmt_insert->bindParam(':telefono', $telefono);
    $stmt_insert->bindParam(':rol', $rol);
    $stmt_insert->bindParam(':estado', $estado);
    $stmt_insert->bindParam(':token', $token); // Bind token

    if ($stmt_insert->execute()) {
        http_response_code(201); // Created
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["success" => true, "message" => "Usuario creado con éxito."]);
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