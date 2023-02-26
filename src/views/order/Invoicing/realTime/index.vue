<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          size="mini"
          @click="handleExport"
          v-hasPermi="['distribution:sell:export']"
          >导出
        </el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="sellList">
      <el-table-column min-width="90" label="时间" align="center" prop="countTime" />
      <el-table-column min-width="110" label="供应商名称" align="center" prop="orgName" />
      <el-table-column min-width="110" label="送货员" align="center" prop="deliveryName">
        <template slot-scope="scope">
          <div>{{ scope.row.deliveryName }}</div>
          <div>{{ scope.row.deliveryPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="配送员" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.distributionName }}</div>
          <div>{{ scope.row.distributionPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="商品" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.goodsName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100"  label="上日库存" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.lastStock }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="当日采购量" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.currentPro }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="当日销量" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.currentSale }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="当日库存" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.currentStock }}
          </div>
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
import { listStock } from "@/api/order/realTime";
import { Cascader } from "ant-design-vue";

export default {
  name: "RealTime",
  components: {
    Cascader
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 经销存表格数据
      sellList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'count_time',
        isAsc:'asc'
      },
    };
  },
  created() {
    if (this.$route.query.distributionId) {
      this.queryParams.distributionId = this.$route.query.distributionId
    }
    this.getList();
  },
  methods: {
    /** 查询经销存列表 */
    getList() {
      this.loading = true;
      listStock(this.queryParams).then((response) => {
        this.sellList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "distribution/sell/export",
        {
          ...this.queryParams,
        },
        `distribution_sell.xlsx`
      );
    },
  },
};
</script>