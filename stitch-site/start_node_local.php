<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$cmd = 'cd /home/www/elazya-server && ./start.sh';
shell_exec($cmd);
echo "Node server started via start.sh! PID: " . getmypid();
?>
