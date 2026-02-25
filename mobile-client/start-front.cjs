const { execSync } = require('child_process');
try {
    console.log("正在尝试在 3001 端口启动前端...");
    // 将 80 改为 3001
    execSync('npx serve -s dist -l 3001', { stdio: 'inherit' });
} catch (e) {
    console.error("启动失败:", e.message);
}