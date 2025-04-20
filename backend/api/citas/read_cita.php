<?php

// 1. Incluir archivos necesarios

include '../includes.php';       // Conexión PDO ($conn) y CORS
error_log("Llegando read_cita.php"); // Debugging temporal

// 2. Iniciar Sesión
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
    error_log("iniciando sesion");
}



// 5. Verificar Método GET
if ($_SERVER['REQUEST_METHOD'] != 'GET') {
    http_response_code(405);
    // ¡Añadir Content-Type aquí también para errores!
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(["error" => "Método no permitido. Use GET."]);
    $conn = null; exit();
}

// --- INICIO SECCIÓN PROTEGIDA ---

// 6. Verificar si hay Sesión Activa
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json; charset=UTF-8'); // Añadir Content-Type    
    echo json_encode(["error" => "Acceso no autorizado. Inicie sesión."]);
    $conn = null;     
    exit();
}

// 7. Obtener datos del usuario de la sesión
$userId = $_SESSION['user_id'];
$userRole = $_SESSION['user_role'] ?? null; // Obtener rol (null si no está)
error_log("SESION: " . print_r($_SESSION, true));
// --- DEBUGGING TEMPORAL ---
error_log("DEBUG read_cita.php: User ID = $userId, Role = '$userRole'");
// --- FIN DEBUGGING ---

$allowedRoles = ['admin', 'barbero', 'cliente']; 
if (!isset($userRole) || !in_array($userRole, $allowedRoles, true)) {
    http_response_code(403); // Forbidden
    header('Content-Type: application/json; charset=UTF-8'); // Añadir Content-Type
    // Devuelve más info para depurar
    $requiredRolesString = implode(', ', $allowedRoles); // Une los roles permitidos con comas
        $roleInSession = $userRole ?? 'NO DEFINIDO'; // Obtiene rol o 'NO DEFINIDO'

        // Devuelve el JSON de error
        echo json_encode([
            "error" => "Permiso denegado para ver esta información.",
            "info" => "Rol requerido: uno de [" . $requiredRolesString . "]. Rol en sesión: '" . $roleInSession . "'."
        ]);

        $conn = null; // Cierra conexión si existe
        exit();
}

// --- Lógica para Construir Consulta SQL basada en Rol ---

$whereClauses = []; // Array para condiciones WHERE
$params = [];       // Array para parámetros PDO

// **¡FILTRADO BASADO EN ROL!**

switch ($userRole) {
    case 'admin':
        // El Admin puede ver todo. Puede usar filtros GET opcionales.
        // No añadimos filtro obligatorio por ID de usuario.
        break; // Continuar para añadir filtros GET si los hay

    case 'cliente':
        // El Cliente SOLO ve SUS citas.
        $whereClauses[] = "c.cliente_id = :sessionUserId"; // Condición obligatoria
        $params[':sessionUserId'] = $userId;
        break; // Continuar para añadir filtros GET *sobre sus citas*

    case 'barbero':
        // El Barbero SOLO ve SUS citas asignadas.
        $whereClauses[] = "c.barbero_id = :sessionUserId"; // Condición obligatoria
        $params[':sessionUserId'] = $userId;
        break; // Continuar para añadir filtros GET *sobre sus citas*

    default:
        // Rol desconocido o no permitido para ver citas
        http_response_code(403); // Forbidden
        echo json_encode(["error" => "Rol no válido o sin permisos para ver citas."]);
        $conn = null;
        exit();
}

// **Añadir Filtros Opcionales de $_GET (Combinados con Rol)**

// Filtrado por cliente_id (Solo si es Admin, si no, ya se filtró por sesión)
if ($userRole === 'admin' && isset($_GET['cliente_id']) && !empty($_GET['cliente_id'])) {
    $whereClauses[] = "c.cliente_id = :get_cliente_id";
    $params[':get_cliente_id'] = $_GET['cliente_id'];
}

// Filtrado por barbero_id (Solo si es Admin)
if ($userRole === 'admin' && isset($_GET['barbero_id']) && !empty($_GET['barbero_id'])) {
    $whereClauses[] = "c.barbero_id = :get_barbero_id";
    $params[':get_barbero_id'] = $_GET['barbero_id'];
}

// Filtrado por fecha (Todos los roles pueden filtrar sus citas por fecha)
if (isset($_GET['fecha_inicio']) && !empty($_GET['fecha_inicio'])) {
    // Podrías querer filtrar por rango (BETWEEN) o solo día (DATE())
    $whereClauses[] = "DATE(c.fecha_inicio) = :get_fecha_inicio"; // Filtra por día exacto
    $params[':get_fecha_inicio'] = $_GET['fecha_inicio']; // Espera YYYY-MM-DD
}



// Filtrado por estado (Todos los roles pueden filtrar sus citas por estado)
if (isset($_GET['estado']) && !empty($_GET['estado'])) {
    $whereClauses[] = "c.estado = :get_estado";
    $params[':get_estado'] = $_GET['estado'];
}

// --- Construir y Ejecutar Consulta Final ---

// Consulta SQL Base (AJUSTA COLUMNAS Y JOINS)
$sql = "SELECT
            c.*,
            u1.username AS cliente_nombre,
            u2.username AS barbero_nombre
        FROM citas c
        LEFT JOIN usuarios u1 ON c.cliente_id = u1.id
        LEFT JOIN usuarios u2 ON c.barbero_id = u2.id";

// Añadir cláusula WHERE si hay condiciones
if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

// Añadir ordenamiento
$sql .= " ORDER BY c.fecha_inicio ASC";

// Ejecutar con manejo de errores
try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params); // Pasar el array de parámetros
    $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formateo final (igual que antes)
    $citas_formateadas = array_map(function ($cita) { /* ... formateo ... */
        return $cita; }, $citas);

    echo json_encode($citas_formateadas);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Error PDO read_cita (rol check): " . $e->getMessage());
    echo json_encode(["error" => "Error interno al leer citas."]);
} finally {
    $conn = null; // Cerrar conexión
}
exit();
?>