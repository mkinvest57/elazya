<?php
// Start Node.js server via PHP
// This bypasses SSH session limits
$cmd = 'cd ' . __DIR__ . '/elazya-server && nohup node server.js > stdout.log 2> stderr.log & echo $!';
$pid = shell_exec($cmd);
echo "Attempted to start Node.js server. PID: " . $pid;
?>
