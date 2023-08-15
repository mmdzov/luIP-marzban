#!/bin/bash

BLOCK_TIME_MINUTES=$2
BLOCK_TIME_SECONDS=$((BLOCK_TIME_MINUTES * 60))

CSV_FILE="blocked_ips.csv"

function block_ip() {
  local ip=$1
  local end_time=$(( $(date +%s) + BLOCK_TIME_SECONDS ))

  if iptables -C INPUT -s $ip -j DROP &> /dev/null; then
    iptables -D INPUT -s $ip -j DROP
  fi

  echo "$ip,$end_time" >> "$CSV_FILE"

  iptables -A INPUT -s $ip -j DROP
}

block_ip $1