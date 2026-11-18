<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <router-view />
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const isDark = computed(() => settingsStore.theme === 'dark')

// 初始化时加载设置(仅在已登录时)
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await settingsStore.loadSettings()
  }
})
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  min-height: 100vh;
  // 浅色模式: 天空蓝基底 + 左上角太阳光晕(稍微大一点)
  background:
    radial-gradient(
      ellipse 1400px 900px at 0% 0%,
      rgba(255, 200, 100, 0.28) 0%,
      rgba(255, 220, 150, 0.18) 22%,
      transparent 52%
    ),
    linear-gradient(
      to bottom,
      #e8f4f8 0%,
      #f0f8ff 50%,
      #f5faff 100%
    );
  transition: background 0.3s, color 0.3s;

  &.dark-theme {
    // 深色模式: 更亮的灰蓝夜空 + 明显的渐变效果 + 月光蓝色光晕
    background:
      radial-gradient(
        ellipse 1200px 800px at 0% 0%,
        rgba(135, 206, 250, 0.20) 0%,
        rgba(100, 180, 230, 0.12) 28%,
        transparent 58%
      ),
      linear-gradient(
        135deg,
        #3d5a73 0%,
        #4a6b85 35%,
        #5a7c96 70%,
        #4a6b85 100%
      );
    color: #e8f0f5;
    min-height: 100vh;

    // 卡片样式 - 半透明灰蓝色,与更亮的夜空背景融合
    .el-card {
      background-color: rgba(74, 107, 133, 0.60) !important;
      border-color: rgba(135, 160, 180, 0.35) !important;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.20) !important;

      .el-card__header {
        background-color: rgba(90, 124, 150, 0.50) !important;
        color: #f0f5fa !important;
        border-bottom-color: rgba(135, 160, 180, 0.35) !important;
      }

      .el-card__body {
        color: #f0f5fa !important;
      }
    }

    // 表格样式
    .el-table {
      background-color: rgba(74, 107, 133, 0.50) !important;
      color: #f0f5fa !important;

      th, td {
        background-color: rgba(74, 107, 133, 0.50) !important;
        color: #f0f5fa !important;
        border-color: rgba(135, 160, 180, 0.35) !important;
      }

      th {
        background-color: rgba(90, 124, 150, 0.60) !important;
      }

      tr:hover > td {
        background-color: rgba(90, 124, 150, 0.50) !important;
      }
    }

    // 输入框样式
    .el-input__wrapper {
      background-color: rgba(74, 107, 133, 0.55) !important;
      box-shadow: 0 0 0 1px rgba(135, 160, 180, 0.35) inset !important;

      .el-input__inner {
        color: #f0f5fa !important;
      }
    }

    .el-textarea__inner {
      background-color: rgba(74, 107, 133, 0.55) !important;
      border-color: rgba(135, 160, 180, 0.35) !important;
      color: #f0f5fa !important;
    }

    // 下拉框样式
    .el-select-dropdown {
      background-color: #2a2a2a !important;
      border-color: #3a3a3a !important;

      .el-select-dropdown__item {
        color: #e0e0e0 !important;

        &:hover {
          background-color: #333 !important;
        }
      }
    }

    // 菜单样式
    .el-menu {
      background: transparent !important;

      .el-menu-item {
        color: rgba(255, 255, 255, 0.85) !important;

        &:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 255, 255, 0.95) !important;
        }

        &.is-active {
          color: #85c1ff !important;
          background-color: rgba(133, 193, 255, 0.12) !important;
        }
      }
    }

    // Header样式 - 深色模式渐变
    .el-header {
      background: linear-gradient(
        to right,
        rgba(74, 107, 133, 0.85) 0%,
        rgba(90, 124, 150, 0.85) 100%
      ) !important;
      backdrop-filter: blur(12px);
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25) !important;
      color: #f0f5fa !important;

      h1 {
        background: linear-gradient(135deg, #85c1ff 0%, #a8d5ff 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
      }

      .user-info {
        background: linear-gradient(135deg, #5a7c96 0%, #6a8ca6 100%) !important;

        &:hover {
          background: linear-gradient(135deg, #6a8ca6 0%, #7a9cb6 100%) !important;
        }
      }
    }

    // 描述列表样式
    .el-descriptions {
      .el-descriptions__label,
      .el-descriptions__content {
        background-color: #2a2a2a !important;
        color: #e0e0e0 !important;
        border-color: #3a3a3a !important;
      }
    }

    // 分割线样式
    .el-divider {
      border-color: #3a3a3a !important;
    }
  }
}
</style>

