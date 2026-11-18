<template>
  <div class="register-page">
    <div class="register-container">
      <h2>用户注册</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
        <el-form-item>
          <router-link to="/login" class="login-link">已有账号？立即登录</router-link>
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
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.register({
          username: form.value.username,
          password: form.value.password
        })
        ElMessage.success('注册成功,请登录')
      } catch (error) {
        console.error('Register failed:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
}

.register-container {
  width: 470px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);

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

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 0;
    font-weight: 500;
    font-size: 15px;

    &:hover {
      background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
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

  .login-link {
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

