<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="应用ID" prop="appid">
        <el-input
          v-model="queryParams.appid"
          placeholder="请输入应用ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户id" prop="mchid">
        <el-input
          v-model="queryParams.mchid"
          placeholder="请输入商户id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户订单号" prop="partnerTradeNo">
        <el-input
          v-model="queryParams.partnerTradeNo"
          placeholder="请输入商户订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单流水号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单流水号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收款用户姓名" prop="transferName">
        <el-input
          v-model="queryParams.transferName"
          placeholder="请输入收款用户姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="微信付款单号" prop="paymentNo">
        <el-input
          v-model="queryParams.paymentNo"
          placeholder="请输入微信付款单号"
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
      <el-form-item label="转账状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择转账状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <!-- <el-row>
        <el-form-item label="转账时间" prop="transferTime">
          <el-date-picker
            clearable
            size="small"
            v-model="queryParams.transferTime"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="付款成功时间" prop="paymentTime">
          <el-date-picker
            clearable
            size="small"
            v-model="queryParams.paymentTime"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row> -->
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['payment:transferInfo:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="transferInfoList"
    >
      <el-table-column label="应用ID" align="center" prop="appid" />
      <el-table-column label="商户id" align="center" prop="mchid" />
      <el-table-column
        label="商户订单号"
        align="center"
        prop="partnerTradeNo"
      />
      <el-table-column label="订单流水号" align="center" prop="orderNo" />
      <el-table-column
        label="收款用户姓名"
        align="center"
        prop="transferName"
      />
      <el-table-column
        label="微信付款单号detail_id"
        align="center"
        prop="paymentNo"
      />
      <el-table-column label="付款金额" align="center" prop="amount">
        <template slot-scope="scope">
          {{ scope.row.amount && toDecimal2(scope.row.amount / 100) }}
        </template>
      </el-table-column>
      <el-table-column label="付款备注" align="center" prop="description" />
      <el-table-column label="业务结果" align="center" prop="resultCode" />
      <el-table-column label="错误代码" align="center" prop="errCode" />
      <el-table-column label="错误代码描述" align="center" prop="errCodeDes" />
      <el-table-column
        label="业务来源"
        align="center"
        prop="tradeType"
        :formatter="tradeTypeFormat"
      />
      <el-table-column
        label="转账状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="转账时间" align="center" prop="transferTime" />
      <el-table-column label="失败原因" align="center" prop="reason" />
      <el-table-column label="付款成功时间" align="center" prop="paymentTime" />
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
import { listTransferInfo } from "@/api/site/payment/transferInfo";
import moment from "moment";

export default {
  name: "TransferInfo",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 提现付款信息表格数据
      transferInfoList: [],
      // 业务来源
      tradeTypeOptions: [],
      // 转账状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appid: null,
        mchid: null,
        partnerTradeNo: null,
        transferName: null,
        paymentNo: null,
        tradeType: null,
        status: null,
        orderNo: null,
        transferTime: null,
        paymentTime: null,
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
    this.getDicts("payment_transfer_trade_type").then((response) => {
      this.tradeTypeOptions = response.data;
    });
    this.getDicts("payment_transfer_status").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询提现付款信息列表 */
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
      };
      //   if (this.queryParams.transferTime && this.queryParams.transferTime.length === 2) {
      //     params.strTime = this.queryParams.transferTime[0]
      //     params.endTime = this.queryParams.transferTime[1]
      //   }
      //   if (this.queryParams.paymentTime && this.queryParams.paymentTime.length === 2) {
      //     params.strTime = this.queryParams.paymentTime[0]
      //     params.endTime = this.queryParams.paymentTime[1]
      //   }
      listTransferInfo(params).then((response) => {
        this.transferInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 业务来源字典翻译
    tradeTypeFormat(row, column) {
      return this.selectDictLabel(this.tradeTypeOptions, row.tradeType);
    },
    // 转账状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
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
        "payment/transferInfo/export",
        {
          ...this.queryParams,
        },
        `payment_transferInfo.xlsx`
      );
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection();
        this.transferInfoList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
  },
};
</script>