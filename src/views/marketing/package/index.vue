<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['marketing:package:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增打包优惠券
          </el-button>
        </el-col>
      </el-row>
      <el-form
        v-show="showSearch"
        ref="queryForm"
        class="search-form"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="优惠券包名称" prop="packageName">
          <el-input
            v-model="queryParams.packageName"
            placeholder="请输入优惠券包名称"
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
          />
        </el-form-item>
        <el-form-item label="失效状态" prop="invalidStatus">
          <el-select
            v-model="queryParams.invalidStatus"
            placeholder="请选择失效状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in invalidStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠券包状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择优惠券包状态"
            clearable
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['marketing:package:export']"
            >导出
          </el-button>
        </el-col> -->
        </el-row>
      </el-form>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        :max-height="maxHeight"
        style="margin-top: 20px"
        :data="packageList"
        :row-key="(row) => row.couponPckId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="80" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="couponPckId" /> -->
        <el-table-column min-width="100" label="优惠券包名称" align="center" prop="packageName" />
        <el-table-column
          min-width="80"
          label="状态"
          align="center"
          prop="status"
          :formatter="statusFormat"
        />
        <el-table-column min-width="100" label="组织" align="center" prop="orgName" />
        <el-table-column min-width="100" label="已领取" align="center" prop="received" />
        <el-table-column min-width="100" label="已使用" align="center" prop="used" />
        <el-table-column min-width="100" label="未领取" align="center" prop="unReceive" />
        <el-table-column min-width="100" label="未使用" align="center" prop="unUsed" />
        <el-table-column
          min-width="100"
          label="支付金额（元）"
          align="center"
          prop="paymentAmount"
        >
          <template slot-scope="scope">
            {{
              scope.row.paymentAmount &&
                toDecimal2(scope.row.paymentAmount / 100)
            }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          label="支付订单总数"
          align="center"
          prop="paymentOrderTotal"
        />
        <el-table-column
          min-width="100"
          label="平均订单金额"
          align="center"
          prop="averageOrderAmount"
        >
          <template slot-scope="scope">
            {{
              scope.row.averageOrderAmount &&
                toDecimal2(scope.row.averageOrderAmount / 100)
            }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="失效条件"
          align="center"
          prop="failureCondition"
          :formatter="failureConditionFormat"
        /> -->
        <el-table-column
          min-width="80"
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.invalidStatus === 1"
              v-hasPermi="['marketing:package:invalid']"
              size="mini"
              type="text"
              @click="handleStates(scope.row, 0)"
            >
              失效
            </el-button>
            <el-button
              v-if="scope.row.status !== 2"
              v-hasPermi="['marketing:package:edit']"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-hasPermi="['marketing:package:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
            <el-button
              v-if="scope.row.status == 1"
              v-hasPermi="['marketing:package:promote']"
              size="mini"
              type="text"
              @click="handlePromote(scope.row)"
            >
              推广
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
            v-hasPermi="['tool:gen:remove']"
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
      <Promote ref="promote" />
    </div>
  </div>
</template>

<script>
import {
  delPackage,
  listPackage,
  getPackageUrl,
  packageInvalid
} from '@/api/marketing/package'
import { getOrgTree } from '@/api/utils'

import { Cascader } from 'ant-design-vue'
import Promote from '@/views/components/promote'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Package',
  components: {
    Promote,
    Cascader
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 4,
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
      // 打包优惠券表格数据
      packageList: [],
      // 全选
      checked: false,
      // 组织
      orgOptions: [],
      // 失效条件字典
      failureConditionOptions: [],
      // 失效状态(0失效1正常)字典
      invalidStatusOptions: [],
      // 优惠券打包状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        packageName: null,
        orgId: null,
        invalidStatus: null,
        status: null
      },
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('Package')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('Package'))
      }
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('coupon_pck_failure_condition').then((response) => {
      this.failureConditionOptions = response.data
    })
    this.getDicts('coupon_pck_invalid_status').then((response) => {
      this.invalidStatusOptions = response.data
    })
    this.getDicts('coupon_pck_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询打包优惠券列表 */
    getList() {
      this.loading = true
      listPackage(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.packageList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 失效条件字典翻译
    failureConditionFormat(row, column) {
      return this.selectDictLabel(
        this.failureConditionOptions,
        row.failureCondition
      )
    },
    // 失效状态(0失效1正常)字典翻译
    invalidStatusFormat(row, column) {
      return this.selectDictLabel(this.invalidStatusOptions, row.invalidStatus)
    },
    // 优惠券打包状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
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
        packageName: null,
        orgId: null,
        invalidStatus: null,
        status: null
      }
      localStorage.removeItem('Package')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.couponPckId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.packageList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      if (this.searchParams) {
        localStorage.setItem('Package', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path: '/marketing/coupons/package/add'
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (this.searchParams) {
        localStorage.setItem('Package', JSON.stringify(this.searchParams))
      }
      const couponPckId = row.couponPckId || this.ids
      this.$router.push({
        path: '/marketing/coupons/package/update',
        query: {
          couponPckId,
          type: 'update'
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const couponPckIds = row.couponPckId || this.ids
      this.$confirm(
        `是否确认${typeof couponPckIds === 'object' ? '批量删除' : '删除"' + row.packageName + '"'}打包优惠券?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delPackage(couponPckIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    // 失效，有效
    handleStates(rows, invalidStatus) {
      this.$confirm(
        `是否确认${
          { 0: '失效', 1: '有效' }[invalidStatus]
        }${rows.packageName}打包优惠券?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return packageInvalid({ couponPckIds: [rows.couponPckId], invalidStatus })
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 0: '失效', 1: '有效' }[invalidStatus]}成功`)
        })
    },
    // 推广链接
    handlePromote(row) {
      getPackageUrl(row.couponPckId).then((res) => {
        this.$refs['promote'].link = res.data
        this.$refs['promote'].open = true
        this.$refs['promote'].type = 'base64'
        this.$refs['promote'].generate()
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'marketing/package/export',
        {
          ...this.queryParams
        },
        `marketing_package.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.packageList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
