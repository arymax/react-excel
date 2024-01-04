#!/bin/sh

# 获取容器的 IP 地址
CONTAINER_IP=$(ip addr | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d'/' -f1)

# 打印获取到的 IP 地址
echo "容器的IP是 $CONTAINER_IP"

# 在这里可以添加更多的操作，比如修改配置文件或执行其他命令
