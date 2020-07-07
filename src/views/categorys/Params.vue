<template>
  <div>
    <!--    导航栏区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
              title="注意：只允许为第三级分类设置相关参数！"
              type="warning"
              show-icon
              :closable="false">
      </el-alert>
      <!--      选择商品分类区域-->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
                  v-model="selectedKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChanged"
                  clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!--        tab页签区-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--        添加动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!--          动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--            展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--                循环渲染tag标签-->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="item.attr_id" closable
                        @close="removeAttribute(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--                输入文本框-->
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 添加属性
                </el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editProperty(scope.row)">修改
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteProperty(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--        添加静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <!--          静态属性表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--            展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--                循环渲染tag标签-->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="item.attr_id" closable
                        @close="removeAttribute(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--                输入文本框-->
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--                添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 添加属性
                </el-button>
              </template>
            </el-table-column>
            <!--            索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="editProperty(scope.row)">修改
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteProperty(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加属性对话框-->
    <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="30%"
            @close="closeAddDialog"
    >
      <!--      添加参数的对话框-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label=titleText prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addProperty">确 定</el-button>
  </span>
    </el-dialog>
    <!--    编辑属性对话框-->
    <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="closeEditDialog"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label=titleText prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editPropertyFunc">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data() {
      return {
        parentCateList: [],
        selectedKeys: [],
        // 级联选择框的配制对象
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
        },
        paramList: [],
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        // 添加参数的表单数据对象
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
        },
        editDialogVisible: false,
        editForm: {
          attr_name: ''
        },
        editFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
        },
        attr_id: '',
      }
    },
    created() {
      this.getParentCateList()
    },
    methods: {
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories/', {params: {type: 3}});
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类信息失败')
        }
        console.log(res);
        this.parentCateList = res.data
      },
      parentCateChanged() {
        this.getParamsData()
      },
      // 获取参数的列表数据
      async getParamsData() {
        // 如果selectedKeys长度小于3清空多级选项框
        if (this.selectedKeys.length < 2) {
          this.selectedKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return
        }
        console.log(this.selectedKeys);
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}});
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
          item.inputVisible = false;
          item.inputValue = '';
        });

        console.log(res.data);
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      handleTabClick() {
        console.log(this.activeName);
        console.log(this.cateId);
        this.getParamsData()
      },
      closeAddDialog() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加属性
      addProperty() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          // 发送添加属性请求
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          });
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败')
          }
          this.$message.success('添加参数成功');
          this.addDialogVisible = false;
        });
      },
      editProperty(attrInfo) {
        console.log(attrInfo);
        this.attr_id = attrInfo.attr_id;
        this.editForm.attr_name = attrInfo.attr_name;
        this.editDialogVisible = true;
      },
      editPropertyFunc() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          //发送编辑请求
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.attr_id}`,
              {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
          if (res.meta.status !== 200) {
            this.$message.error('编辑属性失败')
          }
          this.$message.success('属性编辑成功');
          this.getParamsData();
          this.editDialogVisible = false
        })
      },
      closeEditDialog() {
        this.$refs.editFormRef.resetFields()
      },
      // 删除属性
      async deleteProperty(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);

        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`);
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('属性删除失败')
        }
        this.$message.success('属性删除成功');
        this.getParamsData()
      },
      // 文本框失去焦点或者按下了enter键都可以触发
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = '';
          row.inputVisible = false;
          return
        }

        // 如果没有return则证明输入的内容，需要做后续处理
        row.attr_vals.push(row.inputValue);

        // 发送网络请求将参数值保存到数据库中
        this.saveAttrVals(row)
        row.inputValue = '';
        row.inputVisible = false;
      },

      // 将对attr_vals的操作保存到数据库
      async saveAttrVals(row) {
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        });
        if (res.meta.status !== 200) {
          return this.$message.error('参数添加失败')
        }
        this.$message.success('参数添加成功');
      },

      showInput(row) {
        row.inputVisible = true;
        // 让文本框自动获取焦点
        // $nextTick方法的作用，就是当页面上的元素被重新渲染后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      removeAttribute(index, row) {
        row.attr_vals.splice(index, 1);
        this.saveAttrVals(row)
      }
    },
    computed: {
      isBtnDisabled() {
        if (this.selectedKeys < 2) {
          return true
        }
        return false
      },
      cateId() {
        return this.selectedKeys.pop()
      },
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      },
    },
  }
</script>

<style lang="less" scoped>
  .el-alert {
    margin-bottom: 15px;
  }

  .el-tabs {
    margin-top: 15px;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }

</style>
