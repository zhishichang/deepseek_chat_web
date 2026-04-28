#!/bin/bash
# ============================================================
# DeepSeek Chat Web - 阿里云 Ubuntu 22.04 服务器初始化脚本
# 用法: sudo bash server-setup.sh
# ============================================================

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# ---- 配置 ----
REPO_URL="https://github.com/zhishichang/deepseek_chat_web.git"
INSTALL_DIR="/opt/deepseek_chat_web"
NODE_VERSION="20"

# ---- 检查 root 权限 ----
if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 运行此脚本: sudo bash server-setup.sh"
  exit 1
fi

# ---- 1. 更新系统 ----
info "更新系统软件包..."
apt update && apt upgrade -y

# ---- 2. 安装基础工具 ----
info "安装基础工具 (git, curl, build-essential)..."
apt install -y git curl build-essential

# ---- 3. 安装 Node.js 20 ----
info "安装 Node.js ${NODE_VERSION}..."
if command -v node &> /dev/null; then
  warn "Node.js 已安装: $(node -v)，跳过安装"
else
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt install -y nodejs
  info "Node.js $(node -v) 安装完成"
fi

# ---- 4. 安装 pm2 ----
info "安装 pm2 进程管理器..."
if command -v pm2 &> /dev/null; then
  warn "pm2 已安装，跳过"
else
  npm install -g pm2
  info "pm2 安装完成"
fi

# ---- 5. 安装 nginx ----
info "安装 nginx..."
if command -v nginx &> /dev/null; then
  warn "nginx 已安装，跳过"
else
  apt install -y nginx
  systemctl enable nginx
  systemctl start nginx
  info "nginx 安装完成"
fi

# ---- 6. 克隆项目 ----
info "克隆项目到 ${INSTALL_DIR}..."
if [ -d "$INSTALL_DIR" ]; then
  warn "目录已存在，拉取最新代码..."
  cd "$INSTALL_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ---- 7. 安装依赖并构建 ----
info "安装 npm 依赖..."
npm ci

info "构建前端..."
npm run build

# ---- 8. 创建 .env 文件 ----
if [ ! -f "$INSTALL_DIR/.env" ]; then
  info "创建 .env 配置文件..."
  cat > "$INSTALL_DIR/.env" << 'EOF'
DEEPSEEK_API_KEY=your_api_key_here
PORT=3001
EOF
  warn "请编辑 ${INSTALL_DIR}/.env 填入你的 DEEPSEEK_API_KEY"
else
  warn ".env 文件已存在，跳过创建"
fi

# ---- 9. 配置 nginx ----
info "配置 nginx 反向代理..."
cp "$INSTALL_DIR/scripts/nginx.conf" /etc/nginx/sites-available/deepseek-chat-web
ln -sf /etc/nginx/sites-available/deepseek-chat-web /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
info "nginx 配置完成"

# ---- 10. 启动 pm2 ----
info "使用 pm2 启动应用..."
cd "$INSTALL_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
info "pm2 配置完成，已设置开机自启"

# ---- 完成 ----
echo ""
echo "=========================================="
info "部署完成!"
echo "=========================================="
echo ""
echo "后续操作:"
echo "  1. 编辑 .env:  nano ${INSTALL_DIR}/.env"
echo "  2. 重启应用:  pm2 restart deepseek-chat-web"
echo "  3. 查看日志:  pm2 logs deepseek-chat-web"
echo "  4. 查看状态:  pm2 status"
echo ""
echo "访问: http://$(curl -s ifconfig.me 2>/dev/null || echo '你的服务器IP')"
echo ""
