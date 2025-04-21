<?php
// backend/api/usuarios/read_cambios.php

include '../includes.php'; // Conexión $conn y CORS


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS/OPTIONS (Permitir GET)
// ... (Bloque CORS Headers y OPTIONS similar a read_allusuarios.php) ...
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar Método GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') { /* ... error 405 ... */
}

// Verificar Autenticación y Rol Admin
if (!isset($_SESSION['user_id'])) { /* ... error 401 ... */
}
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') { /* ... error 403 ... */
}

// --- Lógica para Leer Historial ---

// ASUNCIÓN: Tienes una tabla 'historial_cambios' con columnas como:
// id_cambio, tabla_afectada, registro_afectado_id, tipo_cambio,
// campo_modificado, valor_anterior, valor_nuevo, fecha_cambio, usuario_id (quien hizo el cambio)

$sql = "SELECT hc.id_cambio, hc.tabla_afectada, hc.registro_afectado_id, hc.tipo_cambio,
               hc.campo_modificado, hc.valor_anterior, hc.valor_nuevo, hc.fecha_cambio,
               hc.usuario_id /* , u.username as usuario_nombre_modificador */ -- Opcional JOIN para nombre
        FROM historial_cambios hc
        /* LEFT JOIN usuarios u ON hc.usuario_id = u.id */ "; // Opcional

$whereClauses = [];
$params = [];

// Aplicar filtros GET opcionales (similar a read_allusuarios)
if (isset($_GET['tabla_afectada']) && !empty($_GET['tabla_afectada'])) {
    $whereClauses[] = "hc.tabla_afectada LIKE :tabla";
    $params[':tabla'] = '%' . $_GET['tabla_afectada'] . '%';
}
if (isset($_GET['tipo_cambio']) && !empty($_GET['tipo_cambio'])) {
    $whereClauses[] = "hc.tipo_cambio = :tipo";
    $params[':tipo'] = $_GET['tipo_cambio'];
}
if (isset($_GET['fecha_inicio']) && isset($_GET['fecha_fin']) && !empty($_GET['fecha_inicio']) && !empty($_GET['fecha_fin'])) {
    $whereClauses[] = "hc.fecha_cambio BETWEEN :fecha_inicio AND :fecha_fin";
    $params[':fecha_inicio'] = $_GET['fecha_inicio'] . ' 00:00:00';
    $params[':fecha_fin'] = $_GET['fecha_fin'] . ' 23:59:59';
}

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " ORDER BY hc.fecha_cambio DESC"; // Más recientes primero

// Añadir paginación si la necesitas

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear IDs si es necesario
    $historial_formateado = array_map(function ($rec) {
        $rec['id_cambio'] = intval($rec['id_cambio']);
        $rec['registro_afectado_id'] = intval($rec['registro_afectado_id']);
        $rec['usuario_id'] = intval($rec['usuario_id']);
        return $rec;
    }, $historial);

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($historial_formateado);

} catch (PDOException $e) {
    /* ... manejo error 500 ... */
} finally {
    $conn = null;
}
exit();
?>