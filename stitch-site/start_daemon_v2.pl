#!/usr/bin/perl
use strict;
use warnings;
use POSIX qw(setsid);

chdir '/home/www/elazya-server' or die "Can't chdir: $!";
umask 0;

open STDIN, '/dev/null' or die "Can't read /dev/null: $!";
open STDOUT, '>>stdout.log' or die "Can't write to stdout.log: $!";
open STDERR, '>>stderr.log' or die "Can't write to stderr.log: $!";

defined(my $pid = fork) or die "Can't fork: $!";
exit if $pid;

setsid or die "Can't start a new session: $!";

# Replace current process with Node
exec 'node', '--max-old-space-size=256', 'server.js' or die "Can't exec: $!";
