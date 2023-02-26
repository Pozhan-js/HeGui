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
      <el-form-item label="选择日期" prop="countTimes">
        <el-date-picker
          v-model="queryParams.countTimes"
          :type="timeType"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="商品" prop="goodsId">
        <el-select
          v-model="queryParams.goodsId"
          placeholder="请选择商品"
          clearable
          filterable
          size="small"
        >
          <el-option
            v-for="goods in goodsOptions"
            :key="goods.goodsId"
            :label="goods.goodsName"
            :value="goods.goodsId"
          />
        </el-select>
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
        <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['distribution:sell:orgexport']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      v-model="timeType"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="日库存" name="date" />
      <el-tab-pane label="月库存" name="month" />
    </el-tabs>

    <el-table v-loading="loading" :data="sellList">
      <el-table-column min-width="90" label="时间" align="center" prop="countTime" />
      <el-table-column min-width="120" label="供应商名称" align="center" prop="orgName" />
      <el-table-column min-width="120" label="商品" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.goodsName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" :label="timeType === 'date' ? '上日库存' : '上月库存'" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.lastStock }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" :label="timeType === 'date' ? '当日采购量' : '当月采购量'" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.currentPro }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" :label="timeType === 'date' ? '当日销量' : '当月销量'" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.statisticsId">
            {{ item.currentSale }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" :label="timeType === 'date' ? '当日库存' : '当月库存'" align="center">
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
import { listSell } from "@/api/order/supplier";
import { getOrgTree } from "@/api/utils";
import moment from "moment";
import { Cascader } from "ant-design-vue";
import { getDropDown } from "@/api/selectUtils";

export default {
  name: "Sell",
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
      // 组织
      orgOptions: [],
      // 商品数据
      goodsOptions: [],
      // 时间类型
      timeType: "date",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsId: null,
        countTimes: moment(new Date()).format(
          this.timeType === "month" ? "YYYY-MM" : "YYYY-MM-DD"
        ),
        orderByColumn: 'count_time',
        isAsc:'asc'
      },
    };
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
    getDropDown('goodsList').then(res => {
      this.goodsOptions = res.data
    })
    this.getList();
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1;
      this.getList()
    },
    /** 初始化查询参数 */
    queryParamFomat() {
      const params = {
        ...this.queryParams,
        countTimes: moment(this.queryParams.countTimes).format(
          this.timeType === "month" ? "YYYY-MM" : "YYYY-MM-DD"
        ),
      };
      return params
    },
    /** 查询经销存列表 */
    getList() {
      this.loading = true;
      listSell(this.queryParamFomat()).then((response) => {
        this.sellList = response.rows;
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
      this.download("/distribution/sell/orgexport", this.queryParamFomat());
    },
  },
};
</script>