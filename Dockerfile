# 使用 Node 官方镜像作为基础镜像
FROM node:14

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建 React 前端应用
RUN npm run build

# 暴露端口
EXPOSE 3001

# 运行后端服务
CMD ["node", "server.js"]
