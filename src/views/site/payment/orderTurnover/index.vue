<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="订单流水号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单流水号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付订单ID" prop="orderInfoId">
        <el-input
          v-model="queryParams.orderInfoId"
          placeholder="请输入支付订单ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用ID" prop="appid">
        <el-input
          v-model="queryParams.appid"
          placeholder="请输入应用ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户ID" prop="mchid">
        <el-input
          v-model="queryParams.mchid"
          placeholder="请输入商户ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务来源" prop="tradeType">
        <el-select
          v-model="queryParams.tradeType"
          placeholder="请选择业务来源"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in tradeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="交易类型" prop="payType">
        <el-select
          v-model="queryParams.payType"
          placeholder="请选择交易类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in payTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="支付渠道" prop="payChannel">
        <el-select
          v-model="queryParams.payChannel"
          placeholder="请选择支付渠道"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in payChannelOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="支付时间" prop="payTime">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.payTime"
          :picker-options="pickerOptions"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['payment:orderInfo:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="orderInfoList"
    >
      <el-table-column label="支付订单ID" align="center" prop="orderInfoId" />
      <el-table-column label="内部订单流水号" align="center" prop="orderNo" />
      <el-table-column label="应用ID" align="center" prop="appid" />
      <el-table-column label="商户id" align="center" prop="mchid" />
      <el-table-column
        label="微信商户订单号"
        align="center"
        prop="outTradeNo"
      />
      <el-table-column
        label="微信支付单号"
        align="center"
        prop="transactionId"
      />
      <el-table-column label="商品描述" align="center" prop="description" />
      <el-table-column label="订单金额" align="center" prop="amount">
        <template slot-scope="scope">
          {{ scope.row.amount && toDecimal2(scope.row.amount / 100) }}
        </template>
      </el-table-column>
      <el-table-column label="交易状态" align="center" prop="tradeStateDesc" />
      <el-table-column
        label="业务类型"
        align="center"
        prop="payType"
        :formatter="payTypeFormat"
      />
      <el-table-column
        label="交易类型"
        align="center"
        prop="tradeType"
        :formatter="tradeTypeFormat"
      />
      <el-table-column
        label="支付渠道"
        align="center"
        prop="payChannel"
        :formatter="payChannelFormat"
      />
      <el-table-column
        label="支付发起时间"
        align="center"
        prop="payTimeBegin"
      />
      <el-table-column label="支付完成时间" align="center" prop="payTimeEnd" />
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
import { listOrderInfo } from "@/api/site/payment/orderTurnover";
import moment from "moment";

export default {
  name: "OrderTurnover",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 支付订单流水表格数据
      orderInfoList: [],
      // 业务来源：ORDER-销售订单，RECHARGE-会员充值，RETENTION-质保金，INSURANCE-保险费字典
      tradeTypeOptions: [],
      // 交易类型：PAY-支付，REFUND-退款字典
      payTypeOptions: [],
      // 支付渠道：JSAPI-微信公众号支付，MINI_PROGRANM-微信小程序支付，APP-微信APP支付字典
      payChannelOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        orderInfoId: null,
        appid: null,
        mchid: null,
        tradeType: null,
        payType: null,
        payChannel: null,
        payTime: null,
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf("day"));
              const end = new Date(moment(new Date()).endOf("day"));
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(start).endOf("day")),
              ]);
            },
          },
          {
            text: "近七天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [
                new Date(moment(start).startOf("day")),
                new Date(moment(end).endOf("day")),
              ]);
            },
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("payment_order_trade_type").then((response) => {
      this.tradeTypeOptions = response.data;
    });
    this.getDicts("payment_order_pay_type").then((response) => {
      this.payTypeOptions = response.data;
    });
    this.getDicts("payment_order_pay_channel").then((response) => {
      this.payChannelOptions = response.data;
    });
  },
  methods: {
    /** 查询支付订单流水列表 */
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
      };
      if (this.queryParams.payTime && this.queryParams.payTime.length === 2) {
        params.payTimeBegin = this.queryParams.payTime[0];
        params.payTimeEnd = this.queryParams.payTime[1];
        delete params.payTime;
      }
      listOrderInfo(params).then((response) => {
        this.orderInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 支付渠道：JSAPI-微信公众号支付，MINI_PROGRANM-微信小程序支付，APP-微信APP支付字典翻译
    payTypeFormat(row, column) {
      return this.selectDictLabel(this.payTypeOptions, row.payType);
    },
    // 交易类型：PAY-支付，REFUND-退款字典翻译
    tradeTypeFormat(row, column) {
      return this.selectDictLabel(this.tradeTypeOptions, row.tradeType);
    },
    // 业务来源：ORDER-销售订单，RECHARGE-会员充值，RETENTION-质保金，INSURANCE-保险费字典翻译
    payChannelFormat(row, column) {
      return this.selectDictLabel(this.payChannelOptions, row.payChannel);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "payment/orderInfo/export",
        {
          ...this.queryParams,
        },
        `payment_orderInfo.xlsx`
      );
    },
  },
};
</script>