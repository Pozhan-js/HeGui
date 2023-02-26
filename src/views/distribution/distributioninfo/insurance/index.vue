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
      <el-form-item label="店铺id" prop="shopId">
        <el-input
          v-model="queryParams.shopId"
          placeholder="请输入店铺id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保险到期时间" prop="expiryDate">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.expiryDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择保险到期时间"
        >
        </el-date-picker>
      </el-form-item>
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
            v-hasPermi="['merchant:shop:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      style="margin-top: 20px"
      v-loading="loading"
      :data="insuranceList"
    >
      <el-table-column label="保险金变化表" align="center" prop="insuranceId" />
      <el-table-column label="保险金余额" align="center" prop="amount">
        <template slot-scope="scope">
          {{ scope.row.amount && toDecimal2(scope.row.amount / 100) }}
        </template>
      </el-table-column>
      <el-table-column label="缴纳总金额" align="center" prop="totalAmount">
        <template slot-scope="scope">
          {{ scope.row.totalAmount && toDecimal2(scope.row.totalAmount / 100) }}
        </template>
      </el-table-column>
      <el-table-column
        label="保险到期时间"
        align="center"
        prop="expiryDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expiryDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
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
import { listInsurance } from "@/api/distribution/insurance";
export default {
  name: "Insurance",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 查询条件显示
      showSearch: true,
      // 总条数
      total: 0,
      // 保险金表格数据
      insuranceList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: null,
        expiryDate: null,
        distributionId: this.$route.query.distributionId,
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询保险金列表 */
    getList() {
      this.loading = true;
      listInsurance(this.queryParams).then((response) => {
        this.insuranceList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.orgId = null;
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "distribution/insurance/export",
        {
          ...this.queryParams,
        },
        `distribution_insurance.xlsx`
      );
    },
  },
};
</script>