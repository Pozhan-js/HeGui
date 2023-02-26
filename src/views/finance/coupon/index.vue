<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="优惠券名称" prop="couponName">
        <el-input
          v-model="queryParams.couponName"
          placeholder="请输入优惠券名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券ID" prop="couponId">
        <el-input
          v-model="queryParams.couponId"
          placeholder="请输入优惠券ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="消费者信息" prop="customer">
        <el-input
          v-model="queryParams.customer"
          placeholder="请输入编号或者昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择类型"
          size="small"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择操作状态"
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="领取时间" prop="collectionTime">
          <el-date-picker
            v-model="queryParams.collectionTime"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['marketing:couponReceive:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.receiveStatusFlag"
      class="tabContainer"
      style="margin-top: 20px"
      type="card"
      @tab-click="tabCheck"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in tabStatusOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <el-table v-loading="loading" style="margin-top: 20px" :data="couponList">
      <el-table-column label="消费者编号" align="center" prop="customerId" />
      <el-table-column label="昵称" align="center" prop="nickname">
        <template slot-scope="scope">
          <jump
            path="/customer/customerInfo"
            :query="{ customerId: scope.row.customerId }"
          >
            <img
              :src="
                scope.row.customerAvatar
                  ? scope.row.customerAvatar
                  : '/avatar.png'
              "
              style="width: 40px; height: 40px; border-radius: 100px"
            >
            <div>{{ scope.row.customerNickname }}</div>
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="领取时间" align="center" prop="collectionTime" />
      <el-table-column label="使用时间" align="center" prop="useTime" />
      <el-table-column label="过期时间" align="center" prop="expiredTime" />
      <el-table-column label="操作账号" align="center" prop="updateBy">
        <template slot-scope="scope">
          <div>{{ scope.row.operator }}</div>
          <div>{{ scope.row.operatorAccount }}</div>
        </template>
      </el-table-column>
      <el-table-column label="券名称" align="center" prop="couponName">
        <template slot-scope="scope">
          <el-button type="text" @click="handleCheck(scope.row)">
            {{ scope.row.couponName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="券类型"
        align="center"
        prop="couponType"
        :formatter="typeFormat"
      />
      <el-table-column label="券ID" align="center" prop="couponId" />
      <el-table-column label="券编号" align="center" prop="receiveCode" />
      <el-table-column
        label="操作状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        label="优惠券状态"
        align="center"
        prop="couponStatus"
        :formatter="couponStatusFormat"
      />
      <el-table-column
        label="门槛"
        align="center"
        prop="useThreshold"
        :formatter="thresholdFormat"
      />
      <el-table-column
        label="优惠（元）"
        align="center"
        prop="couponDiscountFlag"
      >
        <!-- <template slot-scope="scope">
          <span v-if="scope.row.couponType === 'full_reduction'">{{ toDecimal2(scope.row.discountedPrice) }}</span>
          <span v-if="scope.row.couponType === 'discount'"></span>
          <span v-if="scope.row.couponType === 'random'"></span>
        </template> -->
      </el-table-column>
      <el-table-column
        label="获取方式"
        align="center"
        prop="receiveFlag"
        :formatter="getCouponTypeFormat"
      />
      <el-table-column
        label="来源"
        align="center"
        prop="origin"
        :formatter="couponOriginFormat"
      />
    </el-table>

    <el-row>
      <el-col :span="24">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getList } from '@/api/finance/coupon'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'

export default {
  name: 'Coupon',
  components: {},
  data() {
    return {
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      couponList: [],
      // 类型(0日类型,1月类型)字典
      typeOptions: [],
      // 操作状态
      statusOptions: [],
      tabStatusOptions: [],
      // 获取方式
      getCouponTypeOptions: [],
      // 来源
      couponOriginOptions: [],
      // 门槛
      thresholdOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        receiveStatusFlag: 'all',
        orderByColumn: 'collection_time',
        isAsc: 'desc'
      },
      searchParams: {}
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('CouponDetails')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('CouponDetails'))
      }
    }

    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
    })
    this.getDicts('coupon_type').then((response) => {
      this.typeOptions = response.data
    })
    this.getDicts('coupon_use_detail_operate_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('coupon_use_detail_tab_flag').then((response) => {
      this.tabStatusOptions = response.data
    })
    this.getDicts('get_coupon_type').then((response) => {
      this.getCouponTypeOptions = response.data
    })
    this.getDicts('coupon_origin').then((response) => {
      this.couponOriginOptions = response.data
    })
    this.getDicts('coupon_use_threshold').then((response) => {
      this.thresholdOptions = response.data
    })
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询配送员考勤奖励明细列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (params.receiveStatusFlag === 'all') {
        delete params.receiveStatusFlag
      }
      if (
        this.queryParams.collectionTime &&
        this.queryParams.collectionTime.length === 2
      ) {
        params.receiveBeginTime = moment(this.queryParams.collectionTime[0])
          .startOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
        params.receiveEndTime = moment(this.queryParams.collectionTime[1])
          .endOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      delete params.collectionTime

      getList(params).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.couponList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        receiveStatusFlag: 'all',
        orderByColumn: 'collection_time',
        isAsc: 'desc'
      }
      localStorage.removeItem('CouponDetails')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 类型(0日类型,1月类型)字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.type)
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    getCouponTypeFormat(row, column) {
      return this.selectDictLabel(this.getCouponTypeOptions, row.receiveFlag)
    },
    couponOriginFormat(row, column) {
      return this.selectDictLabel(this.couponOriginOptions, row.origin)
    },
    thresholdFormat(row, column) {
      if (row.useThreshold === 'full_yuan') {
        return `满${this.toDecimal2(row.orderFull / 100)}元`
      } else {
        return '无门槛'
      }
    },
    couponStatusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.couponStatus)
    },
    handleCheck(row) {
      const path = '/marketing/coupons/marketing/check'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) { return this.warning('没有界面权限不支持跳转~') }
      if (this.searchParams) {
        localStorage.setItem(
          'CouponDetails',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          couponId: row.couponId,
          type: 'check'
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const params = {
        ...this.queryParams
      }
      if (params.receiveStatusFlag === 'all') {
        delete params.receiveStatusFlag
      }
      if (
        this.queryParams.collectionTime &&
        this.queryParams.collectionTime.length === 2
      ) {
        params.receiveBeginTime = moment(this.queryParams.collectionTime[0])
          .startOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
        params.receiveEndTime = moment(this.queryParams.collectionTime[1])
          .endOf('days')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      delete params.collectionTime
      this.download('/marketing/couponReceive/export', params)
    }
  }
}
</script>
