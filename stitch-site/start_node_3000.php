<?php
$cmd = 'cd ' . __DIR__ . '/elazya-server && env PORT=3000 NODE_ENV=production nohup node server.js > stdout.log 2> stderr.log & echo $!';
$pid = shell_exec($cmd);
echo "Attempted to start Node.js server on port 3000. PID: " . $pid;
?>
