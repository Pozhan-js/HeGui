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
      <el-form-item label="订单编号" prop="serialNo">
        <el-input
          v-model="queryParams.serialNo"
          placeholder="请输入订单编号"
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
      <el-form-item label="变动类型" prop="balanceType">
        <el-select
          v-model="queryParams.balanceType"
          placeholder="请选择变动类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in balanceTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="变更时间" prop="beginTime">
        <RangePicker
          clearable
          size="small"
          :sTime.sync="queryParams.beginTime"
          :eTime.sync="queryParams.endTime"
          placeholder="选择变更时间"
        />
      </el-form-item>
      <el-form-item label="账期" prop="period">
        <el-date-picker
          v-model="queryParams.period"
          type="month"
          placeholder="请选择账期"
          clearable
          value-format="yyyy-MM"
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
            v-hasPermi="['customer:accountRecord:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table :max-height="maxHeight" style="margin-top: 20px" v-loading="loading" :data="accountRecordList">
      <el-table-column min-width="90" label="账期" align="center" prop="period" />
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
        label="变动类型"
        align="center"
        prop="balanceType"
        :formatter="balanceTypeFormat"
      />
      <el-table-column
        label="订单编号"
        min-width="136"
        align="center"
        prop="serialNo"
      />
      <el-table-column
        label="变动时间"
        min-width="120"
        align="center"
        prop="updateTime"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.updateTime"/>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="变动前余额(元)"
        align="center"
        prop="beforeAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="变动金额(元)"
        align="center"
      >
        <template slot-scope="{row}">
          <span :class=amountChangeStauts(row).className>
            {{amountChangeStauts(row).prefix}} {{toDecimal2(row.amount / 100)}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="变动后余额(元)"
        align="center"
        prop="afterAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column min-width="100" label="备注" align="center" prop="remark" />
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
import {
  listAccountRecord,
} from "@/api/customer/accountRecord";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'create_time',
})

export default {
  name: "AccountRecord",
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
      // 客户账户记录表格数据
      accountRecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 余额类型1、收入、2支出字典
      balanceTypeOptions: [],
      // 删除标志字典
      delFlagOptions: [],
      // 查询参数
      queryParams: getDefaultForm(),
    };
  },
  created() {
    this.queryParams = {
      ...this.queryParams,
      ...this.$route.query
    }
    this.getList();
    this.getDicts("customer_balance_type").then((response) => {
      this.balanceTypeOptions = response.data;
    });
    this.getDicts("sys_yes_no").then((response) => {
      this.delFlagOptions = response.data;
    });
  },
  methods: {
    /** 查询客户账户记录列表 */
    getList() {
      this.loading = true;
      listAccountRecord(this.queryParams).then((response) => {
        this.accountRecordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 余额类型1、收入、2支出字典翻译
    balanceTypeFormat(row, column) {
      return this.selectDictLabel(this.balanceTypeOptions, row.balanceType);
    },
    // 删除标志字典翻译
    delFlagFormat(row, column) {
      return this.selectDictLabel(this.delFlagOptions, row.delFlag);
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
      this.download("customer/accountRecord/export", this.queryParams);
    },
    // 变动金额格式化
    amountChangeStauts({afterAmount, beforeAmount}) {
      const isAbs = afterAmount - beforeAmount > 0
      return {
        className: isAbs ? 'text-red' : 'text-blue',
        prefix: isAbs ? '+' : '-'
      }
    }
  },
};
</script>
