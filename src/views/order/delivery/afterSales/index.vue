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
      <el-form-item label="配送员" prop="distribution">
        <el-input
          v-model="queryParams.distribution"
          placeholder="请输入姓名或手机号码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
      <el-form-item label="维权状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择维权状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in afterSalesOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="维权时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
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
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
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

    <el-tabs v-model="queryParams.afterSalesStatus" class="tabContainer" style="margin-top: 20px" type="card" @tab-click="tabCheck">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane v-for="dict in orderSalesOptions" :key="dict.dictValue" :label="dict.dictLabel" :name="dict.dictValue" />
    </el-tabs>

    <div v-loading="loading">
      <div class="order_title">
        <div style="width: 22%; display: flex">
          <div style="width: calc(45% + 40px)">商品</div>
          <div style="width: 40%">单价/数量</div>
        </div>
        <div style="width: 8.6%">用户信息</div>
        <div style="width: 8.6%">应收总额（元）</div>
        <div style="width: 8.6%">实付金额（元）</div>
        <div style="width: 8.6%">配送员</div>
        <div style="width: 8.6%">收货信息</div>
        <div style="width: 8.6%">订单状态/物流状态</div>
        <div style="width: 8.6%">维权状态</div>
        <!-- <div style="width: 8.6%">来源</div> -->
        <div style="width: 8.6%">维权时间</div>
        <div style="width: 8.6%">操作</div>
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
            <div style="width: 350px">下单时间：{{ row.orderInfo && row.orderInfo.createTime }}</div>
            <div style="width: 400px">发票抬头：{{ row.orderInfo && row.orderInfo.invoice }}</div>
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
            <div class="totalPrice" style="cursor: pointer;" @click="onJump(row.customerId)">
              <div>{{ row.customerId }}</div>
              <div>
                <img
                  class="user_img"
                  :src="row.customerAvatar ? row.customerAvatar : '/avatar.png'"
                >
              </div>
              <div>{{ row.customerNickname }}</div>
            </div>
            <div class="totalPrice">
              <div v-if="row.orderInfo && row.orderInfo.totalAmount !== '0'">{{ row.orderInfo.totalScore && row.orderInfo.totalScore !== '0' ? '金额：' : '' }}{{ row.orderInfo.totalAmount && toDecimal2(row.orderInfo.totalAmount / 100) }}</div>
              <div v-if="row.orderInfo && row.orderInfo.totalScore && row.orderInfo.totalScore !== '0'">积分：{{ row.orderInfo.totalScore }}</div>
            </div>
            <div class="totalPrice">
              <div v-if="row.orderInfo && row.orderInfo.actualPayAmount !== '0'">{{ row.totalScore && row.totalScore !== '0' ? '金额：' : '' }}{{ row.orderInfo && row.orderInfo.actualPayAmount && toDecimal2(row.orderInfo.actualPayAmount / 100) }}</div>
              <div v-if="row.orderInfo.totalScore && row.orderInfo.totalScore !== '0'">积分：{{ row.totalScore }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ row.distributionName }}</div>
              <div>{{ row.distributionTelephone }}</div>
              <el-button
                v-if="['competition','not_distribution','begin_distribution'].includes(row.status)"
                type="text"
                @click="handleDispatchModel(row)"
              >调度</el-button>
            </div>
            <div class="totalPrice">
              <div>{{ row.orderCustomer.receiver }}</div>
              <div>{{ row.orderCustomer.telephone }}</div>
              <div>{{ row.orderCustomer.poiAddress || '' + row.orderCustomer.addressDetail }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ statusFormat(row.orderInfo.status) }}</div>
              <div>{{ logisticsFormat(row.orderInfo.distributionStatus) }}</div>
            </div>
            <div class="totalPrice">{{ afterSalesFormat(row.status) }}</div>
            <div class="but">
              {{ row.createTime }}
            </div>
            <div class="but">
              <div>{{ salesTypeFormat(row.applyType) }}</div>
              <el-button v-hasPermi="['order:afterSales:update']" size="mini" type="text" @click="handleModel(row.orderAfterSalesId)">详情</el-button>
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
    <el-dialog title="审核" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="申请理由:" prop="applyReason">
          <div>{{ form.applyReason }}</div>
          <!-- <el-input class="input_dis" v-model="form.applyReason" disabled/> -->
        </el-form-item>
        <el-form-item label="申请说明:" prop="applyRemark">
          <div>{{ form.applyRemark }}</div>
          <!-- <el-input class="input_dis" v-model="form.applyRemark" disabled /> -->
        </el-form-item>
        <el-form-item label="图片:" prop="applyImage">
          <el-row v-if="form.applyImage">
            <el-col v-for="(item, index) in form.applyImage.split(',')" :key="index" :span="4">
              <el-image
                style="width: 50px;height: 50px;padding: 0 5px;"
                :z-index="3000"
                :src="prefix + item"
                :preview-src-list="form.applyImage.split(',').map(item => prefix + item)"
              />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="申请金额:" prop="payAmount">
          <el-row>
            <el-col :span="20">
              <div style="font-size: 16px;">{{ form.payAmount && toDecimal2(form.payAmount / 100) }}<span style="    padding: 0 10px;">元</span></div>
              <!-- <el-input class="input_dis" v-model="form.payAmount" disabled /> -->
            </el-col>
            <!-- <el-col :span="4" style="text-align: center;">元</el-col> -->
          </el-row>
        </el-form-item>
        <el-form-item label="可退金额:" prop="refundAmount">
          <el-row>
            <el-col :span="20">
              <!-- <div>{{ form.refundAmount && toDecimal2(form.refundAmount / 100) }}<span>元</span></div> -->
              <el-input-number v-model="form.refundAmount" style="width: 100%;" disabled :min="0" :max="parseInt(form.payAmount)" />
            </el-col>
            <el-col :span="4" style="text-align: center;">元</el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-row>
            <el-col :span="12">
              <span>注：最多可退</span>{{ toDecimal2(form.payAmount / 100) }}元；
            </el-col>
            <el-col :span="12" style="text-align: end;">
              <!-- @click="() => form.refundAmount = form.payAmount / 100" -->
              <el-button type="text" style="color: red;margin-right: 20px;">实付金额</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button v-for="item in salesTypeOptions" :key="item.dictValue" :disabled="form.status !== 'apply' ? form.type !== item.dictValue : false" :label="item.dictValue">{{ item.dictLabel }}</el-radio-button>
          </el-radio-group>
          <div v-if="form.type" style="color: red;">
            备注：
            <span v-if="form.type === 'exchange' || form.type === 'refund'">不会返回库存</span>
            <span v-else-if="form.type === 'returnGoodsAndRefund'">会返回库存</span>
            <!-- {{exchange: '不会返回库存', refund: '不会返回库存', returnGoodsAndRefund: '会返回库存'}[form.type]} -->
          </div>
        </el-form-item>
        <el-form-item v-if="form.type === 'returnGoodsAndRefund'" label="原因" prop="reasonType">
          <el-radio-group v-model="form.reasonType">
            <el-radio-button v-for="item in reasonTypeOptions" :key="item.dictValue" :disabled="form.status !== 'apply' ? form.reasonType !== item.dictValue : false" :label="item.dictValue">{{ item.dictLabel }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            :disabled="form.status !== 'apply'"
            type="textarea"
            placeholder="请输入卖家备注"
            :autosize="{ minRows: 3, maxRows: 5}"
            maxlength="15"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="form.status !== 'apply'" label="审核状态">
          <div :style="{ color: {agree: 'green', refuse: 'red'}[form.status]}">{{ {agree: '同意', refuse: '拒绝'}[form.status] }}</div>
        </el-form-item>
      </el-form>
      <div v-if="form.status === 'apply'" slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="12" style="text-align: center;">
            <el-button
              type="primary"
              :loading="this.$store.state.isLoading"
              @click="submitForm('agree')"
            >同 意</el-button>
          </el-col>
          <el-col :span="12" style="text-align: center;">
            <el-button type="danger" @click="handleRefuse('refuse')">拒 绝</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
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
import { listOrderInfo, getProtectionDetails, updateSales } from '@/api/order/afterSales'
import {
  getDistribution,
  pushDistribution
} from '@/api/order/orderInfo'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import Item from '@/layout/components/Sidebar/Item.vue'
import Schedule from '@/components/schedule.vue'
import { Notification } from 'element-ui'

export default {
  name: 'AfterSales',
  components: {
    Cascader,
    Item,
    Schedule
  },
  data() {
    return {
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层
      dispatchOpen: false,
      // 订单位置
      dispatchLocation: null,
      // 表单参数
      form: {},
      // 规则
      rules: {
        refundAmount: [{ required: true, message: '想退金额不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '审核类型不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '审核备注不能为空', trigger: 'blur' }],
        reasonType: [{ required: true, message: '原因不能为空不能为空', trigger: 'blur' }]
      },
      // 主订单表格数据
      orderInfoList: [],
      // 订单状态
      orderStatusOptions: [],
      // 物流状态
      logisticsStatusOptions: [],
      // 售后维权
      afterSalesOptions: [],
      // 组织
      orgOptions: [],
      orderSalesOptions: [],
      // 售后维权类型
      salesTypeOptions: [],
      // 退货退款原因
      reasonTypeOptions: [],
      // 配送员列表
      distributionList: [],
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
              picker.$emit('pick', [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [new Date(moment(start).startOf('day')), new Date(moment(start).endOf('day'))])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))])
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
        distribution: null,
        createTime: null,
        logisticsStatus: null,
        status: null,
        afterSalesStatus: 'all'
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
    this.getDicts('order_after_sales').then((response) => {
      this.afterSalesOptions = response.data
    })
    this.getDicts('order_after_sales_flag').then((response) => {
      this.orderSalesOptions = response.data
    })
    this.getDicts('after_sales_type').then((response) => {
      this.salesTypeOptions = response.data
    })
    this.getDicts('after_sales_reason_type').then((response) => {
      this.reasonTypeOptions = response.data
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
        customerId: this.$route.query.customerId,
        [this.queryParams.orderKey]: this.queryParams.orderValue
      }
      if (params.afterSalesStatus === 'all') delete params.afterSalesStatus
      if (this.queryParams.createTime && this.queryParams.createTime.length === 2) {
        params.afterSalesBeginTime = this.queryParams.createTime[0]
        params.afterSalesEndTime = this.queryParams.createTime[1]
      }
      delete params.orderKey
      delete params.orderValue
      delete params.createTime
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
    // 物流状态
    logisticsFormat(status) {
      return this.selectDictLabel(this.logisticsStatusOptions, status)
    },
    // 物流状态
    afterSalesFormat(status) {
      return this.selectDictLabel(this.afterSalesOptions, status)
    },
    // 维权类型
    salesTypeFormat(status) {
      return this.selectDictLabel(this.salesTypeOptions, status)
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
    // 跳转客户界面
    onJump(customerId) {
      this.$router.push({
        path: '/customer/customerInfo',
        query: {
          customerId
        }
      })
    },
    /** 打开model框 */
    handleModel(orderAfterSalesId) {
      getProtectionDetails(orderAfterSalesId).then(res => {
        this.form = {
          orderId: res.data.orderId,
          status: res.data.status,
          orderAfterSalesId: res.orderAfterSalesId,
          applyReason: res.data.applyReason,
          applyRemark: res.data.applyRemark,
          applyImage: res.data.applyImage,
          payAmount: res.data.payAmount,
          refundAmount: res.data.payAmount / 100,
          type: res.data.applyType,
          reasonType: res.data.reasonType,
          remark: res.data.remark
        }
        this.open = true
      })
    },
    // 提交
    submitForm(type) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${{ agree: '同意', refuse: '拒绝' }[type]}售后维权退款?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return updateSales({ orderId: this.form.orderId, remark: this.form.remark, type: this.form.type, operateType: type, reasonType: this.form.reasonType })
          }).then(() => {
            this.msgSuccess(`${{ agree: '同意', refuse: '拒绝' }[type]}售后维权退款成功~`)
            this.open = false
            this.form = {}
            this.getList()
          })
        }
      })
    },
    /** 拒绝审核 */
    handleRefuse(type) {
      this.$confirm(
        `是否确认${{ agree: '同意', refuse: '拒绝' }[type]}售后维权退款?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return updateSales({ orderId: this.form.orderId, remark: this.form.remark, type: this.form.type, operateType: type })
      }).then(() => {
        this.msgSuccess(`${{ agree: '同意', refuse: '拒绝' }[type]}售后维权退款成功~`)
        this.open = false
        this.form = {}
        this.getList()
      })
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
  .input_dis{
    .el-input__inner{
      background-color: #fff !important;
      color: #333 !important;
    }
  }

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
    width: 8.6%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 8.6%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
