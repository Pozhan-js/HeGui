<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="变更类型" prop="stockTag">
        <dict-select v-model="queryParams.stockTag" dict="distribution_stock_type" />
      </el-form-item>
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入姓名或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
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
      <el-row>
        <el-form-item label="变更时间" prop="accountBeginTime">
          <RangePicker
            clearable
            size="small"
            :s-time.sync="queryParams.accountBeginTime"
            :e-time.sync="queryParams.accountEndTime"
            placeholder="选择变更时间"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:sell:infostock:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="时间" align="center" prop="countTime" width="100px" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="订单号" align="center" prop="stockOrderCode">
        <template slot-scope="{ row }">
          <div style="cursor: pointer;color: #1b70ef;" @click="handleDetails(row.stockOrderCode, row.stockTag)">{{ row.stockOrderCode }}</div>
        </template>
      </el-table-column>
      <el-table-column label="配送员信息" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.distributionName }}</div>
          <div>{{ scope.row.distributionPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="变更时间" align="center" prop="accountTime" />
      <el-table-column label="变更类型" align="center" prop="stockTagName" width="100px" />
      <el-table-column label="产品" align="center">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.stockChangeId">
            {{ item.goodsName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="变更前" align="center" width="80px">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.stockChangeId">
            {{ item.beforeStock }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="80px">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.stockChangeId">
            {{ item.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="变更后" align="center" width="80px">
        <template slot-scope="scope">
          <div v-for="item in scope.row.list" :key="item.stockChangeId">
            {{ item.afterStock }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="accountTypeName" />
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
import { listDistribution } from '@/api/order/infostock'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import DictSelect from '@/components/DictSelect.vue'
import RangePicker from '@/components/RangePicker.vue'

export default {
  name: 'Sell',
  components: {
    Cascader,
    DictSelect,
    RangePicker
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      list: [],
      // 组织
      orgOptions: [],
      // 商品信息
      goodsOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'account_time',
        isAsc: 'desc',
        idTag: null,
        goodsId: null,
        accountBeginTime: null,
        accountEndTime: null,
        stockTag: null
      }
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('goodsList').then(res => {
      this.goodsOptions = res.data
    })
    this.getList()
  },
  methods: {
    /** 查询经销存列表 */
    getList() {
      this.loading = true
      listDistribution(this.queryParams).then((response) => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    /** 订单详情 */
    handleDetails(orderId, stockTag) {
      console.log(stockTag)
      const path = stockTag === 1 ? '/order/delivery/allorder/details' : '/order/purchase/allorder/details'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('OrderInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          [stockTag === 1 ? 'orderId' : 'purchaseOrderId']: orderId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/distribution/sell/change/detail/export', this.queryParams)
    }
  }
}
</script>
