// ------------------ 网站运行时间统计 ------------------

// 域名判断
if (window.location.hostname !== 'shli.io') {
    console.warn('网站运行时间统计脚本未授权的域名，停止执行');
} else {
    // 1. 设置网站启动时间（可以根据实际修改）
    const startTime = new Date('2024-11-28'); // 网站上线时间

    // 2. 将时间差格式化为字符串
    function formatRuntime(diff) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24)); // 天数
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24); // 小时数
        const minutes = Math.floor((diff / (1000 * 60)) % 60); // 分钟数
        const seconds = Math.floor((diff / 1000) % 60); // 秒数
        return `专业服务， 技术先行；网站已运行${days}天${hours}小时${minutes}分${seconds}秒`;
    }

    // 3. 更新运行时间
    function updateRuntime() {
        const now = new Date();
        const diff = now - startTime;
        window.CustomDesc = formatRuntime(diff);
    }

    // 4. 初始化并每秒更新一次
    updateRuntime();
    setInterval(updateRuntime, 1000);
}
