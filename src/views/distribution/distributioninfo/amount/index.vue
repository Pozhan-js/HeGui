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
      <el-form-item label="店铺id" prop="shopId">
        <el-input
          v-model="queryParams.shopId"
          placeholder="请输入店铺id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
     <el-row
          :gutter="10"
          class="mb8"
          style="margin-left: 75px; margin-top: 5px"
        >
          <el-col :span="1.5">
            <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
              >筛选</el-button
            >
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

    <el-table style="margin-top: 20px" v-loading="loading" :data="amountList">
      <el-table-column label="配送员余额表" align="center" prop="amountId" />
      <el-table-column label="配送员id" align="center" prop="distributionId" />
      <el-table-column label="店铺id" align="center" prop="shopId" />
      <el-table-column label="余额" align="center" prop="balance">
        <template slot-scope="scope">
          {{ scope.row.balance && toDecimal2(scope.row.balance / 100) }}
        </template>
      </el-table-column>
      <el-table-column label="总充值金额" align="center" prop="rechargeAmount">
        <template slot-scope="scope">
          {{
            scope.row.rechargeAmount &&
            toDecimal2(scope.row.rechargeAmount / 100)
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="总消费金额"
        align="center"
        prop="consumptionAmount"
      >
        <template slot-scope="scope">
          {{
            scope.row.consumptionAmount &&
            toDecimal2(scope.row.consumptionAmount / 100)
          }}
        </template>
      </el-table-column>
      <el-table-column label="总退款金额" align="center" prop="refundAmount">
        <template slot-scope="scope">
          {{
            scope.row.refundAmount && toDecimal2(scope.row.refundAmount / 100)
          }}
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
import { listAmount } from "@/api/distribution/amount";
;

export default {
  name: "Amount",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 质保金表格数据
      amountList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        distributionId: this.$route.query.distributionId,
        shopId: null,
      },
      
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询质保金列表 */
    getList() {
      this.loading = true;
      listAmount(this.queryParams).then((response) => {
        this.amountList = response.rows;
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
      this.queryParams.orgId = null
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "distribution/amount/export",
        {
          ...this.queryParams,
        },
        `distribution_amount.xlsx`
      );
    },
  },
};
</script>