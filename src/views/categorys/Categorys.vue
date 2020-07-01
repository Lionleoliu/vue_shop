<template>
  <div>
    <!--    导航栏区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    卡片区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--      表格区域-->
      <tree-table
              class="tree-table"
              :data="cateList"
              :columns="columns"
              :selection-type="false"
              :expand-type="false"
              :show-index="true"
              index-text="#"
              border
      >
        <!--        是否有效模板-->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--        排序模板-->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">标签一</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">标签二</el-tag>
          <el-tag type="warning" v-else size="mini">标签三</el-tag>
        </template>
        <!--        操作模板-->
        <template v-slot:operate="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCategory(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>
      <!--      分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalPage">
      </el-pagination>
    </el-card>
    <!--    添加分类弹框-->
    <el-dialog
            title="添加分类"
            :visible.sync="cateDialogVisible"
            width="50%"
            @close="closeCateDialog"
    >
      <!--      分类表单区域-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!--          options用来指定数据源-->
          <!--          props用来指定配制对象-->
          <el-cascader
                  v-model="selectedKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChanged"
                  clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addNewCategory">确 定</el-button>
  </span>
    </el-dialog>
    <!--    修改分类弹框-->
    <el-dialog
            title="修改分类"
            :visible.sync="editCateDialogVisible"
            width="50%"
    >
      <el-form :model="addCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Category",
    data() {
      return {
        // 商品分类数据列表，默认为空
        cateList: [],
        queryInfo: {
          pagenum: 1,
          pagesize: 5,
        },
        totalPage: 0,
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok',
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'operate'
          }
        ],
        cateDialogVisible: false,
        // 添加分类的表单数据对象
        addCateForm: {
          // 将要添加的分类的名称
          cat_name: '',
          // 父级分类订单Id
          cat_pid: 0,
          // 分类的等级，默认要添加的是1级分类
          cat_level: 0
        },
        addCateFormRules: {
          // 将要添加的分类的名称
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
        },
        editCateRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
        },
        parentCateList: [],
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        // 选中的父级分类的id数组
        selectedKeys: [],
        editCateDialogVisible: false
      }
    },
    methods: {
      async getCategories() {
        const {data: res} = await this.$http.get('categories', {params: this.queryInfo});
        if (res.meta.status !== 200) {
          this.$message.error('类目获取失败')
        }
        // console.log(res);
        this.cateList = res.data.result;
        this.totalPage = res.data.total;
      },
      // 监听pagesize改变
      handleSizeChange(newSize) {
        console.log(newSize);
        this.queryInfo.pagesize = newSize;
        this.getCategories()
      },
      // 监听pagenum的改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getCategories()
      },
      // 点击按钮，展示添加分类的对话框
      showAddCateDialog() {
        // 现获取父级分类列表数据
        this.getParentCateList();
        this.cateDialogVisible = true
      },
      addNewCategory() {
        console.log(this.addCateForm);
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.post('categories/', this.addCateForm);
          if (res.meta.status !== 201) {
            return this.$message.error('类目添加失败')
          }
          this.$message.success('类目添加成功');
          this.getCategories();
          this.cateDialogVisible = false
        })
      },
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories/', {params: {type: 2}});
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类信息失败')
        }
        this.parentCateList = res.data
      },
      // 选择项发生变化触发这个函数
      parentCateChanged() {
        console.log(this.selectedKeys);
        // 如果selectedKeys的数组长度大于0，证明选中了父级分类
        // 如果selectedKeys的数组长度等于0， 证明没有选中父级分类
        if (this.selectedKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectedKeys.pop();
          this.addCateForm.cat_level = this.selectedKeys.length;
        } else {
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_level = 0
        }
      },
      // 关闭增加分类的弹框然后重置表单
      closeCateDialog() {
        this.$refs.addCateFormRef.resetFields();
        this.selectedKeys = [];
        this.addCateForm.cat_level = 0;
        this.addCateForm.cat_pid = 0
      },
      async deleteCategory(cateId) {
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
        const {data: res} = await this.$http.delete(`categories/${cateId}`);
        if (res.meta.status !== 200) {
          return this.$message.error('类目删除失败')
        }
        this.$message.success('类目删除成功');
        this.queryInfo.pagenum = 1;
        this.getCategories()

      },
      editCate(cateInfo) {
        this.addCateForm.cat_name = cateInfo.cat_name;
        this.addCateForm.cat_pid = cateInfo.cat_id;
        this.editCateDialogVisible = true
      },
      // 发送编辑类目名称请求
      setCate() {
        // 预验证分类表单
        this.$refs.editCateRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.put(`categories/${this.addCateForm.cat_pid}`, {
            cat_name: this.addCateForm.cat_name
          });
          console.log(this.addCateForm.cat_name);
          console.log(this.addCateForm.cat_pid);
          if (res.meta.status !== 200) {
            return this.$message.error('分类修改失败')
          }
          this.$message.success('分类修改成功');
          this.getCategories();
          this.editCateDialogVisible = false
        })
      }
    },
    created() {
      this.getCategories()
    }
  }
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
