<template>
  <div class="login-page">
    <div class="login-container">
      <h2>天气预报查询系统</h2>
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="73px" 
        label-position="left"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password  
          />
        </el-form-item>

        <el-form-item class="button-item">
          <el-button 
            type="primary" 
            plain
            @click="handleLogin" 
            :loading="loading" 
          >
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <router-link to="/register" class="register-link">
            还没有账号？立即注册
          </router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(form.value)
        ElMessage.success('登录成功')
      } catch (error) {
        console.error('Login failed:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #e8f4f8;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
    z-index: -1;
  }
}

.login-container {
  width: 420px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;

  h2 {
    text-align: center;
    margin-bottom: 32px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 24px;
    font-weight: 600;
  }

  .button-item {
    :deep(.el-form-item__content) {
      margin-left: 0px !important;
    }

    :deep(.el-button) {
      width: 100%;
      border-radius: 8px;
      padding: 12px 0;
      font-weight: 500;
      font-size: 15px;
      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      }

      span {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px #409eff inset;
    }
  }

  .register-link {
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}
</style>