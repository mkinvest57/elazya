#!/bin/bash
echo "Args: $@" >> /tmp/sidecar.log
echo "Dirname: $(dirname "$0")" >> /tmp/sidecar.log
echo "Pwd: $PWD" >> /tmp/sidecar.log
