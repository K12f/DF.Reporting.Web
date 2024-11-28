# 使用 Node.js 官方镜像
FROM node:lts-alpine3.20 as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到容器中
COPY package.json ./

RUN npm config set registry https://registry.npmmirror.com
# 安装依赖
RUN npm install -g pnpm && pnpm i

# 复制代码并构建
COPY . .
# 构建 Next.js 应用
RUN pnpm build
RUN ls -la

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
