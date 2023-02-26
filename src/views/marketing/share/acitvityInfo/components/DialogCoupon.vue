<template>
  <el-dialog title="选择可用优惠券" :visible.sync="dialogVisible" width="60%">
    <el-form
      ref="couponForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="优惠券名称" prop="couponName">
        <el-input
          v-model="queryParams.couponName"
          placeholder="请输入优惠券名称"
          clearable
          size="small"
          @change="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择优惠券状态"
          clearable
          size="small"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-table
      ref="couponTable"
      v-loading="loading"
      :row-key="(row) => row.couponId"
      :data="couponInfoList"
    >
      <el-table-column
        width="80"
        align="center"
      >
        <template slot-scope="{row}">
          <span :class="['el-radio__input', row.couponId == selectedCoupon.couponId ? 'is-checked' : '']"  @click="handleSelected(row)">
            <span class="el-radio__inner"></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="130"
        label="优惠券名称"
        align="center"
        prop="couponName"
      />
      <el-table-column
        min-width="90"
        label="门槛"
        align="center"
        prop="useThreshold"
      />
      <el-table-column
        min-width="90"
        label="优惠"
        align="center"
        prop="couponDiscountFlag"
      />
      <el-table-column
        min-width="80"
        label="优惠券状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        min-width="90"
        label="总张数"
        align="center"
        prop="totalNumberSheet"
      />
      <el-table-column
        min-width="90"
        label="可兑张数"
        align="center"
        prop="remainingNum"
      />
      <el-table-column
        min-width="90"
        label="总限领"
        align="center"
        prop="limitedNumberSheet"
      />
      <el-table-column
        min-width="90"
        label="每日限领"
        align="center"
        prop="dailyLimit"
      />
      <el-table-column
        min-width="90"
        label="已参与的活动"
        align="center"
      >
        <template slot-scope="{row}">
          <div v-for="(item, index) in row.activityList" :key="index">{{item.activityName}}</div>
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  couponIssue
} from '@/api/marketing/shareInfo'


export default {
  name: 'shareActivitycCouponDialog',
  props: {
    orgId: Array | Object | String | Number,
    selected: Object
  },
  data() {
    return {
      // 选择优惠券弹框
      dialogVisible: false,
      // 被选择的优惠券
      selectedCoupon: {},
      // 优惠券状态项
      statusOptions: [],
      // 优惠券活动类型
      typeOptions: [],
      // 优惠券总数
      total: 0,
      // 加载中
      loading: false,
      //优惠券
      couponInfoList: [],
      // 查询参数
      queryParams: {
        issueCouponFlag: 'activity_share',
        pageNum: 1,
        pageSize: 10
      },
    }
  },
  
  watch: {
    dialogVisible(val, oldval) {
      val && this.handleQuery()
    },
  },
  created() {
    this.getDicts('coupon_type').then((response) => {
      this.typeOptions = response.data
    })
    this.getDicts('coupon_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 查询优惠券
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 优惠券状态
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 优惠券类型字典翻译
    typeFormat(row) {
      return this.selectDictLabel(this.typeOptions, row.type)
    },

    getList() {
      this.loading = true
      this.selectedCoupon =this.selected ? this.selected : {}
      couponIssue({...this.queryParams, orgId: this.orgId}).then((response) => {
        this.couponInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 选择优惠券
    handleSelected(row) {
      if(this.selectedCoupon.couponId !== row.couponId ) this.selectedCoupon = this.selectedCoupon.couponId == row.couponId ? {} : row
    },

    // 关闭弹框
    handleClose() {
      this.dialogVisible = false
    },
    // 确认
    handleConfirm() {
      this.dialogVisible = false
      if(Object.keys(this.selectedCoupon).length) this.$emit('selected-coupon', this.selectedCoupon)
    }
  }
};
</script>

<style lang="scss" scoped>
.search-form {
  padding:  10px 20px 0;
}
</style>