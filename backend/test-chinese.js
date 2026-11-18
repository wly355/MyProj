const axios = require('axios');

async function test() {
  try {
    // 登录获取token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ 登录成功');
    
    // 提交中文反馈
    const feedbackRes = await axios.post('http://localhost:3000/api/user/feedback', {
      content: '这是一个测试反馈,测试中文是否正常显示'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    
    console.log('✅ 反馈提交成功:', feedbackRes.data);
    
    // 获取反馈列表
    const listRes = await axios.get('http://localhost:3000/api/user/feedbacks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 反馈列表:');
    console.log(JSON.stringify(listRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

test();

