<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="订单凭证号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单凭证号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消费者昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入消费者昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消费者编号" prop="customerId">
        <NoneNullInput
          v-model="queryParams.customerId"
          placeholder="请输入消费者编号"
          value-type="number"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in customer_order_status"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="充值时间" prop="orderNo">
          <RangePicker
            clearable
            size="small"
            :sTime.sync="queryParams.beginTime"
            :eTime.sync="queryParams.endTime"
            placeholder="选择充值时间"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:order:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table :max-height="maxHeight" style="margin-top: 20px" v-loading="loading" :data="orderList">
      <el-table-column min-width="80" label="消费者编号" align="center" prop="customerId" />
      <el-table-column min-width="90" label="消费者昵称" align="center" prop="nickname">
        <template slot-scope="scope">
          <jump path="/customer/customerInfo" :query="{ customerId: scope.row.customerId}">
            <img
              :src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
              style="width: 40px; height: 40px; border-radius: 100px"
            />
            <div class="outer-link--text">{{ scope.row.nickname }}</div>
          </jump>
        </template>
      </el-table-column>
      <el-table-column min-width="140" label="订单流水号" align="center" prop="orderNo" />
      <el-table-column min-width="140" label="业务凭证号" align="center" prop="orderNo" />
      <el-table-column min-width="100" label="充值时间" align="center" prop="createTime">
        <template slot-scope="{row}">
          <break-time :date-time="row.createTime"/>
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        label="赠送方式"
        align="center"
        prop="presentationType"
        :formatter="
          (e) => selectDictLabel(recharge_presentation_type, e.presentationType)
        "
      />
      <el-table-column
        min-width="100"
        label="充值前金额(元)"
        align="center"
        prop="beforeAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="充值金额(元)"
        align="center"
        prop="amount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        label="赠送数量"
        align="center"
        prop="presentationAmount"
        :formatter="presentationValue"
      />
      <el-table-column
        min-width="100"
        label="充值后余额(元)"
        align="center"
        prop="afterAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="(e) => selectDictLabel(customer_order_status, e.status)"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listOrder } from "@/api/customer/order";
import RangePicker from "@/components/RangePicker.vue";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'create_time',
})
export default {
  name: "Order",
  components: { RangePicker },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 客户余额订单表格数据
      orderList: [],
      // 查询参数
      queryParams: getDefaultForm(),
      customer_order_status: [],
      recharge_presentation_type: [],
    };
  },
  created() {
    this.getList();
    this.getDicts("customer_order_status").then((res) => {
      if (res.code === 200) {
        this.customer_order_status = res.data;
      }
    });
    this.getDicts("recharge_presentation_type").then((res) => {
      if (res.code === 200) {
        this.recharge_presentation_type = res.data;
      }
    });
  },
  methods: {
    presentationValue(v) {
      switch (v.presentationType) {
        // 余额
        case 1:
        // 优惠券
          return this.toDecimal2(v.presentationAmount / 100);
        // 积分
        case 2:
        case 3:
          return v.presentationAmount;
      }
    },
    /** 查询客户余额订单列表 */
    getList() {
      this.loading = true;
      listOrder(this.queryParams).then((response) => {
        this.orderList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.queryParams.pageSize = 10;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = getDefaultForm();
      this.$router.push({query: {}})
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "customer/order/export",
        {
          ...this.queryParams,
        },
        `customer_order.xlsx`
      );
    },
  },
};
</script>
