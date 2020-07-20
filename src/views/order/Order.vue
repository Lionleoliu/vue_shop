<template>
  <div>
    <!--  面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--    主体内容-->
    <el-card>
      <el-input placeholder="请输入内容" v-model="search">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>

      <!--      订单表格区域-->
      <el-table
              :data="orderList"
              stripe
              border
              style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
                prop="order_number"
                label="订单编号"
                width="180">
        </el-table-column>
        <el-table-column
                prop="order_price"
                label="订单价格"
                width="180">
        </el-table-column>
        <el-table-column
                prop="order_pay"
                label="是否付款">
          <template v-slot="scope">
            <el-tag v-if="scope.row.order_pay === '0' " type="warning">
              未付款
            </el-tag>
            <el-tag v-else>
              已付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
                prop="is_send"
                label="是否发货">
        </el-table-column>
        <el-table-column
                prop="create_time"
                label="下单时间">
          <template v-slot="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column
                prop="address"
                label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editAddress"></el-button>
            <el-button type="success" icon="el-icon-location-outline" @click="showLogisticsDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[5, 10, 15, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

    <!--    地址修改弹框-->
    <el-dialog
            title="修改地址"
            :visible.sync="editAddressDialogVisible"
            width="50%"
            @close="closeAddress"
    >
      <el-form :model="editAddressForm" :rules="editAddressRules" ref="editAddressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="city">
          <el-cascader
                  :model="editAddressForm.city"
                  :options="cityOptions"
                  :props="cascaderProps"
                  @change="changeProvince"
                  style="width: 100%"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model="editAddressForm.address" style="width: 100%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editAddressDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>

    <!--    物流信息查看弹框-->
    <el-dialog
            title="物流进度"
            :visible.sync="LogisticsDialogVisible"
            width="50%"
    >
      <el-timeline>
        <el-timeline-item
                v-for="(progress, index) in logisticsInfo"
                :key="index"
                :timestamp="progress.time">
          {{progress.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityOptions from '../../assets/js/city_data2017_element'

  export default {
    name: "Order",
    data() {
      return {
        search: '',
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        orderList: [],
        total: 0,
        editAddressDialogVisible: false,
        editAddressForm: {
          city: [],
          address: ''
        },
        editAddressRules: {
          city: [
            {required: true, message: '请选择省市区', trigger: 'blur'},
          ],
          addressDetail: [
            {required: true, message: '请输入详细地址', trigger: 'blur'},
          ],
        },
        cityOptions: cityOptions,
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'value',
          label: 'label',
          children: 'children',
          checkStrictly: true
        },
        LogisticsDialogVisible: false,
        logisticsInfo: []
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {data: res} = await this.$http.get(`orders`, {params: this.queryInfo});
        if (res.meta.status !== 200) {
          return this.$message.error('获取订单列表失败')
        }
        this.orderList = res.data.goods;
        this.total = res.data.total;
        console.log(this.orderList);
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getOrderList()
      },
      editAddress() {
        this.editAddressDialogVisible = true
      },
      changeProvince() {

      },
      closeAddress() {
        this.$refs.editAddressRef.resetFields()
      },
      async showLogisticsDialog() {
        const {data: res} = await this.$http.get(`/kuaidi/804909574412544580`);
        if (res.meta.status !== 200) {
          return this.$message.error('获取物流信息失败')
        }
        this.logisticsInfo = res.data;
        console.log(this.logisticsInfo);

        this.LogisticsDialogVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-input {
    width: 25%;
  }

</style>
