module.exports = {
  apps: [{
    name: 'deepseek-chat-web',
    script: 'server/src/index.js',
    cwd: '/opt/deepseek_chat_web',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // 进程崩溃自动重启
    autorestart: true,
    // 内存超过 256MB 自动重启（防内存泄漏）
    max_memory_restart: '256M',
    // 最大重启次数（防止无限重启循环）
    max_restarts: 10,
    restart_delay: 3000,
    // 日志配置
    error_file: '/var/log/deepseek-chat-web/error.log',
    out_file: '/var/log/deepseek-chat-web/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
