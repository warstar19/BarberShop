<?php
// backend/api/usuarios/update_user_status.php

include '../includes.php'; // Conexión $conn y CORS
// require_once __DIR__ . '/../includes/session_config.php'; // Opcional

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Verificar Método (Usaremos PUT o POST)
if ($_SERVER['REQUEST_METHOD'] != 'PUT' && $_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["error" => "Método no permitido. Use PUT o POST."]);
    $conn = null;
    exit();
}

// Verificar Autenticación y Rol Admin
if (!isset($_SESSION['user_id'])) { /* ... error 401 ... */
}
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') { /* ... error 403 ... */
}

// --- Lógica para Cambiar Estado ---
$data = json_decode(file_get_contents("php://input"));

// Validar datos requeridos (ID y nuevo estado)
if (!$data || !isset($data->id) || !filter_var($data->id, FILTER_VALIDATE_INT) || !isset($data->estado)) {
    /* ... error 400: Faltan datos o ID inválido ... */
}
$userIdToUpdate = intval($data->id);
$nuevoEstado = $data->estado;

// Validar que el nuevo estado sea válido ('activo' o 'inactivo')
if (!in_array($nuevoEstado, ['activo', 'inactivo'])) {
    /* ... error 400: Estado inválido ... */
}

// No permitir que el admin se inactive a sí mismo (medida de seguridad)
$adminUserId = $_SESSION['user_id'];
if ($userIdToUpdate === $adminUserId && $nuevoEstado === 'inactivo') {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["error" => "Un administrador no puede inactivar su propia cuenta."]);
    $conn = null;
    exit();
}


// Consulta UPDATE solo para el estado
$sql_update = "UPDATE usuarios SET estado = :estado WHERE id = :id";

try {
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bindParam(':estado', $nuevoEstado, PDO::PARAM_STR);
    $stmt_update->bindParam(':id', $userIdToUpdate, PDO::PARAM_INT);

    if ($stmt_update->execute()) {
        if ($stmt_update->rowCount() > 0) {
            http_response_code(200); // OK
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(["success" => true, "message" => "Estado del usuario actualizado."]);
        } else {
            http_response_code(200); // OK, pero sin cambios
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode(["success" => false, "message" => "No se realizaron cambios (estado igual o usuario no encontrado)."]);
        }
    } else {
        /* ... error 500: Falló execute ... */
    }

} catch (PDOException $e) {
    /* ... manejo error 500 ... */
} finally {
    $conn = null;
}
exit();
?>