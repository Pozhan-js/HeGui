<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
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
      <el-form-item label="结算时间" prop="completeBeginTime">
        <RangePicker
          clearable
          size="small"
          :sTime.sync="queryParams.completeBeginTime"
          :eTime.sync="queryParams.completeEndTime"
          placeholder="选择结算时间"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option value="all" label="全部" />
          <el-option
            v-for="dict in finance_settlement_detail_status"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
      </el-row>
    </el-form>
    <el-tabs
      style="margin-top: 20px"
      class="tabContainer"
      type="card"
      v-model="queryParams.status"
      @tab-click="handleQuery"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in finance_settlement_detail_status"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>
    <el-table
      :max-height="maxHeight"
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="supplierList"
    >
      <el-table-column min-width="110" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="110" label="供应商名称" align="center" prop="shopName" />
      <el-table-column
        min-width="90"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      
      <el-table-column
        min-width="110"
        label="总销售额(元)"
        align="center"
        prop="totalSales"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="110"
        label="应付货款(元)"
        align="center"
        prop="actualPayAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="110"
        label="促销费用(元)"
        align="center"
        prop="promotionAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="110"
        label="实付货款(元)"
        align="center"
        prop="saleAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="110"
        label="结算时间"
        align="center"
        prop="settlementTime"
      >
        <!-- <template slot-scope="{row}">
          {{formatDate(row.settlementTime)[0]}}<br/>
          {{formatDate(row.settlementTime)[1]}}
        </template> -->
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="11">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listSupplier } from "@/api/finance/supplier";
import { Cascader } from "ant-design-vue";
import {getOrgTree} from "@/api/utils";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  status: "all",
  isAsc: 'desc',
  orderByColumn: 'update_time',
})
export default {
  name: "Supplier",
  components: { Cascader },
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
      // 供应商结算中间表表格数据
      supplierList: [],
      finance_settlement_detail_status: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态字典
      statusOptions: [],
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
    })
    this.getDicts("finance_cashout_status").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("finance_settlement_detail_status").then((response) => {
      this.finance_settlement_detail_status = response.data;
    });
  },
  methods: {
    getQuery() {
      return {
        ...this.queryParams,
        status:
          this.queryParams.status === "all"
            ? undefined
            : this.queryParams.status,
      }
    },
    /** 查询供应商结算中间表列表 */
    getList() {
      this.loading = true;
      listSupplier(this.getQuery()).then((response) => {
        this.supplierList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.finance_settlement_detail_status, row.status);
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
      this.download("supplier/export", this.getQuery());
    },
  },
};
</script>
