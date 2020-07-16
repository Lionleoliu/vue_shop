<template>
  <div>
    <!--    面包导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--      搜索栏和添加商品-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goToAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!--            修改按钮-->
            <el-tooltip effect="dark" content="编辑商品" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="small"
                         @click="showEditDialog(scope.row.goods_id)"></el-button>
            </el-tooltip>
            <!--            删除按钮-->
            <el-tooltip effect="dark" content="删除商品" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="small"
                         @click="removeGoodById(scope.row.goods_id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 5, 10, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalPage"
              background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "List",
    data() {
      return {
        queryInfo: {
          query: '',
          // 当前页数
          pagenum: 1,
          // 一页显示多少条数据
          pagesize: 10,
        },
        goodsList: [],
        totalPage: 0
      }
    },
    methods: {
      async getGoodsList() {
        const {data: res} = await this.$http.get(`goods`, {params: this.queryInfo});
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        console.log(res);
        this.goodsList = res.data.goods;
        this.totalPage = res.data.total;
      },
      handleSizeChange(newSize) {
        console.log(newSize);
        this.queryInfo.pagesize = newSize;
        this.getGoodsList()
      },
      handleCurrentChange(newPage) {
        console.log(newPage);
        this.queryInfo.pagenum = newPage;
        this.getGoodsList()
      },
      async removeGoodById(goodId) {
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
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
        const {data: res} = await this.$http.delete(`goods/` + goodId);
        if (res.meta.status !== 200){
          console.log(res);
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功');
        this.getGoodsList();
        this.queryInfo.pagenum = 1;
      },
      goToAddPage(){
        this.$router.push('goods/add')
      }
    },
    created() {
      this.getGoodsList()
    }
  }
</script>

<style scoped>

</style>
