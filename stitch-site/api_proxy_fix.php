<?php
$request_uri = $_SERVER['REQUEST_URI'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:3000" . $request_uri);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host' && strtolower($name) !== 'content-length') {
        $headers[] = "$name: $value";
    }
}
$headers[] = "Host: 127.0.0.1";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    http_response_code(502);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Proxy Error", "curl_error" => curl_error($ch)]);
} else {
    $responseHeaders = curl_getinfo($ch);
    http_response_code($httpCode);
    if (isset($responseHeaders['content_type'])) {
        header("Content-Type: " . $responseHeaders['content_type']);
    }
    echo $response;
}
curl_close($ch);
?>
