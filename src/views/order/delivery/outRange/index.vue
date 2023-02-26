<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
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
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单凭证号" prop="outTradeNo">
        <el-input
          v-model="queryParams.outTradeNo"
          placeholder="请输入订单凭证号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="来源" prop="accessMethod">
        <el-select
          v-model="queryParams.accessMethod"
          placeholder="请选择来源"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in accessMethodOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="下单时间" prop="orderTime">
          <el-date-picker
            v-model="queryParams.orderTime"
            clearable
            size="small"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
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
            v-hasPermi="['order:orderInfo:exportOutRangeOrder']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <div v-loading="loading" style="margin-top: 20px">
      <div class="order_title">
        <div style="width: 22%; display: flex">
          <div style="width: calc(45% + 40px)">商品</div>
          <div style="width: 40%">单价/数量</div>
        </div>
        <div style="width: 13%">用户信息</div>
        <div style="width: 13%">应付金额</div>
        <div style="width: 13%">收货信息</div>
        <div style="width: 13%">来源</div>
        <div style="width: 13%">逆解析地址</div>
        <div style="width: 13%">详细地址</div>
      </div>
      <div>
        <div
          v-for="(row, index) in orderInfoList"
          :key="index"
          class="table_div"
        >
          <div class="order">
            <div style="width: 300px">订单凭证号：{{ row.outTradeNo }}</div>
            <div style="width: 300px">订单号：{{ row.orderNo }}</div>
            <div style="width: 350px">下单时间：{{ row.createTime }}</div>
          </div>
          <div class="table">
            <div class="goods">
              <div
                v-for="goods in row.orderGoodsList"
                :key="goods.goodsId"
                style="padding: 5px; display: flex"
              >
                <img v-if="goods.thumbnail" class="img" :src="prefix + goods.thumbnail">
                <img v-else class="img" src="~@/assets/images/coupon.png">
                <div class="goodsName">{{ goods.goodsName }}</div>
                <div class="price">
                  {{ goods.price && toDecimal2(goods.price / 100) }}元/{{
                    goods.goodsNum
                  }}包
                </div>
              </div>
            </div>
            <!-- @click="onJump(row.customerId)"  -->
            <div class="totalPrice" style="cursor: pointer">
              <div>{{ row.customerId }}</div>
              <div>
                <img
                  class="user_img"
                  :src="row.avatar ? row.avatar : '/avatar.png'"
                >
              </div>
              <div>{{ row.nickname }}</div>
            </div>
            <div class="totalPrice">
              {{ row.needPayAmount && toDecimal2(row.needPayAmount / 100) }}
            </div>
            <div class="totalPrice">
              <div>{{ row.customerName }}</div>
              <div>{{ row.telephone }}</div>
              <div>{{ row.addressDetail }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ accessMethodFormat(row.accessMethod) }}</div>
            </div>
            <div class="totalPrice">{{ row.poiAddress }}</div>
            <div class="totalPrice">{{ row.addressDetail }}</div>
          </div>
          <!-- <div>买家备注：{{row.buyerNotes}}</div> -->
          <!-- <div>卖家备注：{{row.sellerNotes}}</div> -->
        </div>
      </div>
    </div>
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
import { listOrderInfo } from '@/api/order/outRange'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'OutRange',
  components: {
    Cascader
  },
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length === 5,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 组织
      orgOptions: [],
      // 来源
      accessMethodOptions: [],
      // 列表数据
      orderInfoList: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'))
              const end = new Date(moment(new Date()).endOf('day'))
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(start).endOf('day'))
              ])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        outTradeNo: null,
        orderTime: null,
        orderNo: null,
        accessMethod: null,
        orderByColumn: 'order_time',
        isAsc: 'desc'
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
    this.getDicts('delivery_order_access_method').then((response) => {
      this.accessMethodOptions = response.data
    })
    this.getList()
  },
  methods: {
    /** 格式化查询参数 */
    paramsFormat() {
      const params = {
        ...this.queryParams,
        [this.queryParams.orderKey]: this.queryParams.orderValue
      }
      if (
        this.queryParams.orderTime &&
        this.queryParams.orderTime.length === 2
      ) {
        params.orderBeginTime = this.queryParams.orderTime[0]
        params.orderEndTime = this.queryParams.orderTime[1]
      }
      delete params.orderTime
      return params
    },
    /** 查询主订单列表 */
    getList() {
      this.loading = true
      listOrderInfo(this.paramsFormat()).then((response) => {
        this.orderInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 来源
    accessMethodFormat(status) {
      return this.selectDictLabel(this.accessMethodOptions, status)
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
    // 跳转客户界面
    onJump(customerId) {
      this.$router.push({
        path: '/customer/customerInfo',
        query: {
          customerId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/ordercenter/order/outRange/export', this.paramsFormat())
    }
  }
}
</script>
<style scoped lang="scss">
.table_div:hover {
  background-color: #f5f7fa;
}
.table_div {
  color: #606266;
  border-bottom: 1px solid #e2e2e2;
}
.order {
  margin-top: 5px;
  display: flex;
  background-color: #e3e3e3;
  color: #333;
  font-size: 14px;
  padding: 10px;
}

.order_title {
  display: flex;
  text-align: center;
  background-color: #f8f8f9;
  color: #515a6e;
  font-size: 14px;
  font-weight: 600;
  padding: 15px 10px;
  border-bottom: 1px solid #e2e2e2;
}

.table {
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  flex-direction: row;
  padding: 10px;
  font-size: 14px;
  .goods {
    width: 22%;
    .img {
      width: 40px;
      height: 40px;
      vertical-align: middle;
    }
    .goodsName {
      width: 45%;
      margin: auto;
    }
    .price {
      width: 40%;
      margin: auto;
      text-align: center;
    }
  }
  .user_img {
    width: 40px;
    height: 40px;
    border-radius: 50px;
  }
  .totalPrice {
    width: 13%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 13%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
