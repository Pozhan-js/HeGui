<template>
  <div>
    <el-form
      ref="couponForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="打包优惠券名称" prop="packageName">
        <el-input
          v-model="queryParams.packageName"
          placeholder="请输入优惠券名称"
          clearable
          size="small"
          @change="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="优惠券状态" prop="status">
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
      </el-form-item> -->
    </el-form>
    <el-table
      ref="couponTable"
      v-loading="loading"
      :row-key="(row) => row.couponPckId"
      :data="list"
    >
      <el-table-column width="80" align="center">
        <template slot-scope="{row}">
          <span :class="['el-radio__input', row.couponPckId == couponPckId ? 'is-checked' : '']"  @click="handleSelected(row)">
            <span class="el-radio__inner"></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券包名称" align="center" prop="packageName" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column  label="创建时间" align="center" prop="createTime" >
        <template slot-scope="{row}">
          <break-time :date-time="row.createTime" />
        </template>
      </el-table-column>
      <el-table-column label="已领取" align="center" prop="received" />
      <el-table-column label="已使用" align="center" prop="used" />
      <el-table-column label="未使用" align="center" prop="unUsed" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :page-sizes="[6,12,18,24]"
      @pagination="getList"
    />
    <div class="el-dialog__footer" style="padding-bottom: 0">
      <div style="margin-top: 20px"> 
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="$emit('selected-coupon', selectedCouponPck)">确 定</el-button>
      </div>
    </div>
  </div>
</template>
<script>

import {
  listPackage,
} from '@/api/marketing/activityInfo'

export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    orgId: Array | Object | String | Number,
    // selected: Object
    selectedId: String | null
  },
  data() {
    return {
      // 被选择的优惠券
      couponPckId: null,
      selectedCouponPck: null,
      // 优惠券状态项
      statusOptions: [],
      // 优惠券总数
      total: 0,
      // 加载中
      loading: false,
      //优惠券
      list: [],
      // 查询参数
      queryParams: { 
        pageNum: 1,
        pageSize: 6,
        invalidStatus: 1,
        status: 1,
        activityType: 'promote'
      },
    }
  },
  
  watch: {
    isOpen(val) {
      if(val) this.handleQuery()
    }
  },
  created() {
    this.getDicts('coupon_pck_status').then((response) => {
      this.statusOptions = response.data
    })
    this.handleQuery()
  },
  methods: {
    // 查询优惠券
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.orgId = this.orgId ? this.orgId : undefined
      this.getList()
    },
    // 优惠券状态
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    getList() {
      this.loading = true
      this.couponPckId = this.selectedId
      if(!this.couponPckId) this.selectedCouponPck = null
      listPackage(this.queryParams).then((response) => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 选择优惠券
    handleSelected(row) {
      if(this.couponPckId !== row.couponPckId ) {
        this.selectedCouponPck = row
        this.couponPckId = this.couponPckId == row.couponPckId ? {} : row.couponPckId
      }
    },
    // 取消选择
    handleCancel() {
      this.selectedCouponPck = null
      this.$emit('cancel')
    }
  }
};
</script>

<style lang="scss" scoped>
.search-form {
  padding:  10px 20px 0;
}
</style>