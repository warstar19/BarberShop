<?php
// require_once __DIR__ . '/includes/session_config.php'; // Opcional

// Iniciar sesión para poder destruirla
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cabeceras CORS
header("Access-Control-Allow-Origin: http://localhost:4200"); // URL Angular
header("Access-Control-Allow-Credentials: true"); // Permitir cookie
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Logout es POST
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 1. Limpiar variables de sesión
    $_SESSION = array();

    // 2. Borrar cookie de sesión del navegador (opcional pero buena práctica)
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    // 3. Destruir sesión en el servidor
    session_destroy();

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Sesión cerrada."]);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido. Use POST."]);
}
exit();
?>