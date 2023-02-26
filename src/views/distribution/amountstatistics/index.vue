<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="98px"
    >
      <el-form-item label="组织" prop="orgId">
         <Cascader
          :options="orgOptions"
          v-model="queryParams.orgId"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- 加密通话：makiName === nickName -->
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入配送员名称或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
         <el-form-item label="账期" prop="countTime">
        <el-date-picker
          v-model="queryParams.countTime"
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
        style="margin-left: 93px; margin-top: 5px"
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
            v-hasPermi="['distribution:amountstatistics:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table :max-height="maxHeight" v-loading="loading" style="margin-top: 20px" :data="amountstatisticsList">
      <el-table-column min-width="100" label="账期" align="center" prop="countTime" />
      <el-table-column min-width="120" label="组织" align="center" prop="orgName">
        <template slot-scope="{row}">
          <div>{{[row.areaName, row.orgName].join('/')}}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="配送员名称" align="center" prop="makiName" />
      <el-table-column min-width="100" label="配送员手机号" align="center" prop="telephone" />
      <el-table-column min-width="100" label="期初金额" align="center" prop="lastAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column min-width="100" label="缴纳金额" align="center">
        <template slot-scope="{row}">
          <span class="text-red">+{{toDecimal2(row.rechargeAmount / 100)}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="退回金额" align="center">
        <template slot-scope="{row}">
          <span class="text-blue">-{{toDecimal2(row.refundAmount / 100)}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="期末金额" align="center" prop="currentAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
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
  listAmountstatistics,
} from "@/api/distribution/amountstatistics";
import { getOrgTree } from "@/api/utils";
import { Cascader } from "ant-design-vue";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'create_time',
})

export default {
  name: "Amountstatistics",
  components: {
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
      // 质保金汇总表格数据
      amountstatisticsList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: getDefaultForm(),
    };
  },
  created() {
    this.getList();
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
  },
  methods: {
    /** 查询质保金汇总列表 */
    getList() {
      this.loading = true;
      listAmountstatistics(this.queryParams).then((response) => {
        this.amountstatisticsList = response.rows;
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
        "/distribution/amountstatistics/export",
        {
          ...this.queryParams,
        },
        `distribution_amountstatistics.xlsx`
      );
    },
  },
};
</script>
