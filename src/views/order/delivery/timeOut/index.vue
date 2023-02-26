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
      <el-form-item label="订单搜索" prop="orderValue">
        <el-input
          v-model="queryParams.orderValue"
          placeholder="请输入内容"
          clearable
          class="input-with-select"
          @keyup.enter.native="handleQuery"
        >
          <el-select
            slot="prepend"
            v-model="queryParams.orderKey"
            style="width: 200px"
            size="small"
          >
            <el-option
              v-for="dict in orderKeyOptions"
              :key="dict.key"
              :label="dict.name"
              :value="dict.key"
            />
          </el-select>
        </el-input>
      </el-form-item>
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
      <el-form-item label="物流状态" prop="distributionStatus">
        <el-select
          v-model="queryParams.distributionStatus"
          placeholder="请选择物流状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in logisticsStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
        <el-form-item label="支付时间" prop="payTime">
          <el-date-picker
            v-model="queryParams.payTime"
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['order:orderInfo:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.timeStatus"
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in orderTimeoutOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <div v-loading="loading">
      <div class="order_title">
        <div style="width: 22%; display: flex">
          <div style="width: calc(45% + 40px)">商品</div>
          <div style="width: 40%">单价/数量</div>
        </div>
        <div style="width: 9.7%">用户信息</div>
        <div style="width: 9.7%">应收总额（元）</div>
        <div style="width: 9.7%">实付金额（元）</div>
        <div style="width: 9.7%">配送员</div>
        <div style="width: 9.7%">收货信息</div>
        <div style="width: 9.7%">订单状态/物流状态</div>
        <!--  -->
        <div style="width: 9.7%">来源</div>
        <!-- <div style="width: 9.7%">来源</div> -->
        <div style="width: 9.7%">历时（分）</div>
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
            <div style="width: 400px">发票抬头：{{ row.invoice }}</div>
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
            <div
              class="totalPrice"
              style="cursor: pointer"
              @click="onJump(row.orderCustomer.customerId)"
            >
              <div>{{ row.orderCustomer.customerId }}</div>
              <div>
                <img
                  class="user_img"
                  :src="
                    row.orderCustomer.avatar
                      ? row.orderCustomer.avatar
                      : '/avatar.png'
                  "
                >
              </div>
              <div>{{ row.orderCustomer.nickname }}</div>
            </div>
            <div class="totalPrice">
              <div v-if="row.totalAmount !== '0'">{{ row.totalScore && row.totalScore !== '0' ? '金额：' : '' }}{{ row.totalAmount && toDecimal2(row.totalAmount / 100) }}</div>
              <div v-if="row.totalScore && row.totalScore !== '0'">积分：{{ row.totalScore }}</div>
            </div>
            <div class="totalPrice">
              <div v-if="row.actualPayAmount !== '0'">{{ row.totalScore && row.totalScore !== '0' ? '金额：' : '' }}{{ row.actualPayAmount && toDecimal2(row.actualPayAmount / 100) }}</div>
              <div v-if="row.totalScore && row.totalScore !== '0'">积分：{{ row.totalScore }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ row.distributionName }}</div>
              <div>{{ row.distributionPhone }}</div>
              <el-button
                v-if="['competition','not_distribution','begin_distribution'].includes(row.status)"
                type="text"
                @click="handleDispatchModel(row)"
              >调度</el-button>
            </div>
            <div class="totalPrice">
              <div>{{ row.orderCustomer.receiver }}</div>
              <div>{{ row.orderCustomer.telephone }}</div>
              <div>
                {{
                  row.orderCustomer.poiAddress || '' + row.orderCustomer.addressDetail
                }}
              </div>
            </div>
            <div class="totalPrice">
              <div>{{ statusFormat(row.status) }}</div>
              <div>{{ logisticsFormat(row.distributionStatus) }}</div>
            </div>
            <div class="totalPrice">
              {{ accessMethodFormat(row.accessMethod) }}
            </div>
            <div class="but">
              {{ row.payToNowMinute }}
            </div>
          </div>
          <div>买家备注：{{ row.buyerNotes }}</div>
          <div>卖家备注：{{ row.sellerNotes }}</div>
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
    <el-dialog
      title="调度"
      :visible.sync="dispatchOpen"
      width="1400px"
      append-to-body
    >
      <Schedule :data="distributionList" :location="dispatchLocation" @checkDis="checkDis" />
    </el-dialog>
  </div>
</template>

<script>
import { listOrderInfo } from '@/api/order/timeOut'
import {
  getDistribution,
  pushDistribution
} from '@/api/order/orderInfo'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import Schedule from '@/components/schedule.vue'
import { Notification } from 'element-ui'

export default {
  name: 'TimeOut',
  components: {
    Cascader,
    Schedule
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      dispatchOpen: false,
      // 订单位置
      dispatchLocation: null,
      // 主订单表格数据
      orderInfoList: [],
      // 订单状态
      orderStatusOptions: [],
      // 物流状态
      logisticsStatusOptions: [],
      // 来源
      accessMethodOptions: [],
      // 超时状态
      orderTimeoutOptions: [],
      // 来源
      orderPayWayOptions: [],
      // 配送员
      distributionList: [],
      // 组织
      orgOptions: [],
      // 订单搜索名称Key
      orderKeyOptions: [
        { key: 'orderNo', name: '订单编号' },
        { key: 'buyerNickname', name: '购买人昵称' },
        { key: 'consigneeName', name: '收货人姓名' },
        { key: 'consigneePhone', name: '收货人电话' },
        { key: 'phoneLowerFour', name: '收货人手机号后4位' }
      ],
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
        orderKey: 'orderNo',
        orderValue: null,
        payTime: null,
        distributionStatus: null,
        accessMethod: null,
        timeStatus: 'all',
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
    this.getDicts('order_status').then((response) => {
      this.orderStatusOptions = response.data
    })
    this.getDicts('delivery_order_logistics_status').then((response) => {
      this.logisticsStatusOptions = response.data
    })
    this.getDicts('delivery_order_access_method').then((response) => {
      this.accessMethodOptions = response.data
    })
    this.getDicts('order_timeout_flag').then((response) => {
      this.orderTimeoutOptions = response.data
    })
    this.getDicts('order_pay_way').then((response) => {
      this.orderPayWayOptions = response.data
    })

    this.getList()
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询主订单列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
        [this.queryParams.orderKey]: this.queryParams.orderValue
      }
      if (params.timeStatus === 'all') delete params.timeStatus
      if (this.queryParams.payTime && this.queryParams.payTime.length === 2) {
        params.payBeginTime = this.queryParams.payTime[0]
        params.payEndTime = this.queryParams.payTime[1]
      }
      delete params.orderKey
      delete params.orderValue
      delete params.payTime
      listOrderInfo(params).then((response) => {
        this.orderInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 订单状态
    statusFormat(status) {
      return this.selectDictLabel(this.orderStatusOptions, status)
    },
    logisticsFormat(status) {
      return this.selectDictLabel(this.logisticsStatusOptions, status)
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
      this.queryParams.orderKey = 'buyerNickname'
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    /** 打开model框 */
    handleDispatchModel(row) {
      getDistribution(row.orderId).then((res) => {
        this.form = {
          orderId: row.orderId
        }
        this.dispatchOpen = true
        this.distributionList = res.data
        this.dispatchLocation = row.orderCustomer.location
      })
    },
    /** 选择配送员 */
    checkDis(distributionId) {
      this.$confirm('是否确认选择配送员？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return pushDistribution({
            orderId: this.form.orderId,
            distributionId
          }).then(res => {
            if (res.code !== 200) return Notification.error({ title: res.msg })
            this.dispatchOpen = false
            this.getList()
            this.msgSuccess('调度成功')
          })
        })
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
      this.download(
        'order/orderInfo/export',
        {
          ...this.queryParams
        },
        `order_orderInfo.xlsx`
      )
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
  // background-color: #f8f8f9;
  // color: #515a6e;
  background-color: #e3e3e3;
  color: #333;
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
    width: 9.7%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 9.7%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
