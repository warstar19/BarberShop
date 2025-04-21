<?php
// 1. Incluir Configuraciones y Conexión ANTES de iniciar sesión
// Incluye la configuración de cookies de sesión (ajusta ruta si es diferente)
include 'includes/session_config.php';
// Incluye TU conexión PDO (ajusta ruta si es diferente, aquí asume misma carpeta 'api')
include 'includes.php'; // ($conn ya está disponible)

// 2. Iniciar o reanudar la sesión (después de configurar cookies si aplica)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Cabeceras CORS específicas para Sesiones/Credentials
//    ¡Reemplaza '*' con tu URL exacta de Angular para producción!
header("Access-Control-Allow-Origin: http://localhost:4200"); // Origen específico PERMITIDO
header("Access-Control-Allow-Credentials: true"); // ¡Fundamental para cookies/sesiones!
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Métodos permitidos para ESTE endpoint
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With"); // Cabeceras que Angular puede enviar

// Buscar si el usuario ya tiene una sesión activa
if (isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Ya hay una sesión activa.']);
    exit;
}
// 4. Manejo de la petición Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // Responde OK a la verificación previa del navegador
    exit(); // No procesar nada más para OPTIONS
}

// 5. Verificar que el método sea POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(["error" => "Método no permitido. Use POST."]);
    $conn = null; // Cerrar conexión
    exit();
}

// --- Lógica de Autenticación ---

// 6. Obtener datos JSON enviados por Angular
$data = json_decode(file_get_contents("php://input"));

// 7. Validar datos de entrada básicos
if (!$data || !isset($data->email) || !isset($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Faltan email o contraseña."]);
    $conn = null; exit(); // Cerrar conexión y salir
}

$email = $data->email;
$password_from_user = $data->password;

// 8. Consultar Base de Datos (usando PDO y sentencias preparadas)
// ASUNCIÓN: Tabla 'usuarios', columnas 'email', 'password_hash', 'id', 'rol', 'username'
// ¡AJUSTA LA CONSULTA SI TU TABLA/COLUMNAS SON DIFERENTES!
$sql = "SELECT id, username, email, rol, password_hash FROM usuarios WHERE email = :email LIMIT 1";

try {
    $stmt = $conn->prepare($sql);
    // Vincular el parámetro :email
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    // Obtener el usuario
    $user = $stmt->fetch(PDO::FETCH_ASSOC); // fetch() devuelve false si no hay usuario

    // 9. Verificar si el usuario existe y la contraseña es correcta
    if ($user && password_verify($password_from_user, $user['password_hash'])) {
        // ¡Credenciales VÁLIDAS!

        // 10. Regenerar ID de sesión (seguridad contra fijación de sesión)
        session_regenerate_id(true);

        // 11. Guardar información esencial en la sesión del servidor
        $_SESSION['user_id'] = intval($user['id']);
        $_SESSION['user_role'] = $user['rol'];
        $_SESSION['username'] = $user['username'];
        // $_SESSION['last_login'] = time(); // Ejemplo: guardar hora de login

        // 12. Enviar respuesta de éxito a Angular
        http_response_code(200); // OK
        echo json_encode([
            "success" => true,
            "message" => "Login exitoso.",
            "user" => [ // Enviar datos básicos para uso inmediato en frontend
                "id" => $_SESSION['user_id'],
                "username" => $_SESSION['username'],
                "role" => $_SESSION['user_role']
            ]
        ]);

    } else {
        // Credenciales INVÁLIDAS (usuario no existe o contraseña incorrecta)
        http_response_code(401); // Unauthorized
        echo json_encode(["error" => "Credenciales inválidas."]);
    }

} catch (PDOException $e) {
    // Capturar errores de base de datos
    http_response_code(500); // Internal Server Error
    error_log("Error PDO en Login: " . $e->getMessage()); // Loguear el error real
    echo json_encode(["error" => "Error interno del servidor al verificar usuario."]); // Mensaje genérico
} finally {
    // 13. Cerrar la conexión PDO
    $conn = null;
}
exit(); // Terminar explícitamente
?>