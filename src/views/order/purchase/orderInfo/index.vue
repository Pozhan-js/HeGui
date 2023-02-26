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
      <el-row>
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
        <el-form-item label="订单编号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单编号"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="物流状态" prop="logisticsStatus">
          <el-select
            v-model="queryParams.logisticsStatus"
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
      </el-row>
      <el-row>
        <el-form-item label="送货员" prop="salesman">
          <el-input
            v-model="queryParams.salesman"
            placeholder="请输入姓名或手机号码"
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
      </el-row>
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
        <el-form-item label="确认入库时间" prop="receiveTime">
          <el-date-picker
            v-model="queryParams.receiveTime"
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
            v-hasPermi="['order:purchaseOrder:export']"
            size="mini"
            @click="handleExport"
          >导出订单
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.orderStatus"
      class="tabContainer"
      type="card"
      style="margin-top: 20px"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in allFlagStatusOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <div v-loading="loading">
      <div class="order_title">
        <div style="width: 22%; display: flex">
          <div style="width: calc(45% + 40px)">商品</div>
          <div style="width: 40%">价格/数量</div>
        </div>
        <div style="width: 19.5%">总金额（元）</div>
        <div style="width: 19.5%">订单状态</div>
        <div style="width: 19.5%">送货员</div>
        <div style="width: 19.5%">配送员</div>
        <div style="width: 19.5%">操作</div>
      </div>
      <div>
        <div
          v-for="(row, index) in orderInfoList"
          :key="index"
          class="table_div"
        >
          <div class="order">
            <div style="width: 300px">
              订单号：{{ row.purchaseOrder.orderNo }}
            </div>
            <div style="width: 250px">
              下单时间：{{ row.purchaseOrder.createTime }}
            </div>
            <div style="width: 250px">
              确认入库时间：{{ row.purchaseOrder.receiveTime }}
            </div>
          </div>
          <div class="table">
            <div class="goods">
              <div
                v-for="goods in row.purchaseOrderGoodsList"
                :key="goods.goodsId"
                style="padding: 5px; display: flex"
              >
                <img class="img" :src="prefix + goods.thumbnail">
                <div class="goodsName">{{ goods.goodsName }}</div>
                <div class="price">
                  {{ goods.price && toDecimal2(goods.price / 100) }}元/{{
                    goods.num
                  }}包
                </div>
              </div>
            </div>
            <div class="totalPrice">
              {{
                row.purchaseOrder.amount &&
                  toDecimal2(row.purchaseOrder.amount / 100)
              }}
            </div>
            <div class="totalPrice">
              <div>{{ statusFormat(row.purchaseOrder.orderStatus) }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ row.purchaseOrder.deliveryName }}</div>
              <div>{{ row.purchaseOrder.deliveryPhone }}</div>
            </div>
            <div class="totalPrice">
              <div>{{ row.purchaseOrder.distributionName }}</div>
              <div>{{ row.purchaseOrder.distributionPhone }}</div>
              <div>{{ row.purchaseOrder.fullAddress }}</div>
            </div>
            <div class="but">
              <el-button
                v-hasPermi="['order:purchaseOrder:query']"
                class="outer-link--text"
                size="mini"
                type="text"
                @click="handleDetails(row.purchaseOrder.purchaseOrderId)"
              >订单详情</el-button>
              <el-button
                v-hasPermi="['order:purchaseOrder:remark']"
                size="mini"
                type="text"
                @click="handleModel(row.purchaseOrder)"
              >备注</el-button>
              <el-button
                v-hasPermi="['distribution:sell:nowstock']"
                class="outer-link--text"
                size="mini"
                type="text"
                @click="stockInterface(row.purchaseOrder.distributionId)"
              >库存</el-button>
            </div>
          </div>
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
    <el-dialog title="备注" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
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
  </div>
</template>

<script>
import { listOrderInfo, setRemark } from '@/api/order/purchase'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'Purchase',
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
      // model 框
      open: false,
      // 总条数
      total: 0,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 主订单表格数据
      orderInfoList: [],
      // 订单Tab状态
      allFlagStatusOptions: [],
      // 订单状态
      orderStatusOptions: [],
      // 物流状态
      logisticsStatusOptions: [],
      // 组织
      orgOptions: [],
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
        orderNo: null,
        salesman: null,
        distribution: null,
        logisticsStatus: null,
        orderTime: null,
        receiveTime: null,
        orderStatus: 'all',
        orderByColumn: 'order_time',
        isAsc: 'desc'
      },
      form: {},
      rules: {},
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Purchase')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Purchase'))
      }
    }
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('purchase_all_flag').then((response) => {
      this.allFlagStatusOptions = response.data
    })
    this.getDicts('purchase_status').then((response) => {
      this.orderStatusOptions = response.data
    })
    this.getDicts('purchase_order_logistics_status').then((response) => {
      this.logisticsStatusOptions = response.data
    })

    this.getList()
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 格式化查询参数 */
    paramsFormat() {
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.orderTime && this.queryParams.orderTime.length === 2) {
        params.orderBeginTime = this.queryParams.orderTime[0]
        params.orderEndTime = this.queryParams.orderTime[1]
      }
      if (this.queryParams.receiveTime && this.queryParams.receiveTime.length === 2) {
        params.receiveBeginTime = this.queryParams.receiveTime[0]
        params.receiveEndTime = this.queryParams.receiveTime[1]
      }
      delete params.orderTime
      delete params.receiveTime
      return params
    },
    /** 查询主订单列表 */
    getList() {
      this.loading = true
      listOrderInfo(this.paramsFormat()).then((response) => {
        this.searchParams = {
          ...this.paramsFormat()
        }
        this.orderInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 订单状态
    statusFormat(status) {
      return this.selectDictLabel(this.orderStatusOptions, status)
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
        orgId: null,
        orderNo: null,
        salesman: null,
        distribution: null,
        orderTime: null,
        orderStatus: 'all',
        orderByColumn: 'order_time',
        isAsc: 'desc'
      }
      localStorage.removeItem('Purchase')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 订单详情 */
    handleDetails(purchaseOrderId) {
      const path = '/order/purchase/allorder/details'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Purchase', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          purchaseOrderId
        }
      })
    },
    /** 打开model框 */
    handleModel(row) {
      this.form = {
        orderId: row.purchaseOrderId,
        buyerNotes: row.buyerNotes,
        sellerNotes: row.sellerNotes
      }
      this.open = true
    },
    // model确认
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm('是否确定设置订单备注？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const params = {
              orderId: this.form.orderId,
              buyerNotes: this.form.buyerNotes,
              sellerNotes: this.form.sellerNotes
            }
            setRemark(params).then((res) => {
              this.msgSuccess('订单备注设置成功~')
              this.cancel()
              this.getList()
            })
          })
        }
      })
    },
    /** 关闭modal框 */
    cancel() {
      this.open = false
    },
    // 跳转库存界面
    stockInterface(distributionId) {
      this.$router.push({
        path: '/order/Invoicing/sell',
        query: {
          distributionId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/ordercenter/purchase/order/export', this.paramsFormat())
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
    width: 19.5%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 19.5%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>
