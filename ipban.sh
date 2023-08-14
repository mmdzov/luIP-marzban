#!/bin/bash

declare -A blocked_ips

SSH_PORT=$3
BLOCK_TIME_MINUTES=$2
BLOCK_TIME_SECONDS=$((BLOCK_TIME_MINUTES * 60))

function block_ip() {
  local ip=$1
  local end_time=$(( $(date +%s) + BLOCK_TIME_SECONDS ))

  if iptables -C INPUT -s $ip -p tcp --dport $SSH_PORT -j DROP &> /dev/null; then
    iptables -D INPUT -s $ip -p tcp --dport $SSH_PORT -j DROP
  fi

  blocked_ips[$ip]=$end_time

  iptables -A INPUT -s $ip -p tcp --dport $SSH_PORT -j DROP
}

block_ip $1