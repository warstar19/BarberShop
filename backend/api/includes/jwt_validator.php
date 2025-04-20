<?php
// Incluir autoloader y config ANTES de definir la función
require_once __DIR__ . '/../../vendor/autoload.php'; // Ruta desde includes a backend/vendor
require_once __DIR__ . '/../config/config.php';     // Ruta desde includes a config

// Usar clases JWT
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;
use \Firebase\JWT\ExpiredException;
use \Firebase\JWT\SignatureInvalidException;
use \Firebase\JWT\BeforeValidException;

/**
 * Valida el token JWT de la cabecera Authorization.
 * Devuelve el payload->data decodificado si es válido, o termina con error si no.
 * @return object Los datos del usuario contenidos en $payload->data.
 */
function validarTokenJWT()
{
    // Código para obtener $authHeader (igual que en la respuesta anterior)
    $authHeader = null;
    if (isset($_SERVER['Authorization'])) { /* ... */
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) { /* ... */
    } elseif (function_exists('apache_request_headers')) { /* ... */
    }

    if (!$authHeader) { /* ... error 401 ... */
    }

    // Código para extraer $jwt de "Bearer <token>" (igual que antes)
    $arr = explode(" ", $authHeader);
    if (count($arr) != 2 || $arr[0] !== 'Bearer') { /* ... error 401 ... */
    }
    $jwt = $arr[1];
    if (!$jwt) { /* ... error 401 ... */
    }

    try {
        // Decodificar y validar usando la clave secreta de config.php
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));

        if (!isset($decoded->data)) {
            throw new Exception("Payload de token inválido.");
        }
        // ¡Éxito! Devuelve la información del usuario
        return $decoded->data;

    } catch (ExpiredException $e) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["error" => "Acceso no autorizado (Token expirado).", "code" => "TOKEN_EXPIRED"]);
    } catch (SignatureInvalidException $e) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["error" => "Acceso no autorizado (Firma inválida)."]);
    } catch (BeforeValidException $e) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(["error" => "Acceso no autorizado (Token aún no válido)."]);
    } catch (Exception $e) { // Otras excepciones
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        error_log("Error validando token: " . $e->getMessage());
        echo json_encode(["error" => "Acceso no autorizado (Token inválido)."]);
    }
    exit(); // Termina si hubo error
}
?>