import Vue from 'vue'
import VueRouter from 'vue-router'


const Login = () => import('../views/login/Login');
const Home = () => import('../views/home/Home');
const Welcome = () => import('../components/content/welcome/Welcome');
const User = () => import('../views/user/User');
const Rights = () => import('../views/power/Rights');
const Roles = () => import('../views/power/Roles');
const Categorys = () => import('../views/categorys/Categorys');
const Params = () => import('../views/categorys/Params');
const Goods = () => import('../views/categorys/Goods');
const AddGood = () => import('../views/categorys/AddGood');
const Orders = () => import('../views/order/Order');
const Reports = () => import('../views/reports/Reports');


Vue.use(VueRouter);
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};
const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categorys
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods,
      },
      {
        path: '/goods/add',
        component: AddGood,
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      }
    ]
  },

];

const router = new VueRouter({
  routes,
  mode: 'history'
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next（）放行   next（‘login/’） 强制跳转
  if (to.path === '/login') {
    // console.log(to.path);
    return next()
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login')
  }
  next()
});

export default router
