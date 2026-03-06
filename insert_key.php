<?php
$pdo = new PDO('mysql:host=db5019545004.hosting-data.io;port=3306;dbname=dbs15269470;charset=utf8mb4', 'dbu4443655', '$Etudes.psych@.2025$');
$id = uniqid('cus_');
$stmt = $pdo->prepare('INSERT INTO Customer (id, email, firstName, lastName, licenseKey) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$id, 'test-biz@elazya.com', 'Test', 'Business', 'ELAZYA-BIZ-A1B2-C3D4']);
echo "Insert success\n";
?>
