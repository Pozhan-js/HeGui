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
      <el-form-item label="配送员" prop="distribution">
        <el-input
          v-model="queryParams.distribution"
          placeholder="请输入姓名或手机号码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择订单状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in orderStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
      <el-form-item label="售后状态" prop="afterSalesStatus">
        <el-select
          v-model="queryParams.afterSalesStatus"
          placeholder="请选择售后状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in orderAfterOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型" prop="orderType">
        <el-select
          v-model="queryParams.orderType"
          placeholder="请选择订单类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in orderTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
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
      <el-row>
        <el-form-item label="时间维度" prop="timeValue">
          <el-row style="width: 600px">
            <el-col :span="8">
              <el-select
                v-model="queryParams.timeKey"
                style="width: 100%"
                size="small"
              >
                <el-option
                  v-for="dict in timeKeyOptions"
                  :key="dict.key"
                  :label="dict.name"
                  :value="dict.key"
                />
              </el-select>
            </el-col>
            <el-col :span="16">
              <el-date-picker
                v-model="queryParams.timeValue"
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
            </el-col>
          </el-row>
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
            v-hasPermi="['order:orderInfo:exportOrder']"
            size="mini"
            @click="handleExport"
          >导出订单
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['order:orderInfo:exportGoods']"
            size="mini"
            @click="handleGoodsExport"
          >导出商品
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.allOrderStatus"
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in orderFlagOptions"
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
          v-for="(row, index) in orderInfoList"
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
                @click="handleclose(row)"
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
              <div class="outer-link--text">{{ row.orderCustomer.nickname }}</div>
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
            </div>
            <div class="totalPrice">
              {{ logisticsFormat(row.distributionStatus) }}
            </div>
            <div class="totalPrice">{{ orderTypeFormat(row.orderType) }}</div>
            <div class="totalPrice">
              {{ accessMethodFormat(row.accessMethod) }}
            </div>
            <div class="but">
              <el-button
                v-hasPermi="['order:orderInfo:query']"
                class="outer-link--text"
                size="mini"
                type="text"
                @click="handleDetails(row.orderId)"
              >订单详情</el-button>
              <el-button
                v-hasPermi="['order:orderInfo:remark']"
                size="mini"
                type="text"
                @click="handleModel(row, 'remark')"
              >备注</el-button>
              <el-button
                v-if="row.distributionStatus === 'complete_distribution'"
                v-hasPermi="['finance:distributionDetail:add']"
                size="mini"
                type="text"
                @click="handleModel(row, 'award')"
              >奖励</el-button>
              <el-button
                v-if="row.distributionStatus === 'complete_distribution'"
                v-hasPermi="['finance:distributionDetail:add']"
                size="mini"
                type="text"
                @click="handleModel(row, 'punish')"
              >处罚</el-button>
              <el-button
                v-if="refundStatus.includes(row.status) && row.wechatPayAmount > 0"
                v-hasPermi="['order:orderInfo:refund']"
                size="mini"
                type="text"
                @click="handleModel(row, 'retreat')"
              >现金退款</el-button>
              <el-button
                v-if="row.distributionStatus === 'begin_distribution'"
                v-hasPermi="['order:orderInfo:finish']"
                size="mini"
                type="text"
                @click="handFinish(row)"
              >完成</el-button>
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

    <!-- 添加或修改等级对话框 -->
    <el-dialog
      v-if="open"
      :title="
        { remark: '备注', award: '奖励', punish: '处罚', retreat: '退款' }[
          openType
        ]
      "
      :visible.sync="open"
      width="800px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
        <el-row v-if="openType === 'remark'">
          <el-form-item label="买家备注" prop="buyerNotes">
            <el-input
              v-model="form.buyerNotes"
              disabled
              type="textarea"
              placeholder="请输入买家备注"
              :autosize="{ minRows: 3, maxRows: 5 }"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="卖家备注" prop="sellerNotes">
            <el-input
              v-model="form.sellerNotes"
              type="textarea"
              placeholder="请输入卖家备注"
              :autosize="{ minRows: 3, maxRows: 5 }"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          <template v-if="form.distributionStatus == 'complete_distribution'">
            <el-form-item label="是否投诉">
              <el-switch v-model="form.isComplaint" :disabled="orderComplaint" />
            </el-form-item>
            <el-form-item v-if="form.isComplaint" label="投诉类型" prop="complaintType">
              <el-select
                v-model="form.complaintType"
                :disabled="orderComplaint"
                placeholder="请选择投诉类型"
                clearable
                size="small"
              >
                <el-option
                  v-for="dict in complaintTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-row>
        <el-row
          v-if="
            openType === 'award' ||
              openType === 'punish' ||
              openType === 'retreat'
          "
        >
          <el-form-item
            v-if="openType === 'award'"
            label="奖励金额"
            prop="accpetAmount"
          >
            <el-input-number
              v-model="form.accpetAmount"
              :min="0"
              placeholder="奖励金额"
            />
          </el-form-item>
          <el-form-item
            v-if="openType === 'punish'"
            label="处罚金额"
            prop="punishmentAmount"
          >
            <el-input-number
              v-model="form.punishmentAmount"
              :min="0"
              placeholder="处罚金额"
            />
          </el-form-item>
          <el-form-item
            v-if="openType === 'retreat'"
            label="退款金额"
            prop="applyRefundAmount"
          >
            <el-input-number
              v-model="form.applyRefundAmount"
              :min="0"
              :max="form.wechatPayAmount / 100"
              placeholder="退款金额"
            />
            <div style="color: red;">最多可退{{ form.wechatPayAmount && toDecimal2(form.wechatPayAmount / 100) }}元</div>
          </el-form-item>
          <el-form-item
            :label="
              { award: '奖励', punish: '处罚', retreat: '退款' }[openType] +
                '原因'
            "
            prop="remark"
          >
            <el-input
              v-model="form.remark"
              type="textarea"
              :placeholder="
                '请输入' +
                  { award: '奖励', punish: '处罚', retreat: '退款' }[openType] +
                  '原因'
              "
              :autosize="{ minRows: 3, maxRows: 5 }"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 添加或修改商品分组对话框 -->
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
import {
  listOrderInfo,
  setRemark,
  getDistribution,
  pushDistribution,
  rewardPunishment,
  finish,
  close,
  refund
} from '@/api/order/orderInfo'
import { Notification } from 'element-ui'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'
import Schedule from '@/components/schedule.vue'

export default {
  name: 'OrderInfo',
  components: {
    Cascader,
    Schedule,
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
      // 弹出层标题
      openType: null,
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 规则
      rules: {},
      // 主订单表格数据
      orderInfoList: [],
      // 订单状态
      orderStatusOptions: [],
      // 物流状态
      logisticsStatusOptions: [],
      // tabs选项
      orderFlagOptions: [],
      // 调度模态框
      dispatchOpen: false,
      // 订单经纬度
      dispatchLocation: null,
      // 调度列表
      distributionList: [],
      // 来源
      accessMethodOptions: [],
      // 售后状态
      orderAfterOptions: [],
      // 订单类型
      orderTypeOptions: [],
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
      // 时间搜索名称Key
      timeKeyOptions: [
        { key: 'orderTime', name: '下单时间' },
        { key: 'payTime', name: '支付时间' },
        { key: 'completeTime', name: '完成时间' }
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
        orderStatus: null,
        logisticsStatus: null,
        accessMethod: null,
        orderKey: 'orderNo',
        orderValue: null,
        timeKey: 'orderTime',
        timeValue: null,
        distribution: null,
        allOrderStatus: 'all',
        afterSalesStatus: null,
        orderByColumn: 'order_time',
        isAsc: 'desc'
      },
      // 搜索条件
      searchParams: null,
      refundStatus: ['payed', 'competition', 'not_distribution', 'begin_distribution', 'complete_distribution', 'not_comment', 'applyAfterSales'],
      // 投诉类型
      complaintTypeOptions: [],
      // 订单是否被投诉
      orderComplaint: false, 
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('OrderInfo')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('OrderInfo'))
      }
    }

    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('order_status').then((response) => {
      this.orderStatusOptions = response.data
    })
    this.getDicts('delivery_order_after_sales').then((response) => {
      this.orderAfterOptions = response.data
    })
    this.getDicts('delivery_order_logistics_status').then((response) => {
      this.logisticsStatusOptions = response.data
    })
    this.getDicts('order_all_flag').then((response) => {
      this.orderFlagOptions = response.data
    })
    this.getDicts('delivery_order_access_method').then((response) => {
      this.accessMethodOptions = response.data
    })
    this.getDicts('order_type').then((response) => {
      this.orderTypeOptions = response.data
    })
    this.getDicts('complaint_type').then((response) => {
      this.complaintTypeOptions = response.data
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
      listOrderInfo(this.paramsFormat()).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.orderInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 格式化查询参数 */
    paramsFormat() {
      const params = {
        ...this.queryParams,
        customerId: this.$route.query.customerId,
        [this.queryParams.orderKey]: this.queryParams.orderValue
      }
      if (params.allOrderStatus === 'all') delete params.allOrderStatus
      if (
        this.queryParams.timeValue &&
        this.queryParams.timeValue.length === 2
      ) {
        if (this.queryParams.timeKey === 'orderTime') {
          params.orderBeginTime = this.queryParams.timeValue[0]
          params.orderEndTime = this.queryParams.timeValue[1]
        } else if (this.queryParams.timeKey === 'completeTime') {
          params.completeBeginTime = this.queryParams.timeValue[0]
          params.completeEndTime = this.queryParams.timeValue[1]
        } else if (this.queryParams.timeKey === 'payTime') {
          params.payBeginTime = this.queryParams.timeValue[0]
          params.payEndTime = this.queryParams.timeValue[1]
        }
      }
      delete params.orderKey
      delete params.orderValue
      delete params.timeKey
      delete params.timeValue
      return params
    },
    // 订单状态
    statusFormat(status) {
      return this.selectDictLabel(this.orderStatusOptions, status)
    },
    // 物流状态
    logisticsFormat(status) {
      return this.selectDictLabel(this.logisticsStatusOptions, status)
    },
    // 访问方式
    accessMethodFormat(status) {
      return this.selectDictLabel(this.accessMethodOptions, status)
    },
    orderTypeFormat(type) {
      return this.selectDictLabel(this.orderTypeOptions, type)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        customerId: this.$route.query.customerId || null,
        orgId: null,
        orderStatus: null,
        logisticsStatus: null,
        accessMethod: null,
        orderKey: 'orderNo',
        orderValue: null,
        timeKey: 'orderTime',
        timeValue: null,
        distribution: null,
        allOrderStatus: 'all',
        afterSalesStatus: null,
        orderByColumn: 'order_time',
        isAsc: 'desc'
      }
      localStorage.removeItem('OrderInfo')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 跳转客户界面
    onJump(customerId) {
      const path = '/customer/customerInfo'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path: '/customer/customerInfo',
        query: {
          customerId
        }
      })
    },
    /** 订单详情 */
    handleDetails(orderId) {
      const path = '/order/delivery/allorder/details'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('OrderInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          orderId
        }
      })
    },
    /** 打开model框 */
    handleModel(row, type) {
      switch (type) {
        case 'remark':
          // 增加投诉字段
          const complaintParams = row.distributionStatus == 'complete_distribution' &&  row.orderComplaint 
                  ? { orderComplaintId: row.orderComplaint.orderComplaintId, 
                      complaintType: row.orderComplaint.complaintType,
                      isComplaint: row.orderComplaint.isComplaint,}
                  : null
          this.orderComplaint = !!row.orderComplaint
          this.form = {
            orderId: row.orderId,
            buyerNotes: row.buyerNotes,
            sellerNotes: row.sellerNotes,
            distributionStatus: row.distributionStatus,
            ...complaintParams
          }
          break
        case 'award':
        case 'punish':
        case 'retreat':
          this.form = {
            orderId: row.orderId,
            wechatPayAmount: row.wechatPayAmount
          }
          break
      }
      (this.rules = {
        remark: [
          {
            required: true,
            message: `${
              { award: '奖励', punish: '处罚', retreat: '退款' }[type]
            }原因不能为空`,
            trigger: 'blur'
          }
        ],
        accpetAmount: [
          { required: true, message: `奖励金额不能为空`, trigger: 'blur' }
        ],
        punishmentAmount: [
          { required: true, message: `处罚金额不能为空`, trigger: 'blur' }
        ],
        applyRefundAmount: [
          { required: true, message: `退款金额不能为空`, trigger: 'blur' }
        ],
        complaintType: [
          { required: true, message: `投诉类型不能为空`, trigger: 'change' },
          { validator: (rule, value, callback) => {
            if(this.form.isComplaint && !value) {
              return callback(new Error('请选择投诉类型'))
            } else {
              return callback()
            }
          },  trigger: 'change' }
        ]
      }),
      (this.openType = type)
      this.open = true
    },
    // 表单重置
    reset() {
      this.form = {
        orderId: null,
        buyerNotes: null,
        sellerNotes: null
      }
      this.resetForm('form')
    },
    /** 关闭modal框 */
    cancel() {
      this.reset()
      this.open = false
    },
    /** 表单提交 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${
              {
                remark: '备注',
                award: '奖励',
                punish: '处罚',
                retreat: '退款'
              }[this.openType]
            }当前订单？`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const params = {
                orderId: this.form.orderId
              }
              switch (this.openType) {
                case 'remark':
                  // (params.buyerNotes = this.form.buyerNotes),
                  // (params.sellerNotes = this.form.sellerNotes)
                  if(!this.form.sellerNotes) delete this.form.sellerNotes
                  delete this.form.distributionStatus
                  return setRemark(this.form)
                case 'award':
                case 'punish':
                  params.remark = this.form.remark
                  params.incomeType = { award: 3, punish: 4 }[this.openType]
                  if (this.openType === 'award') {
                    params.accpetAmount = this.form.accpetAmount * 100
                  } else if (this.openType === 'punish') {
                    params.punishmentAmount = this.form.punishmentAmount * 100
                  }
                  return rewardPunishment(params)
                case 'retreat':
                  params.applyRefundAmount = this.form.applyRefundAmount * 100
                  params.reason = this.form.remark
                  return refund(params)
              }
            })
            .then(() => {
              this.msgSuccess(
                `订单${
                  {
                    remark: '备注',
                    award: '奖励',
                    punish: '处罚',
                    retreat: '退款'
                  }[this.openType]
                }成功~`
              )
              this.cancel()
              this.getList()
            })
        }
      })
    },
    /** 完成订单 */
    handFinish(row) {
      this.$confirm(`是否确定完成当前订单？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        finish({ orderId: row.orderId }).then((res) => {
          this.msgSuccess(`订单已完成~`)
          this.getList()
        })
      })
    },
    /** 关闭订单 */
    handleclose(row) {
      this.$confirm(`是否确定关闭当前订单？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        close({ orderId: row.orderId }).then((res) => {
          this.msgSuccess(`订单已关闭~`)
          this.getList()
        })
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
      this.download('/ordercenter/order/export', this.paramsFormat())
    },
    /** 导出商品 */
    handleGoodsExport() {
      this.download('/ordercenter/order/export/goods', this.paramsFormat())
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
