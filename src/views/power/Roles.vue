<template>
  <div>
    <!--    面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图-->
    <el-card>
      <!--      添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!--      角色列表区域-->
      <template>
        <el-table
                :data="rolesList"
                border
                stripe>
          <!--          展开列-->
          <el-table-column type="expand">
            <template v-slot="scope">
              <el-row :class="['bdbuttom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
                      v-for="(item1, index1) in scope.row.children"
                      :key="item1.id">
                <!--                渲染一级权限-->
                <el-col :span="5">
                  <el-tag @close="removeRightById(scope.row, item1.id)" closable> {{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--                渲染二级和三级权限-->
                <el-col :span="19">
                  <!--                  通过 for 循环嵌套渲染二级权限-->
                  <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children"
                          :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" @close="removeRightById(scope.row, item1.id)" closable>{{item2.authName}}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag v-for="(item3, index3) in item2.children" :key="item3.id" type="warning" closable
                              @close="removeRightById(scope.row, item3.id)">
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!--          索引列-->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column
                  prop="roleName"
                  label="角色名称"
          >
          </el-table-column>
          <el-table-column
                  prop="roleDesc"
                  label="角色描述"
          >
          </el-table-column>
          <el-table-column
                  label="操作"
                  width="300px"
          >
            <template v-slot="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="assignPermissions(scope.row)">分配权限
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
    <!--    分配权限的对话框-->
    <el-dialog
            title="分配权限"
            :visible.sync="assignDialogVisible"
            width="50%"
            @close="closeAssignDialog"
    >
      <!--      树形控件-->
      <el-tree :data="rightsList" :props="authProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="assignDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        rolesList: [],
        assignDialogVisible: false,
        rightsList: [],
        authProps: {
          children: 'children',
          label: 'authName',
        },
        defKeys: [],
        roleId: '',
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      async getRolesList() {
        const {data: res} = await this.$http.get('roles/');
        if (res.meta.status !== 200) return this.$message.error("获取角色列表失败");
        this.rolesList = res.data
      },
      async removeRightById(role, rightId) {
        // 弹框提示用户是否要删除
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        console.log(confirmResult);
        if (confirmResult !== 'confirm') {
          return this.$message.info('用户取消删除')
        }
        // 发出删除权限请求
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        role.children = res.data
      },
      // 展示分配权限的对话框
      async assignPermissions(role) {
        // 获取所有权限数据
        this.roleId = role.id;
        const {data: res} = await this.$http.get('rights/tree');
        if (res.meta.status !== 200) {
          return this.$message.error('权限获取失败')
        }
        this.rightsList = res.data;
        console.log(this.rightsList);

        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys);
        this.assignDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有三级权限的id， 并保存到defKeys中
      getLeafKeys(node, arr) {
        // 如果当前node节点不包含children树形，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      closeAssignDialog() {
        this.defKeys = []
      },
      async allotRights() {
        // 点击为角色分配权限
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys(),
        ];
        const strId = keys.join(',');
        // 像后端请求角色授权
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: strId});
        if (res.meta.status !== 200){
          return this.$message.error('权限分配失败')
        }
        this.$message.success('权限分配完成');
        this.getRolesList();
        this.assignDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbuttom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
