import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TravelAdvisor from '@/views/TravelAdvisor.vue'
import WeatherAlert from '@/views/WeatherAlert.vue'
import Profile from '@/views/Profile.vue'
import AdminApplications from '@/views/admin/AdminApplications.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },

  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'cities',
        name: 'Cities',
        component: () => import('@/views/Cities.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue')
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/Feedback.vue')
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue')
      },
 {
  path: '/weather-alert',
  name: 'WeatherAlert',
  component: WeatherAlert,
  meta: { requiresAuth: true }
},
      {
  path: '/travel-advisor',
  name: 'TravelAdvisor',
  component: TravelAdvisor,
  meta: { requiresAuth: true }
},
{
  path: '/profile',
  name: 'Profile',
  component: Profile,
  meta: { requiresAuth: true }
},
{
  path: '/system-status',
  name: 'SystemStatus',
  component: () => import('@/views/SystemStatus.vue'),
  meta: { requiresAuth: true }
}
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue')
      },
      {
        path: 'feedbacks',
        name: 'AdminFeedbacks',
        component: () => import('@/views/admin/Feedbacks.vue')
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: () => import('@/views/admin/Config.vue')
      },
{
      path: 'applications',
      name: 'AdminApplications',
      component: AdminApplications,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

