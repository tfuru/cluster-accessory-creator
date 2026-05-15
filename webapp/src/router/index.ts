import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import HomeView from '../views/HomeView.vue'

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    meta: { title: 'ログイン' },
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { title: 'ダッシュボード', requiresAuth: true },
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    meta: { title: '設定', requiresAuth: true },
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/editor',
    name: 'editor',
    meta: { title: 'エディタ', requiresAuth: true },
    component: HomeView
  },
  {
    path: '/editor/:id',
    name: 'editor-edit',
    meta: { title: 'エディタ', requiresAuth: true },
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    meta: { title: 'about' },
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  // タイトルの設定
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  // 認証チェック
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth) {
    const user = await getCurrentUser();
    if (user) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
})

export default router
