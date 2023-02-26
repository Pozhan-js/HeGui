<template>
  <el-dialog
    ref="dialog"
    :visible.sync="open"
    width="1000px"
    append-to-body
  >
    <el-form ref="queryForm" :model="queryParams" inline>
      <el-form-item label="活动名称" prop="couponName">
        <el-input v-model="queryParams.couponName" placeholder="请输入活动名称" @keyup.enter.native="getList" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <dict-select v-model="queryParams.status" :out-dicts.sync="statusOptions" dict="coupon_pck_status" />
      </el-form-item>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery">筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      class="mt20"
      row-key="couponId"
      max-height="600"
      :data="list"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" reserve-selection width="80" align="center" />
      <el-table-column label="活动名称" align="center" prop="couponName" />
      <el-table-column label="类型" align="center" prop="type" :formatter="typeFormat" />
      <el-table-column min-width="90" label="门槛" align="center" prop="useThreshold" :formatter="thresholdFormat" />
      <el-table-column min-width="90" label="优惠" align="center" prop="couponDiscountFlag" />
      <el-table-column label="已领取" align="center" prop="receivedNum" />
      <el-table-column label="已使用" align="center" prop="usedNum" />
      <el-table-column label="开始时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.effectivePeriodType === 'time_limit'">
            {{ scope.row.effectiveBeginTime }}
          </span>
          <span v-else-if="scope.row.effectivePeriodType === 'received_effective'">
            领取后立即生效
          </span>
          <span v-else-if="scope.row.effectivePeriodType === 'received_specify_effective'">
            领取后{{ scope.row.effectiveReceivedDay }}天生效
          </span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.effectivePeriodType === 'time_limit'">
            {{ scope.row.effectiveEndTime }}
          </span>
          <span v-else>
            有效期领取后{{ scope.row.effectiveValidityDay }}天
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      :page-sizes="[5, 10, 20, 50]"
      @pagination="getList"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="confirmDiglog">确 定</el-button>
      <el-button size="mini" @click="cancelDiglog">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listCouponInfo } from '@/api/data/market'
import DictSelect from '@/components/DictSelect.vue'

export default {
  components: {
    DictSelect
  },
  props: {
    orgId: Array,
    selectedList: Array
  },
  data: () => ({
    queryParams: {
      pageNum: 1,
      pageSize: 5,
      couponName: null,
      status: null
    },
    total: 0,
    list: [],
    loading: [],
    open: false,
    statusOptions: [],
    ids: [],
    couponTypeOptions: []
  }),
  methods: {
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
        ...this.extraParams,
        orgId: this.orgId
      }
      listCouponInfo(params).then((response) => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    thresholdFormat(row, column) {
      if (row.useThreshold === 'full_yuan') {
        return `满${this.toDecimal2(row.orderFull / 100)}元`
      } else {
        return '无门槛'
      }
    },
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    typeFormat(row, column) {
      return this.selectDictLabel(this.couponTypeOptions, row.type)
    },
    showDialog(obj) {
      this.open = true
      this.extraParams = obj
      this.getList()
      if (!this.couponTypeOptions.length) {
        this.getDicts('coupon_type').then((response) => {
          this.couponTypeOptions = response.data
        })
      }
      // 取消选中后未点确认按钮，重新打开时恢复选中状态
      if (!this.ids.length && this.selectedList.length) {
        this.selectedList.forEach(item => {
          this.$refs?.multipleTable?.toggleRowSelection(item, true)
        })
      }
    },
    confirmDiglog() {
      if (this.ids.length > 5) {
        return this.warning('最多选择5个活动')
      }
      this.$emit('confirm-select', this.ids)
      this.open = false
    },
    cancelDiglog() {
      this.open = false
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.$refs.multipleTable.clearSelection()
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleSelectionChange(selection) {
      this.ids = selection
    }
  }
}
</script>
