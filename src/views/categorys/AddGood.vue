<template>
  <div>
    <!--    导航栏区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--      提示区-->
      <el-alert
              title="添加商品信息"
              type="info"
              center
              show-icon
              :closable="false">
      </el-alert>

      <!--      步骤条-->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center class="el-steps">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--      tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" :label-position=labelPosition>
        <el-tabs v-model="activeIndex" :tab-position="tabPosition" :before-leave="beforeLeaveTab"
                 @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                      v-model="addForm.goods_cat"
                      :options="parentCateList"
                      :props="cascaderProps"
                      @change="parentCateChanged"
                      clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in paramList" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, i) in paramList" :key='item.attr_id'>
              <el-input v-model="item.attr_vals.join(' ')">

              </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
                    :action=uploadUrl
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture"
                    :headers="headerObj"
                    :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--            富文本编辑器组件-->
            <quill-editor
                    ref="myQuillEditor"
                    v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>


        </el-tabs>
      </el-form>
    </el-card>
    <!--  预览图片对话框-->
    <el-dialog
            title="预览图片"
            :visible.sync="previewDialogVisible"
            width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "AddGood",
    data() {
      return {
        activeIndex: '0',
        tabPosition: 'left',
        labelPosition: 'top',
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: [],
        },
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'},
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'},
          ],
          goods_cat: [
            {required: true, message: '请选择商品分类', trigger: 'blur'},
          ]
        },
        parentCateList: [],
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        paramList: [],
        uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        previewDialogVisible: false
      }
    },
    methods: {
      parentCateChanged() {
        console.log(this.addForm.goods_cat);
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat.length = []
        }
      },
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories/', {params: {type: 3}});
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类信息失败')
        }
        console.log(res);
        this.parentCateList = res.data
      },
      beforeLeaveTab(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('清先选择分类');
          return false
        }
      },
      async getParamsData(property) {
        console.log(this.addForm.goods_cat);
        // 根据所选分类的Id，和当前所处的面板，获取对应的参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: property}});
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        });
        this.paramList = res.data;
        console.log(this.paramList);
      },
      tabClicked() {
        if (this.activeIndex === '1') {
          this.getParamsData('many')
        } else if (this.activeIndex === '2') {
          this.getParamsData('only')
        }
      },
      handleSuccess(response) {
        console.log(response);
        const picInfo = {
          pic: response.data.tmp_path
        };
        this.addForm.pics.push(picInfo)
      },
      handleRemove(file) {
        console.log(file);
        // 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path;
        // 从pics数组中，找到这个图片对应的索引值
        const i = this.addForm.pics.findIndex(item =>
            item.pic === filePath
        );
        // 调用数组的splic方法， 把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm.pics);
      },
      handlePreview(file) {
        console.log(file);
        this.previewPath = file.response.data.url;
        this.previewDialogVisible = true
      },
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必填项')
          }
          // 深拷贝addForm的good_cat
          const form = _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(',');
          // 处理动态参数
          this.paramList.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            };
            this.addForm.attrs.push(newInfo);
            form.attrs = this.addForm.attrs;
            console.log(form);
            // 请求添加商品接口
          });
          const {data: res} = await this.$http.post(`goods`, form);
          if (res.meta.status !== 201) {
            return this.$message.error('商品添加失败')
          }
          this.$message.success('商品添加成功')
          await this.$router.push('/goods')
        })
      }
    },
    computed: {
      cateId() {
        return this.addForm.goods_cat.pop()
      }
    },
    created() {
      this.getParentCateList()
    },
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

</style>
