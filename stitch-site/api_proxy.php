<?php
$request_uri = $_SERVER['REQUEST_URI'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:3001" . $request_uri);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

// Forward request headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward POST data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Forward response headers
$responseHeaders = curl_getinfo($ch);
http_response_code($httpCode);
header("Content-Type: " . ($responseHeaders['content_type'] ?? 'application/json'));

echo $response;
curl_close($ch);
?>
