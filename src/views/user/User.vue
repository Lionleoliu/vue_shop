<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图区域-->
    <el-card>
      <!--      搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--      用户列表区-->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch
                    @change="userStateChange(scope.row)"
                    v-model="scope.row.mg_state"
                    active-color="#13ce66">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-tooltip effect="dark" content="编辑角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="small"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--            删除按钮-->
            <el-tooltip effect="dark" content="删除角色" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="small"
                         @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!--            分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--    添加用户对话框-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
    >
      <!--      内容主体区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--      底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!--    修改用户对话框-->
    <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editFormClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--    分配角色对话框-->
    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            v-slot="scope"
            @close="closeSaveRoleInfoDialog"
    >
      <div>
        <p>当前的用户：{{currentUser}}</p>
      </div>
      <div>
        <p>当前的角色:{{currentRole}}</p>
      </div>
      <!--      角色下拉框-->
      <p>分配新角色：
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
                  v-for="item in rolesList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "User",
    data() {
      // 验证邮箱的规则
      const checkEmail = (rule, value, cb) => {
        const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

        if (regEmail.test(value)) {
          return cb()
        }

        cb(new Error('请输入合法邮箱'))
      };

      // 验证手机号的规则
      const checkMobile = (rule, value, cb) => {
        const regMobile = /^1(3|4|5|7|8)\d{9}$/

        if (regMobile.test(value)) {
          return cb()
        }

        cb(new Error('请输入合法手机号'))

      };


      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          // 当前页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2,
        },
        userlist: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名的长度在3到10个字符之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '密码的长度在6到15个字符之间', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            // {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号码', trigger: 'blur'},
            // {min: 11, max: 11, message: '手机的长度在6到15个字符之间', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        // 查询到的用户信息对象
        editForm: {},
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱地址', trigger: 'blur'},
            // {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号码', trigger: 'blur'},
            // {min: 11, max: 11, message: '手机的长度在6到15个字符之间', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        userInfo: {},
        currentUser: '',
        currentRole: '',
        rolesList: [],
        // 已选中的橘色ID值
        selectRoleId: '',
      }

    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$http.get('users', {params: this.queryInfo});
        if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！');
        this.userlist = res.data.users;
        this.total = res.data.total;
        console.log(res);
      },
      // 监听pagesize 改变的时间
      handleSizeChange(newSize) {
        console.log(newSize);
        this.queryInfo.pagesize = newSize;
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newPage) {
        console.log(newPage);
        this.queryInfo.pagenum = newPage;
        this.getUserList()
      },
      // 监听switch开关状态的改变
      async userStateChange(userinfo) {
        console.log(userinfo);
        const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state;
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('用户状态更新成功')
      },
      // 监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          console.log(valid);
          if (!valid) return;
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加用户失败')
          }
          this.$message.success('用户添加成功');
          this.addDialogVisible = false;
          this.getUserList();
        })
      },
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id);
        if (res.meta.status !== 200) {
          return this.$message.error('用户查询失败')
        }
        this.editForm = res.data;
        this.editDialogVisible = true
      },
      editFormClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户信息并提交
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.put('users/' +
              this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          });
          if (res.meta.status !== 200) {
            return this.$message.error('用户更新失败');
          }
          this.editDialogVisible = false;
          this.getUserList();
          this.$message.success('用户更新成功');
        })
      },
      // 根据ID删除对应的用户信息
      async removeUserById(id) {
        //弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult);
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('users/' + id);
        if (res.meta.status !== 200) {
          return this.$message.error('用户删除失败')
        }
        this.$message.success('用户删除成功');
        this.getUserList();
        this.queryInfo.pagenum = 1;
      },
      // 展示分配角色的对话框
      async setRole(userInfo) {
        console.log(userInfo);
        this.userInfo = userInfo;
        this.currentUser = userInfo.username;
        this.currentRole = userInfo.role_name;

        // 拿到所有的角色信息
        const {data: res} = await this.$http.get('roles/');
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色信息失败')
        }
        this.rolesList = res.data;
        this.setRoleDialogVisible = true
      },
      // 点击按钮，分配角色
      async saveRoleInfo() {
        // 拿到select上选择的角色id，调用分配角色接口传入用户id和权限id
        if (!this.selectRoleId) {
          return this.$message.error('请选择对应的角色')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,
            {rid: this.selectRoleId});
        if (res.meta.status !== 200){
          return this.$message.error('角色授权失败')
        }
        this.$message.success('角色授权成功');
        this.getUserList();
        this.setRoleDialogVisible = false
      },
      closeSaveRoleInfoDialog(){
        this.selectRoleId = '';
        this.userInfo = {}
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
