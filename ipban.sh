#!/bin/bash

declare -A blocked_ips

BLOCK_TIME_MINUTES=$2
BLOCK_TIME_SECONDS=$((BLOCK_TIME_MINUTES * 60))

function block_ip() {
  local ip=$1
  local end_time=$(( $(date +%s) + BLOCK_TIME_SECONDS ))

  if iptables -C INPUT -s $ip -j DROP &> /dev/null; then
    iptables -D INPUT -s $ip -j DROP
  fi

  blocked_ips[$ip]=$end_time

  iptables -A INPUT -s $ip -j DROP
}

function check_ips() {
  local current_time=$(date +%s)

  for ip in "${!blocked_ips[@]}"; do
    local end_time=${blocked_ips[$ip]}

    if ((current_time >= end_time)); then
      unset blocked_ips[$ip]

      if iptables -C INPUT -s $ip -j DROP &> /dev/null; then
        iptables -D INPUT -s $ip -j DROP
      fi
    fi
  done
}

block_ip $1
check_ips