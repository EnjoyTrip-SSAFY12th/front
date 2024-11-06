import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/Main.vue'
import Test from '../views/Test.vue'
import Login from '../views/Account/Login.vue'
import SignUp from '../views/Account/SignUp.vue'
import ReviewList from '../views/Review/ReviewList.vue'
import MyPage from '@/views/Account/MyPage.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signUp',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/myPage',
    name: 'MyPage',
    component: MyPage,
  },
  {
    path: '/reviewList',
    name: 'ReviewList',
    component: ReviewList,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
