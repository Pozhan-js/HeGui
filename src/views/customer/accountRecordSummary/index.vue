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
      <el-form-item label="消费者昵称" prop="customerId">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入消费者昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="账期" prop="periodTime">
          <el-date-picker
            v-model="queryParams.periodTime"
            :type="timeType"
            placeholder="请选择账期"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
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
            >筛选</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:accountRecordSummary:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="timeType"
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="日汇总" name="date" />
      <el-tab-pane label="月汇总" name="month" />
    </el-tabs>
    <el-table
      style="margin-top: 20px"
      :max-height="maxHeight"
      v-loading="loading"
      :data="accountRecordSummaryList"
    >
      <el-table-column min-width="100" label="账期" align="center" prop="period">
        <template slot-scope="scope">
          {{ timeType === 'date' ? scope.row.periodTime : scope.row.period }}
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="消费者编号" align="center" prop="customerId" />
      <el-table-column min-width="100" label="消费者昵称" align="center" prop="nickname">
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
      <el-table-column
        min-width="100"
        label="期初余额(元)"
        align="center"
        prop="beforeAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        :label="(timeType === 'date' ? '本日': '本月') + '收入(元)'"
        align="center"
      >
        <template slot-scope="{row}">
          <span class="text-red"> +{{toDecimal2(row.addAmount / 100)}} </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        :label="(timeType === 'date' ? '本日': '本月') + '赠送(元)'"
        align="center"
        prop="presentationAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        :label="(timeType === 'date' ? '本日': '本月') + '支出(元)'"
        align="center"
      >
        <template slot-scope="{row}">
          <span class="text-blue"> -{{toDecimal2(row.reduceAmount / 100)}} </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="期末余额(元)"
        align="center"
        prop="afterAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
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
import { listAccountRecordSummary } from "@/api/customer/accountRecordSummary";
import moment from "moment";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  period: null,
  periodTime: new Date(),
})

export default {
  name: "AccountRecordSummary",
  components: {},
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
      // 客户账户记录汇总表格数据
      accountRecordSummaryList: [],
      // 时间类型
      timeType: "date",
      // 查询参数
      queryParams: getDefaultForm(),
    };
  },
  created() {
    this.getList();
  },
  methods: {
    queryParamFomat() {
      const params = {
        ...this.queryParams,
        period: this.timeType === "month" ? moment(this.queryParams.periodTime).format("YYYY-MM") : null,
        periodTime: this.timeType === "date" ? moment(this.queryParams.periodTime).format("YYYY-MM-DD") : null,
      };
      return params
    },
    tabCheck() {
      this.queryParams.pageNum = 1;
      this.getList()
    },
    /** 查询客户账户记录汇总列表 */
    getList() {
      this.loading = true;
      listAccountRecordSummary(this.queryParamFomat()).then((response) => {
        this.accountRecordSummaryList = response.rows;
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
        "accountRecordSummary/export",
        this.queryParamFomat(),
        `customer_accountRecordSummary.xlsx`
      );
    },
  },
};
</script>
