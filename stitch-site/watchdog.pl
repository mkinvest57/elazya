#!/usr/bin/perl
use strict;
use warnings;
use POSIX qw(setsid);

chdir '/home/www/elazya-server' or die "Can't chdir: $!";
umask 0;

open STDIN, '/dev/null' or die "Can't read /dev/null: $!";
open STDOUT, '>>watchdog.log' or die "Can't write to watchdog.log: $!";
open STDERR, '>>watchdog_err.log' or die "Can't write to watchdog_err.log: $!";

defined(my $pid = fork) or die "Can't fork: $!";
exit if $pid;

setsid or die "Can't start a new session: $!";

while (1) {
    print "Starting Node.js server...\n";
    # Use system() to wait for it to finish
    system('node', '--max-old-space-size=256', 'server.js');
    print "Server exited (code $?). Restarting in 5 seconds...\n";
    sleep 5;
}
