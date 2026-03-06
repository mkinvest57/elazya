<?php
$file = 'elazya/license-api/validate-license.php';
$content = file_get_contents($file);
if (strpos($content, 'Access-Control-Allow-Origin') === false) {
    $cors = "header('Access-Control-Allow-Origin: *');\nheader('Access-Control-Allow-Methods: POST, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type');\nif (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }\n";
    $content = str_replace('header("Content-Type: application/json");', "header('Content-Type: application/json');\n" . $cors, $content);
    file_put_contents($file, $content);
    echo "Fixed CORS headers\n";
} else {
    echo "CORS headers already present\n";
}
?>
