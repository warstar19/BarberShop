<?php
// backend/api/check_session.php

// Opcional: Incluir configuración de sesión si afecta cómo se leen/validan
// require_once __DIR__ . '/includes/session_config.php';
// NO necesitamos conexión a BD aquí, solo leemos la sesión

// Iniciar/Reanudar sesión para leer $_SESSION
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cabeceras CORS (¡También necesarias aquí!)
header("Access-Control-Allow-Origin: http://localhost:4200"); // URL Angular
header("Access-Control-Allow-Credentials: true"); // Permitir cookie de sesión
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Este endpoint usa GET
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

// Manejo OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Use GET."]);
    exit();
}

// Verificar si la variable de sesión clave existe
if (isset($_SESSION['user_id'])) {
    // Hay una sesión activa, devolver estado y datos básicos
    http_response_code(200);
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'] ?? null, // Usar operador ?? por si no se guardó
            "role" => $_SESSION['user_role'] ?? null
        ]
    ]);
} else {
    // No hay sesión activa
    http_response_code(200); // La petición fue exitosa, pero no está logueado
    echo json_encode(["loggedIn" => false]);
}
exit();
?>