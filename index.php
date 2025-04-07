<?php
// Cabeceras (Esenciales para JSON)
header("Access-Control-Allow-Origin: *"); // Ok para dev, ajustar en prod
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejo de solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "root";
$password = ""; // Contraseña de conexión a BD
$database = "barberiamvp";

// Conexión (Esencial)
$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    // Devolver error JSON
    die(json_encode(["error" => "Error de conexión DB: " . $conn->connect_error]));
}
mysqli_set_charset($conn, "utf8");

$accion = isset($_REQUEST['accion']) ? $_REQUEST['accion'] : null;

// --- GET: Listar Admin (Devuelve JSON) ---
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    error_log("Valor de accion recibido: " . $accion);
    if ($accion == 'listar_admin') {
        // Incluye el 'id' por si se usa como identificador en el futuro
        $sql = "SELECT id, username, email, telefono, direccion, fecha_nacimiento, genero FROM usuarios WHERE rol = 'admin' LIMIT 1";
        $result = $conn->query($sql);
        // Chequeo de error en consulta
        if ($result === false) {
            http_response_code(500);
            echo json_encode(["error" => "Error en consulta GET: " . $conn->error]);
        } elseif ($result->num_rows > 0) {
            // Éxito, devuelve datos
            echo json_encode($result->fetch_assoc());
        } else {
            // No encontrado, devuelve null (Angular lo manejará)
            echo json_encode(null);
        }

    }
    //listar usuarios 
    elseif ($accion == 'listar_usuarios') {
        $sql = "SELECT id, username, email, telefono, rol, estado FROM usuarios";
        $result = $conn->query($sql);
        $usuarios = [];
        if ($result === false) {
            http_response_code(500);
            echo json_encode(["error" => "Error en consulta listar_usuarios: " . $conn->error]);
        } elseif ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $row['id'] = intval($row['id']);
                $usuarios[] = $row;
            }
            echo json_encode($usuarios);
        } else {
            echo json_encode($usuarios); // Devuelve []
        }
        // No cerramos conexión aquí
    }
    //listar roles para no cargarlos como texto plano sino desde la BD
    elseif ($accion == 'listar_roles') {
        $sql = "SHOW COLUMNS FROM usuarios LIKE 'rol'";
        $result = $conn->query($sql);
        $roles = []; // Array para guardar los roles

        if ($result === false) {
            http_response_code(500);
            echo json_encode(["error" => "Error en consulta SHOW COLUMNS: " . $conn->error]);
        } elseif ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $type = $row['Type']; // Obtiene algo como "enum('admin','barbero','cliente')"

            // Usar expresión regular para extraer los valores dentro de los paréntesis y comillas
            preg_match('/^enum\((.*)\)$/', $type, $matches);
            if (isset($matches[1])) {
                // $matches[1] será "'admin','barbero','cliente'"
                // Usar str_getcsv para separar por comas y quitar comillas
                $roles = str_getcsv($matches[1], ',', "'");
                // Limpiar espacios extra si los hubiera (aunque str_getcsv suele manejarlo)
                $roles = array_map('trim', $roles);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "No se pudo parsear la definición ENUM del campo 'rol'."]);
                $conn->close();
                exit();
            }
            echo json_encode($roles); // Devuelve ["admin", "barbero", "cliente"]
        } else {
            // Si no se encontró la columna 'rol' (muy improbable)
            http_response_code(404);
            echo json_encode(["error" => "No se encontró la columna 'rol' en la tabla 'usuarios'."]);
        }
        // No cerramos conexión aquí
    }
    //listar citas 
    elseif ($accion == 'listarCitas') {

        $sql = "SELECT
                c.id,
                c.cliente_id,
                c.barbero_id,
                c.servicio_id,
                c.sucursal_id,
                c.fecha_inicio,
                c.fecha_fin,
                c.estado,
                c.notas,
                s.nombre AS servicio_nombre,
                u_cliente.username AS cliente_nombre,
                u_barbero.username AS barbero_nombre
            FROM citas c
            JOIN servicios s ON c.servicio_id = s.id
            JOIN usuarios u_cliente ON c.cliente_id = u_cliente.id
            JOIN usuarios u_barbero ON c.barbero_id = u_barbero.id";
        $result = $conn->query($sql);
        $citas = array();
        if ($conn->error) {
            error_log("consulta sql " . $sql);
        }
        if ($result === false) {
            http_response_code(500);
            echo json_encode(["error" => "Error en consulta listarCitas: " . $conn->error]);
        } elseif ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $citas[] = array(
                    'id' => intval($row['id']),
                    'cliente_id' => intval($row['cliente_id']),
                    'barbero_id' => intval($row['barbero_id']),
                    'servicio_id' => intval($row['servicio_id']),
                    'sucursal_id' => intval($row['sucursal_id']),
                    'fecha_inicio' => $row['fecha_inicio'],
                    'fecha_fin' => $row['fecha_fin'],
                    'estado' => $row['estado'],
                    'notas' => $row['notas'],
                    'servicio_nombre' => $row['servicio_nombre'],
                    'cliente_nombre' => $row['cliente_nombre'],
                    'barbero_nombre' => $row['barbero_nombre']
                );
            }
            header('Content-Type: application/json');
            echo json_encode($citas);
        } else {
            echo json_encode([]); // Devuelve un array vacío si no hay citas
        }
    } elseif ($accion == 'listarClientes') {
        $sql = "SELECT id, username FROM usuarios WHERE rol = 'cliente'";
        $result = $conn->query($sql);
        $clientes = array();
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $clientes[] = $row;
            }
        }
        echo json_encode($clientes);
    } elseif ($accion == 'listarBarberos') {
        $sql = "SELECT id, username FROM usuarios WHERE rol = 'barbero'";
        $result = $conn->query($sql);
        $barberos = array();
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $barberos[] = $row;
            }
        }
        echo json_encode($barberos);
    } elseif ($accion == 'listarSucursales') {
        $sql = "SELECT id, nombre FROM sucursales";
        $result = $conn->query($sql);
        $sucursales = array();
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $sucursales[] = $row;
            }
        }
        echo json_encode($sucursales);
    } elseif ($accion == 'listarServiciosPorSucursal') {
        if (isset($_GET['sucursal_id'])) {
            $sucursal_id = intval($_GET['sucursal_id']);
            $sql = "SELECT s.id, s.nombre
                    FROM servicios s
                    JOIN servicios_sucursal ss ON s.id = ss.servicio_id
                    WHERE ss.sucursal_id = ? AND ss.disponible = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $sucursal_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $servicios = array();
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $servicios[] = $row;
                }
            }
            echo json_encode($servicios);
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Se requiere el parámetro sucursal_id"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Accion GET no reconocida"]);
        $conn->close();
        exit();
    }
}
// --- POST: Actualizar Admin (Versión SEGURA con password_hash) ---
elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    error_log("Valor de accion recibido: " . $accion);
    if ($accion == 'actualizar_admin') {
        // Leer cuerpo JSON
        $data = json_decode(file_get_contents("php://input"));

        // Validar JSON recibido
        if (!$data) {
            http_response_code(400);
            die(json_encode(["error" => "Error al decodificar JSON recibido."]));
        }

        // Validar datos esenciales
        if (!isset($data->email_original) || !isset($data->email) || !isset($data->username)) {
            http_response_code(400);
            die(json_encode(["error" => "Faltan datos esenciales (email_original, email, username)"]));
        }

        // Asignar variables
        $email_original = $data->email_original;
        $username = $data->username;
        $email = $data->email;
        $telefono = $data->telefono ?? null;
        $direccion = $data->direccion ?? null;
        $fecha_nacimiento = $data->fechaNacimiento ?? null; // Asegúrate que Angular envíe 'fechaNacimiento'
        $genero = $data->genero ?? null;

        $hashedNewPassword = null; // Para el nuevo hash
        $updatePasswordSql = "";   // Fragmento SQL condicional
        $passwordCheckRequired = isset($data->newPassword) && !empty($data->newPassword); // ¿Intenta cambiar contraseña?

        // Lógica SEGURA de contraseña si es necesario
        if ($passwordCheckRequired) {
            if (!isset($data->password) || empty($data->password)) {
                http_response_code(400);
                die(json_encode(["error" => "Contraseña actual requerida para cambiarla"]));
            }

            // Usar nombre de columna correcto 'password_hash'
            $stmt_check = $conn->prepare("SELECT password_hash FROM usuarios WHERE email = ? AND rol = 'admin'");
            if (!$stmt_check) { // Chequear error prepare
                http_response_code(500);
                die(json_encode(["error" => "Error al preparar verificación pwd: " . $conn->error]));
            }
            $stmt_check->bind_param("s", $email_original);
            if (!$stmt_check->execute()) { // Chequear error execute
                http_response_code(500);
                die(json_encode(["error" => "Error al ejecutar verificación pwd: " . $stmt_check->error]));
            }
            $result_check = $stmt_check->get_result();
            if ($user = $result_check->fetch_assoc()) {
                // Usar nombre de columna correcto 'password_hash' y verificar
                if (password_verify($data->password, $user['password_hash'])) {
                    // Contraseña actual OK, hashear la nueva
                    $hashedNewPassword = password_hash($data->newPassword, PASSWORD_DEFAULT);
                    if ($hashedNewPassword === false) { // Chequear error hash
                        http_response_code(500);
                        die(json_encode(["error" => "Error al hashear nueva contraseña"]));
                    }
                    // Usar nombre de columna correcto 'password_hash'
                    $updatePasswordSql = ", password_hash = ?";
                } else {
                    // Contraseña actual incorrecta
                    http_response_code(400);
                    die(json_encode(["error" => "Contraseña actual incorrecta"]));
                }
            } else {
                // Usuario no encontrado con ese email_original
                http_response_code(404);
                die(json_encode(["error" => "Usuario no encontrado para verificar pwd"]));
            }
            $stmt_check->close(); // Corregido typo
        }

        // Preparar sentencia UPDATE
        // Usar nombre de columna correcto 'password_hash' en {$updatePasswordSql}
        $sql = "UPDATE usuarios SET username = ?, email = ?, telefono = ?, direccion = ?, fecha_nacimiento = ?, genero = ? {$updatePasswordSql} WHERE email = ? AND rol = 'admin'";
        $stmt = $conn->prepare($sql);
        if (!$stmt) { // Chequear error prepare
            http_response_code(500);
            die(json_encode(["error" => "Error al preparar UPDATE: " . $conn->error]));
        }

        // Bind parameters (el número y tipos dependen de si se cambia la contraseña)
        if ($passwordCheckRequired) { // 8 parámetros si se incluye la nueva contraseña hasheada
            $bindResult = $stmt->bind_param("ssssssss", $username, $email, $telefono, $direccion, $fecha_nacimiento, $genero, $hashedNewPassword, $email_original);
        } else { // 7 parámetros si no se cambia contraseña
            $bindResult = $stmt->bind_param("sssssss", $username, $email, $telefono, $direccion, $fecha_nacimiento, $genero, $email_original);
        }
        if ($bindResult === false) { // Chequear error bind
            http_response_code(500);
            die(json_encode(["error" => "Error al vincular parámetros UPDATE: " . $stmt->error]));
        }

        // Ejecutar sentencia
        if ($stmt->execute()) {
            // Éxito
            echo json_encode(["mensaje" => "Perfil actualizado correctamente."]);
        } else {
            // Error al ejecutar
            http_response_code(500);
            // Salida de error JSON
            die(json_encode(["error" => "Error DB UPDATE: " . $stmt->error]));
        }
        $stmt->close();

    } elseif ($accion == 'actualizar_estado_cita') {
        error_log("Datos recibidos para actualizar_estado_cita:");

        // Decodificar el cuerpo de la petición JSON
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true); // El 'true' lo convierte a un array asociativo

        error_log("Datos JSON decodificados:");
        error_log(print_r($data, true)); // Loguea los datos JSON decodificados

        if (isset($data['id']) && isset($data['estado'])) {
            $id = intval($data['id']);
            $estado = $conn->real_escape_string($data['estado']);

            error_log("ID: " . $id . ", Estado: " . $estado);

            $sql = "UPDATE citas SET estado = '$estado' WHERE id = $id";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al actualizar el estado: " . $conn->error]);
            }
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(["error" => "Faltan los parámetros 'id' o 'estado' en la petición POST (JSON)."]);
        }
    } elseif ($accion == 'agregar_cita') {
        // Leer el cuerpo de la petición JSON
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if ($data) {
            // Asegúrate de que los campos necesarios estén presentes
            if (isset($data['cliente_id']) && isset($data['barbero_id']) && isset($data['servicio_id']) && isset($data['sucursal_id']) && isset($data['fecha_inicio']) && isset($data['fecha_fin']) && isset($data['estado']) && isset($data['notas'])) {

                $cliente_id = intval($data['cliente_id']);
                $barbero_id = intval($data['barbero_id']);
                $servicio_id = intval($data['servicio_id']);
                $sucursal_id = intval($data['sucursal_id']);
                $fecha_inicio = $conn->real_escape_string($data['fecha_inicio']);
                $fecha_fin = $conn->real_escape_string($data['fecha_fin']);
                $estado = isset($data['estado']) ? $conn->real_escape_string($data['estado']) : 'pendiente';
                $notas = isset($data['notas']) ? $conn->real_escape_string($data['notas']) : '';


                $sql = "INSERT INTO citas (cliente_id, barbero_id, servicio_id, sucursal_id, fecha_inicio, fecha_fin, estado, notas)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

                $stmt = $conn->prepare($sql);
                if ($stmt) {
                    $stmt->bind_param("iiiissss", $cliente_id, $barbero_id, $servicio_id, $sucursal_id, $fecha_inicio, $fecha_fin, $estado, $notas);

                    if ($stmt->execute()) {
                        $nueva_cita_id = $conn->insert_id;
                        echo json_encode(["success" => true, "id" => $nueva_cita_id, "message" => "Cita agregada exitosamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Error al agregar la cita: " . $stmt->error]);
                    }
                    $stmt->close();
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
                }

            } else {
                http_response_code(400);
                echo json_encode(["error" => "Faltan campos obligatorios para agregar la cita (cliente_id, barbero_id, servicio_id, sucursal_id, fecha_inicio, fecha_fin)."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Error al decodificar los datos JSON de la petición."]);
        }
    } elseif ($accion == 'reprogramar_cita') {
        // Leer el cuerpo de la petición JSON
        $json_data = file_get_contents('php://input');
        $data = json_decode($json_data, true);

        if ($data && isset($data['id']) && isset($data['fecha_inicio']) && isset($data['fecha_fin'])) {
            $id = intval($data['id']);
            $fecha_inicio = $conn->real_escape_string($data['fecha_inicio']);
            $fecha_fin = $conn->real_escape_string($data['fecha_fin']);

            $sql = "UPDATE citas SET fecha_inicio = ?, fecha_fin = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("ssi", $fecha_inicio, $fecha_fin, $id);
                if ($stmt->execute()) {
                    echo json_encode(["success" => true, "message" => "Cita reprogramada exitosamente"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al reprogramar la cita: " . $stmt->error]);
                }
                $stmt->close();
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Faltan datos obligatorios para reprogramar la cita (id, start, end)."]);
        }
    } else {
        // Acción POST no reconocida
        http_response_code(404);
        echo json_encode(["error" => "Accion POST no reconocida"]);
    }
}

// Cerrar conexión al final si no se hizo antes
if ($conn) {
    $conn->close();
}
?>