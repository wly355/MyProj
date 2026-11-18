<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <div class="logo">
          <h2>管理后台</h2>
        </div>
        <el-menu :default-active="activeMenu" router>
          <el-menu-item index="/admin">
            <el-icon><data-line /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/admin/applications">
  <el-icon><UserFilled /></el-icon>
  <span>管理员申请</span>
</el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><user /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/feedbacks">
            <el-icon><chat-line-round /></el-icon>
            <span>反馈管理</span>
          </el-menu-item>
          <el-menu-item index="/">
            <el-icon><back /></el-icon>
            <span>返回首页</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-right">
            <span class="user-info">{{ authStore.user?.username }}</span>
            <el-button @click="authStore.logout" type="danger" link>
              <el-icon><switch-button /></el-icon>
              退出登录
            </el-button>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DataLine, User, ChatLineRound, Back, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  background: transparent;

  > :deep(.el-container) {
    min-height: 100vh;

    > .el-container {
      margin-left: 200px;
      width: calc(100% - 200px);
    }
  }
}

.sidebar {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
  overflow-y: auto;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);

    h2 {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 20px;
      font-weight: 700;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    background: transparent;
    padding: 8px 0;

    .el-menu-item {
      color: #606266;
      margin: 4px 12px;
      border-radius: 8px;
      transition: all 0.3s;
      font-weight: 500;
      border-left: 3px solid transparent;

      &:hover {
        background: rgba(245, 247, 250, 0.8);
        color: #409eff;
      }

      &.is-active {
        background: rgba(64, 158, 255, 0.08);
        color: #409eff;
        border-left-color: #409eff;
      }

      .el-icon {
        font-size: 18px;
      }
    }
  }
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  height: 64px;

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-info {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
    }

    .el-button {
      font-weight: 500;
      font-size: 14px;
      color: #606266;
      transition: all 0.3s;

      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.main-content {
  background: transparent;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}
</style>

