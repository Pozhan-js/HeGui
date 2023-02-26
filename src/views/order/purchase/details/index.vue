<template>
  <div v-if="data" v-loading="loading" class="app-container">
    <el-row>
      <el-col :span="24">
        <el-steps :active="orderType" align-center>
          <el-step
            v-for="(item, index) in data.purchaseOrderStatusList"
            :key="index"
            :title="item.orderStatusDesc"
            :description="item.orderTime"
          />
        </el-steps>
      </el-col>
    </el-row>
    <el-row style="padding: 20px; margin-top: 20px">
      <el-col :span="5" style="font-size: 14px">
        <div style="display: flex; line-height: 20px">
          <div class="title" style="margin: unset;">订单编号：</div>
          {{ data.purchaseOrder.orderNo }}
        </div>
        <div style="width: 300px; margin-top: 10px">
          <div class="minTabtitle borderColor">付款信息</div>
          <div class="borderColor" style="border: 1px solid">
            <div style="display: flex">
              <div class="black borderColor" style="border-right: 1px solid">
                订单价值
              </div>
              <div class="black">
                {{
                  data.purchaseOrder.amount &&
                    toDecimal2(data.purchaseOrder.amount / 100)
                }}
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="9" style="font-size: 14px">
        <div style="display: flex">
          <div class="title" style="text-align: left;margin: unset;">物流方式：</div>
          <div>即时物流</div>
        </div>
        <el-tab-pane label="派单日志" name="dispatch">
          <el-table height="400" :data="data.distributionPushLogList" style="width: 100%">
            <el-table-column prop="distributionName" label="姓名" />
            <el-table-column prop="type" label="类型" :formatter="pushTypeFormat" />
            <el-table-column prop="distributionTelephone" label="手机号" />
            <el-table-column prop="createTime" label="时间" />
            <el-table-column prop="distance" label="距离" />
            <el-table-column prop="goodsStockInfo" label="库存价值" />
          </el-table>
        </el-tab-pane>
      </el-col>
      <el-col :span="5" style="font-size: 14px;padding-left: 20px;">
        <div style="width: 400px;">
          <div class="minTabtitle borderColor">客户信息</div>
          <div class="borderColor" style="border: 1px solid;">
            <div style="display: flex;">
              <div class="black borderColor" style="border-right: 1px solid;">收货人姓名</div>
              <div class="black">{{ data.purchaseOrder.distributionName }}</div>
            </div>
            <div class="borderColor" style="display: flex;border-bottom: 1px solid;border-top: 1px solid;">
              <div class="black borderColor" style="border-right: 1px solid;">收货人电话</div>
              <div class="black">{{ data.purchaseOrder.distributionPhone }}</div>
            </div>
            <div style="display: flex;">
              <div class="black borderColor" style="border-right: 1px solid;">收货人区域</div>
              <div class="black">{{ data.purchaseOrder.orgName }}</div>
            </div>
            <div class="borderColor" style="display: flex;border-top: 1px solid;">
              <div class="black borderColor" style="border-right: 1px solid;">地址（反解析）</div>
              <div class="black" style="line-height: 25px">{{ data.purchaseOrder.fullAddress }}</div>
            </div>
            <div class="borderColor" style="display: flex;border-top: 1px solid;">
              <div class="black" style="line-height: normal;margin: auto;width: 149px;">详细地址</div>
              <div class="black borderColor" style="line-height: inherit;padding: 5px;border-left: 1px solid;">{{ data.purchaseOrder.addressDetail }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row style="padding: 20px;">
      <div class="orderTable">
        <div style="width: 15%">商品</div>
        <div style="width: 15%">单价（元）</div>
        <div style="width: 15%">数量</div>
        <div style="width: 18.3%">应付（元）</div>
        <div style="width: 18.3%">确认款（元）</div>
        <div style="width: 18.4%">状态</div>
      </div>
      <div style="font-size: 14px;display: flex;">
        <div style="width: 81.6%;">
          <div v-for="goods in data.purchaseOrderGoodsList" :key="goods.goodsId" style="display: flex;">
            <div style="width: 18.51%;display: flex;padding: 10px 0;">
              <img class="img" :src="prefix + goods.thumbnail">
              <div class="goodsName">{{ goods.goodsName }}</div>
            </div>
            <div style="width: 18.51%;text-align: center;margin: auto 0;">
              {{ goods.price && toDecimal2(goods.price / 100) }}元
            </div>
            <div style="width: 18.51%;text-align: center;margin: auto 0;">
              {{ goods.num }}包
            </div>
            <div class="table_text" style="width: 22.62%;margin: auto 0;">
              {{ toDecimal2(parseInt(goods.price) * parseInt(goods.num) / 100) }}
            </div>
            <div class="table_text" style="width: 22.62%;margin: auto 0;">
              {{ toDecimal2(parseInt(goods.price) * parseInt(goods.num) / 100) }}
            </div>
          </div>
        </div>
        <div class="table_text" style="width: 18.4%;margin: auto 0;">
          {{ statusFormat(data.purchaseOrder.orderStatus) }}
        </div>
      </div>
    </el-row>
    <el-row>
      <el-col :push="18" :span="4" style="line-height: 30px;font-size: 14px;">
        <div style="display: flex;">
          <div class="title" style="width: 120px">商品小计：</div>
          <div>￥{{ toDecimal2(subtotal / 100) }}</div>
        </div>
        <div style="display: flex;">
          <div class="title" style="width: 120px">确认金额：</div>
          <div>￥{{ toDecimal2(subtotal / 100) }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getOrderInfo } from '@/api/order/purchase'

export default {
  name: 'Details',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      data: null,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 步骤条
      orderType: 0,
      // 列表展示
      activeName: 'order',
      // 派单类型
      pushTypeOptions: [],
      // 订单类型
      orderStatusOptions: [],
      // 商品小计
      subtotal: 0
    }
  },
  created() {
    this.getOrder()
    this.getDicts('distribution_push_type').then((response) => {
      this.pushTypeOptions = response.data
    })
    this.getDicts('purchase_status').then((response) => {
      this.orderStatusOptions = response.data
    })
  },
  methods: {
    /** 查询订单详情 */
    getOrder() {
      this.loading = true
      getOrderInfo(this.$route.query.purchaseOrderId).then((res) => {
        this.loading = false
        this.data = res.data
        let subtotal = 0
        res.data.purchaseOrderGoodsList.map(item => {
          subtotal += item.num * item.price
        })
        this.subtotal = subtotal
        let orderType = 1
        res.data.purchaseOrderStatusList.map((item, index) => {
          if (item.orderTime) {
            orderType = index + 1
          }
        })
        this.orderType = orderType
        // this.orderType = {
        //   create: 1,
        //   payed: 2,
        //   take_order: 3,
        //   distribution: 4,
        //   done: 5,
        // }[res.data.purchaseOrder.orderStatus];
      })
    },
    // 派单类型字典翻译
    pushTypeFormat(row, column) {
      return this.selectDictLabel(this.pushTypeOptions, row.type)
    },
    // 订单类型
    statusFormat(status) {
      console.log(status)
      return this.selectDictLabel(this.orderStatusOptions, status)
    }
  }
}
</script>
<style scoped lang="scss">
.borderColor {
  border-color: #e2e2e2 !important;
}
.minTabtitle {
  width: 100%;
  padding: 5px;
  font-size: 14px;
  text-align: center;
  border: 1px solid;
  border-bottom-style: none;
}
.title {
  width: 80px;
  text-align: end;
}
.black {
  width: 200px;
  line-height: 35px;
  text-align: center;
}
.table_bleck {
  padding: 5px 0;
  border-right: 1px solid;
}
.table_info {
  overflow: auto;
  max-height: 250px;
}
.table_info::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 6px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.table_info::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #535353;
}
.table_info::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
}
.orderTable {
  display: flex;
  text-align: center;
  background-color: #f8f8f9;
  color: #515a6e;
  font-size: 14px;
  font-weight: 600;
  padding: 15px 10px;
}

  .img {
    width: 40px;
    height: 40px;
    vertical-align: middle;
  }
  .goodsName {
    width: 45%;
    margin: auto;
    text-align: center;
  }
.table_text {
  margin: auto 0;
  text-align: center;
}
</style>
