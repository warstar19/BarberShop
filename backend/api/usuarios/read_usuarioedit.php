<?php

include '../includes.php'; // Conexión $conn y CORS


if (session_status() === PHP_SESSION_NONE) { session_start(); }

// CORS/OPTIONS ya manejado en includes.php/cors.php

// Verificar Método GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') { /* ... error 405 ... */ }

// Verificar Autenticación y Rol Admin
if (!isset($_SESSION['user_id'])) { /* ... error 401 ... */ }
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') { /* ... error 403 ... */ }

// --- Lógica para Leer UN Usuario ---

// Validar ID
if (!isset($_GET['id']) || !filter_var($_GET['id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["error" => "ID de usuario inválido o no proporcionado."]); $conn = null; exit();
}
$userIdToEdit = intval($_GET['id']);

// Consulta para obtener los datos necesarios para el formulario
// ¡AJUSTA COLUMNAS! No incluir password_hash aquí.
$sql = "SELECT id, username, email, telefono, rol, estado, token /* <-- Incluye token si lo usas en el form */
        FROM usuarios WHERE id = :id";

try {
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $userIdToEdit, PDO::PARAM_INT);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

     header('Content-Type: application/json; charset=UTF-8'); // Asegurar content type
    if ($usuario) {
        $usuario['id'] = intval($usuario['id']); // Asegurar ID numérico
        echo json_encode($usuario);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "Usuario no encontrado."]);
    }

} catch (PDOException $e) {
    /* ... manejo error 500 ... */
} finally {
    $conn = null;
}
exit();
?>