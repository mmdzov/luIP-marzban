#!/bin/bash

declare -A blocked_ips

function check_ip() {
  local ip=$1
  local current_time=$(date +%s)
  local block_time_minutes=${blocked_ips[$ip]}
  local block_time_seconds=$((block_time_minutes * 60))
  local end_time=$((block_time_seconds + current_time))

  if ((current_time >= end_time)); then
    unset blocked_ips[$ip]

    if iptables -C INPUT -s $ip -j DROP &> /dev/null; then
      iptables -D INPUT -s $ip -j DROP
      echo "Unbanned IP: $ip"
    fi
  fi
}

source ./ipban.sh

for ip in "${!blocked_ips[@]}"; do
  check_ip $ip
done