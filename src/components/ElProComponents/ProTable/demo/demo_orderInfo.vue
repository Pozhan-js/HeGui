<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/ordercenter/order/list' }"
    :columns="columns"
    :params="params"
    :search-tabs-config="searchTabsConfig"
    row-key="orderId"
  >
    <template #search-btns="">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:orderInfo:exportOrder']"
          size="mini"
        >导出订单
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['order:orderInfo:exportGoods']"
          size="mini"
        >导出商品
        </el-button>
      </el-col>
    </template>

    <template #table-main="{ data, loading}">
      <div v-loading="loading">
        <div class="order_title">
          <div style="width: 22%; display: flex">
            <div style="width: calc(45% + 40px)">商品</div>
            <div style="width: 40%">单价/数量</div>
          </div>
          <div style="width: 7.8%">用户信息</div>
          <div style="width: 7.8%">应收总额（元）</div>
          <div style="width: 7.8%">实付金额（元）</div>
          <div style="width: 7.8%">配送员</div>
          <div style="width: 7.8%">收货信息</div>
          <div style="width: 7.8%">订单状态</div>
          <div style="width: 7.8%">物流状态</div>
          <div style="width: 7.8%">订单类型</div>
          <div style="width: 7.8%">来源</div>
          <div style="width: 7.8%">操作</div>
        </div>
        <div>
          <div
            v-for="(row, index) in data"
            :key="index"
            class="table_div"
          >
            <div class="order">
              <div style="width: 300px">订单凭证号：{{ row.outTradeNo }}</div>
              <div style="width: 300px">订单号：{{ row.orderNo }}</div>
              <div style="width: 350px">下单时间：{{ row.createTime }}</div>
              <div style="width: 400px">发票抬头：{{ row.invoice }}</div>
              <div
                v-if="['prepare', 'prepay', 'paying'].includes(row.status)"
                style="margin-left: auto; padding-right: 120px; display: flex"
              >
                <el-button
                  v-hasPermi="['order:orderInfo:close']"
                  size="mini"
                  type="text"
                >关闭订单</el-button>
              </div>
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
                <div class="outer-link--text">{{ row.orderCustomer.nickname }}</div>
              </div>
              <div class="totalPrice">
                {{ row.totalAmount && toDecimal2(row.totalAmount / 100) }}
              </div>
              <div class="totalPrice">
                {{ row.actualPayAmount && toDecimal2(row.actualPayAmount / 100) }}
              </div>
              <div class="totalPrice">
                <div>{{ row.distributionName }}</div>
                <div>{{ row.distributionPhone }}</div>
                <el-button
                  v-if="['competition','not_distribution','begin_distribution'].includes(row.status)"
                  type="text"
                >调度</el-button>
              </div>
              <div class="totalPrice">
                <div>{{ row.orderCustomer.receiver }}</div>
                <div>{{ row.orderCustomer.telephone }}</div>
                <div>
                  {{
                    row.orderCustomer.poiAddress + row.orderCustomer.addressDetail
                  }}
                </div>
              </div>
              <div class="totalPrice">
                <div>{{ formtDictName(row.status, 'orderStatus') }}</div>
              </div>
              <div class="totalPrice">
                {{ formtDictName(row.distributionStatus, 'distributionStatus') }}
              </div>
              <div class="totalPrice">{{ formtDictName(row.orderType, 'orderType') }}</div>
              <div class="totalPrice">
                {{ formtDictName(row.accessMethod, 'accessMethod') }}
              </div>
              <div class="but">
                <el-button
                  v-hasPermi="['order:orderInfo:query']"
                  class="outer-link--text"
                  size="mini"
                  type="text"
                >订单详情</el-button>
                <el-button
                  v-hasPermi="['order:orderInfo:remark']"
                  size="mini"
                  type="text"
                >备注</el-button>
                <el-button
                  v-if="row.distributionStatus === 'complete_distribution'"
                  v-hasPermi="['finance:distributionDetail:add']"
                  size="mini"
                  type="text"
                >奖励</el-button>
                <el-button
                  v-if="row.distributionStatus === 'complete_distribution'"
                  v-hasPermi="['finance:distributionDetail:add']"
                  size="mini"
                  type="text"
                >处罚</el-button>
                <el-button
                  v-if="refundStatus.includes(row.status) && row.wechatPayAmount > 0"
                  v-hasPermi="['order:orderInfo:refund']"
                  size="mini"
                  type="text"
                >现金退款</el-button>
                <el-button
                  v-if="row.distributionStatus === 'begin_distribution'"
                  v-hasPermi="['order:orderInfo:finish']"
                  size="mini"
                  type="text"
                >完成</el-button>
              </div>
            </div>
            <div>买家备注：{{ row.buyerNotes }}</div>
            <div>卖家备注：{{ row.sellerNotes }}</div>
          </div>
        </div>
      </div>
    </template>

  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {
      orderByColumn: 'order_time',
      isAsc: 'desc'
    },
    searchTabsConfig: {
      paramKey: 'allOrderStatus',
      dictName: 'order_all_flag'
    },
    prefix: sessionStorage.getItem('prefix'),
    refundStatus: ['payed', 'competition', 'not_distribution', 'begin_distribution', 'complete_distribution', 'not_comment', 'applyAfterSales']
  }),
  computed: {
    columns() {
      return [
        { label: '组织', prop: 'orgId', valueType: 'treeSelect' },
        { label: '订单凭证号', prop: 'outTradeNo' },
        { label: '配送员', prop: 'distribution' },
        { label: '订单状态', prop: 'orderStatus', valueType: 'dictSelect', fieldProps: { dict: 'order_status' }},
        { label: '物流状态', prop: 'distributionStatus', valueType: 'dictSelect', fieldProps: { dict: 'delivery_order_logistics_status' }},
        { label: '订单类型', prop: 'orderType', valueType: 'dictSelect', fieldProps: { dict: 'order_type' }},
        { label: '来源', prop: 'accessMethod', valueType: 'dictSelect', fieldProps: { dict: 'delivery_order_access_method' }},
        { label: '售后状态', prop: 'afterSalesStatus', valueType: 'dictSelect', fieldProps: { dict: 'delivery_order_after_sales' }},
        { label: '订单编号', prop: 'orderNo' },
        { label: '下单时间', prop: 'orderTime', minWidth: 120, valueType: 'dateTimeRange', paramsRange: ['orderBeginTime', 'orderEndTime'] }
      ]
    }
  },
  methods: {
    formtDictName(value, prop) {
      return this.$refs.proTableRef?.convertDictLabel(value, prop)
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
    width: 7.8%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 7.8%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
