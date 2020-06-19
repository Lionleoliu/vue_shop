<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../../assets/logo.png" height="180" width="180" alt=""/>
        <span>食享会自动化测试平台</span>
      </div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>
    <!--    页面主体区域-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||

        </div>
        <!--        侧边栏菜单区-->
        <el-menu
                :default-active="activePath"
                :router = 'true'
                :collapse-transition='false'
                :collapse=isCollapse
                :unique-opened='true'
                background-color="#222"
                text-color="#fff"
                active-text-color="#ffd04b">
          <!--          一级菜单-->
          <el-submenu :index="item.id + ''" v-for="(item, index) in menulist" :key="item.id">
            <!--            一级菜单模板区-->
            <template slot="title">
              <!--              图标-->
              <i :class="iconsObj[item.id]"></i>
              <!--              文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!--              图标-->
                <i class="el-icon-menu"></i>
                <!--              文本-->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!--      右侧内容主体-->
      <el-main>
        <!--        路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        // 左侧菜单数据
        menulist: [],
        iconsObj: {
          '125': 'el-icon-s-custom',
          '103': 'el-icon-s-platform',
          '101': 'el-icon-s-cooperation',
          '102': 'el-icon-s-order',
          '145': 'el-icon-s-data',
        },
        // 是否折叠
        isCollapse: false,
        // 被激活链接的地址
        activePath : ""
      }
    },
    created() {
      this.getMenuList()
      this.activePath = sessionStorage.getItem('activePath')
    },
    name: "Home",
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push('/login')
      },

      // 获取所有菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menus');
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menulist = res.data;
        // console.log(this.menulist);
        // console.log(res);
      },
      //点击按钮，切换菜单折叠与展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      // 保存链接的激活状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath
      }
    },
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background: #ec66a0;
    display: flex;
    justify-content: space-between;
    padding: 2px;
    align-items: center;
    color: #ffffff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }

    img {
      width: 55px;
      height: 55px;
      margin-left: 15px;
    }
  }

  .el-aside {
    background: #222;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background: #eeeeee;
  }

  .toggle-button {
    background: #4A5064;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    color: #eeeeee;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
