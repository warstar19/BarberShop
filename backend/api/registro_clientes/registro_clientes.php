<?php
// Incluir configuración y conexión (NO validador JWT, registro es público)
include '../includes.php';
//require_once __DIR__ . '/config/config.php';
//require_once __DIR__ . '/config/conexion.php'; // $conn disponible

// Cabeceras CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);
    $conn = null;
    exit();
}

// --- Lógica de Registro ---
$data = json_decode(file_get_contents("php://input"));

// Validación básica de entrada
if (!$data || !isset($data->username) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos requeridos (username, email, password)."]);
    $conn = null;
    exit();
}
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato de correo electrónico inválido."]);
    $conn = null;
    exit();
}
if (strlen($data->password) < 6) { // Añade tu validación de contraseña
    http_response_code(400);
    echo json_encode(["error" => "La contraseña debe tener al menos 6 caracteres."]);
    $conn = null;
    exit();
}

$username = trim($data->username);
$email = trim($data->email);
$password = $data->password; // Contraseña en texto plano

// 1. Hashear la contraseña (¡NUNCA guardarla en texto plano!)
$password_hash = password_hash($password, PASSWORD_DEFAULT);
if ($password_hash === false) {
    http_response_code(500);
    error_log("Error al hashear contraseña para registro.");
    echo json_encode(["error" => "Error interno del servidor [R1]."]);
    $conn = null;
    exit();
}

// 2. Verificar si el email o username ya existen
// ASUNCIÓN: Tabla 'usuarios', columnas 'email', 'username'
$sql_check = "SELECT id FROM usuarios WHERE email = ? OR username = ?";
try {
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->execute([$email, $username]);
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
    echo json_encode(["error" => "Error interno del servidor [R2]."]);
    $conn = null;
    exit();
}

// 3. Insertar nuevo usuario (rol 'cliente' por defecto)
// ASUNCIÓN: Tabla 'usuarios', columnas 'username', 'email', 'password_hash', 'rol', 'estado'
$sql_insert = "INSERT INTO usuarios (username, email, password_hash, rol, estado) VALUES (?, ?, ?, 'cliente', 'activo')"; // Rol y estado por defecto
try {
    $stmt_insert = $conn->prepare($sql_insert);
    $success = $stmt_insert->execute([$username, $email, $password_hash]);

    if ($success) {
        http_response_code(201); // Created
        echo json_encode(["success" => true, "message" => "Usuario registrado correctamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo registrar el usuario."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error PDO insert user: " . $e->getMessage());
    // Podría ser un error de constraint duplicado si la verificación anterior falló por concurrencia
    if ($e->getCode() == 23000) { // Código SQLSTATE para violación de integridad
        http_response_code(409);
        echo json_encode(["error" => "El correo electrónico o nombre de usuario ya está registrado (concurrencia)."]);
    } else {
        echo json_encode(["error" => "Error interno del servidor [R3]."]);
    }
} finally {
    $conn = null; // Cerrar conexión
}
exit();
?>