<template>
  <div class="about-page">

    <el-card>
  
      <template #header>
        <span>关于我们</span>
      </template>
   
      <div class="content">
      
        <div v-html="content"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 使用 ref 创建响应式变量存储关于页面的富文本内容
const content = ref(`
  <h2>欢迎使用天气预报查询系统</h2>
  <p>本系统提供以下功能：</p>
  <ul>
    <li>实时天气查询 - 获取全国各地实时天气信息</li>
    <li>7天天气预报 - 查看未来一周天气趋势</li>
    <li>多城市管理 - 添加常用城市,快速查询</li>
    <li>个性化设置 - 自定义温度单位和界面主题</li>
    <li>用户反馈 - 提交问题和建议,我们会及时处理</li>
  </ul>
  <p><strong>系统版本：</strong>1.0.0</p>
  <p><strong>数据来源：</strong>和风天气API</p>
  <p><strong>技术支持：</strong>天气预报查询系统团队</p>
  <p style="margin-top: 24px; color: #909399;">如有任何问题或建议,欢迎通过反馈页面联系我们!</p>
`)
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 960px;
  margin: 0 auto; // 水平居中

  // 使用 :deep 选择器穿透 scoped 样式，修改子组件样式
  :deep(.el-card) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); // 卡片阴影

    .el-card__header {
      background: #f5f7fa; // 头部背景色
      padding: 16px 24px;
      border-bottom: 1px solid #e4e7ed; // 底部边框

      span {
        font-size: 18px;
        font-weight: 600;
        color: #303133; // 主要文字颜色
      }
    }

    .el-card__body {
      padding: 32px 24px;
    }
  }
}

.content {
  line-height: 1.8; // 行高
  font-size: 15px;
  min-height: 300px; // 最小高度
  color: #606266; // 常规文字颜色

  // 深度选择器修改 HTML 内容中的元素样式
  :deep(h2) {
    color: #303133;
    font-size: 20px;
    margin-bottom: 16px;
  }

  :deep(p) {
    margin-bottom: 12px; // 段落间距
  }

  :deep(ul) {
    margin: 16px 0;
    padding-left: 24px; // 列表缩进

    li {
      margin-bottom: 8px; // 列表项间距
    }
  }
}
</style>