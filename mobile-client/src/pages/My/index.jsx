import React from 'react';

const My = () => {
  // 这里可以根据登录状态展示用户信息、订单等
  return (
    <div style={{ padding: '16px' }}>
      <h2>我的</h2>
      <div style={{ margin: '24px 0' }}>
        <p>欢迎来到个人中心！</p>
        {/* 这里可以扩展：展示用户信息、订单列表、退出登录等 */}
      </div>
    </div>
  );
};

export default My;
