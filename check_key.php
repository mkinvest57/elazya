<?php
$pdo = new PDO('mysql:host=db5019545004.hosting-data.io;port=3306;dbname=dbs15269470;charset=utf8mb4', 'dbu4443655', '$Etudes.psych@.2025$');
$stmt = $pdo->query("SELECT email, licenseKey FROM Customer WHERE email LIKE '%biz%'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
