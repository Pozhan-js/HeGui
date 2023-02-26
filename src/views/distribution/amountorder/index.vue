<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="88px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单凭证号" prop="thirdOrderCode">
        <el-input
          v-model="queryParams.thirdOrderCode"
          placeholder="请输入订单凭证号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="缴纳单号" prop="amountOrderCode">
        <el-input
          v-model="queryParams.amountOrderCode"
          placeholder="请输入缴纳单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入配送员名称或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="配送员ID" prop="distributionId">
        <el-input
          v-model="queryParams.distributionId"
          placeholder="请输入配送员ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="交易状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择交易状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in payStatus"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="缴纳时间" prop="paySTime">
        <RangePicker
          clearable
          size="small"
          :sTime.sync="queryParams.paySTime"
          :eTime.sync="queryParams.payETime"
          placeholder="选择缴纳时间"
        />
      </el-form-item>
      <el-form-item>
        <query-tag :tags="tags" />
      </el-form-item>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 83px; margin-top: 5px"
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
            v-hasPermi="['distribution:amountorder:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      :max-height="maxHeight"
      style="margin-top: 20px"
      v-loading="loading"
      :data="amountorderList"
    >
      <el-table-column
        label="订单凭证号"
        align="center"
        prop="thirdOrderCode"
        min-width="120"
      />
      <el-table-column
        label="缴纳时间"
        align="center"
        prop="completionTime"
        min-width="90"
      >
        <template slot-scope="{ row }">
          <break-time :date-time="row.completionTime"/>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="组织" align="center" prop="orgName">
        <template slot-scope="{ row }">
          <div>{{ [row.areaName, row.orgName].join("/") }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="配送员名称" align="center" prop="makiName" />
      <el-table-column min-width="100" label="配送员手机号" align="center" prop="telephone" />
      <el-table-column min-width="120" label="缴纳单号" align="center" prop="amountOrderCode" />
      <el-table-column min-width="100"
        label="缴纳前金额（元）"
        align="center"
        prop="beforeAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="金额（元）"
        align="center"
        prop="amount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="缴纳后金额（元）"
        align="center"
        prop="afterAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="90"
        label="状态"
        align="center"
        prop="status"
        :formatter="(row) => selectDictLabel(payStatus, row.status)"
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
import { listAmountorder } from "@/api/distribution/amountorder";
import { getOrgTree } from "@/api/utils";
import { Cascader } from "ant-design-vue";
import QueryTag from "@/components/QueryTag";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: "Amountorder",
  components: {
    QueryTag,
    Cascader,
  },
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
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      payStatus: [],
      // 质保金表格数据
      amountorderList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        distributionId: this.$route.query.distributionId,
        isAsc: "desc",
        orderByColumn: "create_time",
      },
      tags: [{ type: "distributionId", name: "配送员编号" }],
    };
  },
  created() {
    Object.assign(this.queryParams, this.$route.query);
    this.getList();
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
    this.getDicts("pay_status").then((res) => {
      if (res.code === 200) {
        this.payStatus = res.data;
      }
    });
  },
  methods: {
    /** 查询质保金列表 */
    getList() {
      this.loading = true;
      listAmountorder(this.queryParams).then((response) => {
        this.amountorderList = response.rows;
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        isAsc: "desc",
        orderByColumn: "create_time",
      };
      this.$router.push({ query: {} });
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/distribution/amountorder/rechargeexport",
        this.queryParams
      );
    },
  },
};
</script>
