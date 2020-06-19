import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import ElementUI from 'element-ui';
//导入全局样式表
Vue.config.productionTip = false

Vue.use(ElementUI);

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use(config => {
  // console.log(config);
  // 在最后必须return config
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});
Vue.prototype.$http = axios;


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
