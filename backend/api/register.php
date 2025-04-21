<?php
include 'includes.php';

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    $conn = null;
    exit();
}

// --- Lógica de Registro ---
$data = json_decode(file_get_contents("php://input"));

// Validación básica de entrada (igual que en el componente Angular)
if (!$data || !isset($data->username) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos requeridos."]);
    $conn = null;
    exit();
}
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Correo electrónico inválido."]);
    $conn = null;
    exit();
}
if (strlen($data->password) < 6) { // Misma validación que en Angular
    http_response_code(400);
    echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres."]);
    $conn = null;
    exit();
}
if (strlen($data->username) < 3) { // Ejemplo: añadir validación para username
    http_response_code(400);
    echo json_encode(["error" => "El nombre de usuario debe tener al menos 3 caracteres."]);
    $conn = null;
    exit();
}


$username = trim($data->username);
$email = trim($data->email);
$password = $data->password;

// 1. Hashear la contraseña ANTES de guardar
$password_hash = password_hash($password, PASSWORD_DEFAULT);
if ($password_hash === false) {
    http_response_code(500);
    error_log("Error al hashear contraseña para registro.");
    echo json_encode(["error" => "Error interno [R1]."]);
    $conn = null;
    exit();
}

// 2. Verificar si email o username ya existen (¡IMPORTANTE!)
// ASUNCIÓN: Tabla 'usuarios', columnas 'email', 'username'
$sql_check = "SELECT id FROM usuarios WHERE email = :email OR username = :username LIMIT 1";
try {
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt_check->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt_check->execute();
    if ($stmt_check->fetch()) {
        // Email o Username ya existe
        http_response_code(409); // Conflict
        echo json_encode(["error" => "El correo electrónico o nombre de usuario ya está registrado."]);
        $conn = null;
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error PDO check user exists: " . $e->getMessage());
    echo json_encode(["error" => "Error interno [R2]."]);
    $conn = null;
    exit();
}

// 3. Insertar nuevo usuario con rol 'cliente' y estado 'activo' por defecto
// ASUNCIÓN: Tabla 'usuarios', columnas 'username', 'email', 'password_hash', 'rol', 'estado'
// ¡AJUSTA SI TU TABLA ES DIFERENTE!
$sql_insert = "INSERT INTO usuarios (username, email, password_hash, rol, estado) VALUES (:username, :email, :password_hash, 'cliente', 'activo')";
try {
    $stmt_insert = $conn->prepare($sql_insert);
    // Vincular parámetros
    $stmt_insert->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt_insert->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt_insert->bindParam(':password_hash', $password_hash, PDO::PARAM_STR); // El hash generado

    $success = $stmt_insert->execute();

    if ($success) {
        http_response_code(201); // Created
        echo json_encode(["success" => true, "message" => "Usuario registrado correctamente."]);
    } else {
        http_response_code(500);
        // Puede que necesites obtener el error específico de $stmt_insert->errorInfo()
        error_log("Error PDO insert user: Falló execute() pero no lanzó excepción.");
        echo json_encode(["error" => "No se pudo registrar el usuario [R3a]."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error PDO insert user: " . $e->getMessage());
    if ($e->getCode() == 23000) { // Violación de constraint (ej: UNIQUE)
        http_response_code(409); // Conflict
        echo json_encode(["error" => "El correo electrónico o nombre de usuario ya está registrado (concurrencia)."]);
    } else {
        echo json_encode(["error" => "Error interno [R3b]."]);
    }
} finally {
    $conn = null; // Cerrar conexión
}
exit();
?>