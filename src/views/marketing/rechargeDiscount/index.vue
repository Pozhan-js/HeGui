<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['marketing:rechargeDiscount:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增充值优惠
          </el-button>
        </el-col>
      </el-row>
      <!-- <el-form
        class="search-form"
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
      >
        <el-form-item label="满多少元" prop="fullReductionAmount">
          <el-input
            v-model="queryParams.fullReductionAmount"
            placeholder="请输入满多少元"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="赠送多少元" prop="presentationAmount">
          <el-input
            v-model="queryParams.presentationAmount"
            placeholder="请输入赠送多少元"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="赠送方式" prop="presentationType">
          <el-select
            v-model="queryParams.presentationType"
            placeholder="请选择赠送方式"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in presentationTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-row
          :gutter="10"
          class="mb8"
          style="margin-left: 95px; margin-top: 5px"
        >
          <el-col :span="1.5">
            <el-button type="primary" size="mini" @click="handleQuery"
              >筛选</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button size="mini" @click="resetQuery">重置</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              size="mini"
              @click="handleExport"
              v-hasPermi="['marketing:rechargeDiscount:export']"
              >导出
            </el-button>
          </el-col>
        </el-row>
      </el-form> -->

      <el-table
        ref="multipleTable"
        v-loading="loading"
        style="margin-top: 20px"
        :data="rechargeDiscountList"
        :row-key="(row) => row.rechargeDiscountId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="rechargeDiscountId"/> -->
        <el-table-column
          label="列表项金额"
          align="center"
          prop="fullReductionAmount"
        >
          <template slot-scope="scope">
            {{
              scope.row.fullReductionAmount &&
                toDecimal2(scope.row.fullReductionAmount / 100)
            }}
          </template>
        </el-table-column>
        <el-table-column
          label="赠送类型"
          align="center"
          prop="presentationType"
          :formatter="presentationTypeFormat"
        />
        <el-table-column
          label="赠送数量"
          align="center"
          prop="presentationAmount"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.presentationType === 1">
              {{ scope.row.presentationAmount && toDecimal2(scope.row.presentationAmount / 100) }}
            </span>
            <span v-else-if="scope.row.presentationType === 2">
              {{ scope.row.presentationAmount }}
            </span>
            <span v-else-if="scope.row.presentationType === 3">
              {{ sum(scope.row.rechargeCouponList.map(item => item.giftNumber)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['marketing:rechargeDiscount:edit']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-hasPermi="['marketing:rechargeDiscount:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
          <el-checkbox
            v-model="checked"
            @change="toggleSelection"
          >当页全选</el-checkbox>
        </el-col>
        <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
          <el-button
            v-hasPermi="['marketing:rechargeDiscount:remove']"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
          >删除</el-button>
        </el-col>
        <el-col :span="11">
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
  </div>
</template>

<script>
import {
  delRechargeDiscount,
  listRechargeDiscount
} from '@/api/marketing/rechargeDiscount'

export default {
  name: 'RechargeDiscount',
  components: {},
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 3,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 充值优惠信息表格数据
      rechargeDiscountList: [],
      // 全选
      checked: false,
      // 赠送方式(1余额)字典
      presentationTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fullReductionAmount: null,
        presentationAmount: null,
        presentationType: null
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('recharge_presentation_type').then(response => {
      this.presentationTypeOptions = response.data
    })
  },
  methods: {
    /** 查询充值优惠信息列表 */
    getList() {
      this.loading = true
      listRechargeDiscount(this.queryParams).then((response) => {
        this.rechargeDiscountList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 赠送方式(1余额)字典翻译
    presentationTypeFormat(row, column) {
      return this.selectDictLabel(
        this.presentationTypeOptions,
        row.presentationType
      )
    },
    sum(arr) {
      return arr.reduce((prev, curr, idx, arr) => {
        return prev + curr
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.rechargeDiscountId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.rechargeDiscountList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/marketing/rechargeDiscount/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path
      })
    },
    // 修改
    handleUpdate(row) {
      const path = '/marketing/rechargeDiscount/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          type: 'update',
          rechargeDiscountId: row.rechargeDiscountId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const rechargeDiscountIds = row.rechargeDiscountId || this.ids
      this.$confirm(
        `是否确认${typeof rechargeDiscountIds === 'object' ? '批量删除' : '删除"满' + row.fullReductionAmount / 100 + '元"'}充值优惠信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return delRechargeDiscount(rechargeDiscountIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'marketing/rechargeDiscount/export',
        {
          ...this.queryParams
        },
        `marketing_rechargeDiscount.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.rechargeDiscountList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
