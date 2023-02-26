<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="20" class="mb8">
        <el-col :span="3">
          <div style="border: 1px solid;text-align: center;padding: 10px 20px;line-height: 30px;">
            <div style="font-size: 18px;font-weight: 600;">满减券</div>
            <div>例：满100元减20元便于合理控制活动成本</div>
            <el-button
              v-hasPermi="['marketing:couponInfo:add']"
              type="primary"
              size="mini"
              @click="handleAdd('full_reduction')"
            >立即新增
            </el-button>
          </div>
        </el-col>
        <el-col :span="3">
          <div style="border: 1px solid;text-align: center;padding: 10px 20px;line-height: 30px;">
            <div style="font-size: 18px;font-weight: 600;">折扣券</div>
            <div>例：满100元打9折提高店铺销量和客单价</div>
            <el-button
              v-hasPermi="['marketing:couponInfo:add']"
              type="primary"
              size="mini"
              @click="handleAdd('discount')"
            >立即新增
            </el-button>
          </div>
        </el-col>
        <el-col :span="3">
          <div style="border: 1px solid;text-align: center;padding: 10px 20px;line-height: 30px;">
            <div style="font-size: 18px;font-weight: 600;">随机券</div>
            <div>获得金额随机的优惠券增加活动趣味性</div>
            <el-button
              v-hasPermi="['marketing:couponInfo:add']"
              type="primary"
              size="mini"
              @click="handleAdd('random')"
            >立即新增
            </el-button>
          </div>
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
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input
            v-model="queryParams.couponName"
            placeholder="请输入优惠券名称"
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
        <el-form-item label="活动专享" prop="activityTypeFlag">
          <el-select
            v-model="queryParams.activityTypeFlag"
            placeholder="请选择活动专享"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in activityTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠券类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择优惠券类型"
            clearable
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
        <el-form-item label="优惠券状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择优惠券状态"
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
        <el-form-item label="所属券包" prop="couponPckId">
          <el-select
            v-model="queryParams.couponPckId"
            placeholder="请选择所属券包"
            clearable
            size="small"
          >
            <el-option
              v-for="item in couponPckOptions"
              :key="item.couponPckId"
              :label="item.packageName"
              :value="item.couponPckId"
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
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['marketing:couponInfo:export']"
              size="mini"
              @click="handleExport"
            >导出
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        :max-height="maxHeight"
        style="margin-top: 20px"
        :row-key="(row) => row.couponId"
        :data="couponInfoList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="76" align="center" />
        <el-table-column min-width="80" label="展示顺序" align="center" prop="sort">
          <template slot-scope="scope">
            {{ scope.row.sort }}
            <el-button
              v-hasPermi="['marketing:couponInfo:editSort']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              style="font-size: 18px"
              @click="openModel(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="130" label="活动名称" align="center" prop="couponName">
          <template slot-scope="scope">
            <el-button type="text" class="outer-link--text" @click="handleCheck(scope.row)">
              {{ scope.row.couponName }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column min-width="80" label="所属券包" align="center" prop="packageName" />
        <el-table-column
          min-width="90"
          label="类型"
          align="center"
          prop="type"
          :formatter="typeFormat"
        />
        <el-table-column min-width="90" label="门槛" align="center" prop="useThreshold" :formatter="thresholdFormat" />
        <el-table-column min-width="90" label="优惠" align="center" prop="couponDiscountFlag" />
        <el-table-column min-width="90" label="组织" align="center" prop="orgName" />
        <el-table-column
          min-width="90"
          label="总张数"
          align="center"
          prop="totalNumberSheet"
        />
        <el-table-column min-width="90" label="已领取" align="center" prop="receivedNum">
          <template slot-scope="scope">
            <el-button v-if="scope.row.receivedNum > 0" class="outer-link--text" type="text" @click="onJump(scope.row.couponId, 'customer')">{{ scope.row.receivedNum }}</el-button>
            <div v-else>{{ scope.row.receivedNum }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="90" label="已使用" align="center" prop="usedNum">
          <template slot-scope="scope">
            <el-button v-if="scope.row.usedNum > 0" class="outer-link--text" type="text" @click="onJump(scope.row.couponId, 'order')">{{ scope.row.usedNum }}</el-button>
            <div v-else>{{ scope.row.usedNum }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="90" label="剩余数" align="center" prop="remainingNum" />
        <el-table-column
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
          min-width="90"
          label="实付金额（元）"
          align="center"
          prop="actualPayAmount"
          :formatter="(_,row) => toDecimal2(_.actualPayAmount / 100)"
        />
        <!-- <el-table-column
          label="支付订单总数"
          align="center"
          prop="paymentOrderTotal"
        />
        <el-table-column
          min-width="90"
          label="平均订单金额(元)"
          align="center"
          prop="averageOrderAmount"
        >
          <template slot-scope="scope">
            {{
              scope.row.averageOrderAmount &&
              toDecimal2(scope.row.averageOrderAmount / 100)
            }}
          </template>
        </el-table-column> -->
        <el-table-column
          min-width="80"
          label="优惠券状态"
          align="center"
          prop="status"
          :formatter="statusFormat"
        />
        <el-table-column
          min-width="80"
          label="启用状态"
          align="center"
          prop="isEnable"
          :formatter="isEnableFormat"
        />
        <el-table-column min-width="100" label="创建时间" align="center">
          <template slot-scope="{row}">
            <break-time :date-time="row.createTime" />
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          label="操作"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.invalidStatus === 1"
              v-hasPermi="['marketing:couponInfo:invalid']"
              size="mini"
              type="text"
              @click="handleStates(scope.row, 0)"
            >
              失效
            </el-button>
            <el-button
              v-if="scope.row.invalidStatus === 1"
              v-hasPermi="['marketing:couponInfo:updateIsEnable']"
              size="mini"
              type="text"
              @click="handleEna(scope.row, scope.row.isEnable === 0 ? 1 : 0)"
            >
              {{ scope.row.isEnable === 0 ? "启用" : "禁用" }}
            </el-button>
            <el-button
              v-if="scope.row.invalidStatus === 1"
              v-hasPermi="['marketing:couponInfo:edit']"
              size="mini"
              type="text"
              class="outer-link--text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-if="scope.row.invalidStatus === 0"
              v-hasPermi="['marketing:couponInfo:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
            <el-button
              v-if="scope.row.invalidStatus === 1"
              v-hasPermi="['marketing:couponInfo:promote']"
              size="mini"
              type="text"
              @click="handlePromote(scope.row)"
            >
              推广
            </el-button>
            <el-button
              v-if="scope.row.couponStatus !== 2"
              v-hasPermi="['marketing:couponInfo:copy']"
              size="mini"
              type="text"
              class="outer-link--text"
              @click="handleCopy(scope.row)"
            >
              复制
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
            v-hasPermi="['marketing:couponInfo:remove']"
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
      <el-dialog
        title="修改排序"
        :visible.sync="open"
        width="400px"
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="排序" prop="sort">
            <el-input-number
              v-model="form.sort"
              :min="0"
              placeholder="请输入排序"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button
            type="primary"
            :loading="this.$store.state.isLoading"
            @click="handleSort"
          >确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  delCouponInfo,
  listCouponInfo,
  invalid,
  getPromote,
  disabled,
  enabled,
  checkSort,
  editSort,
  copyCoupon
} from '@/api/marketing/couponInfo'

import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'
import { Cascader } from 'ant-design-vue'
import Promote from '@/views/components/promote'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'


export default {
  name: 'CouponInfo',
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
      // 打开model
      open: false,
      // 总条数
      total: 0,
      // 优惠券信息表格数据
      couponInfoList: [],
      // 全选
      checked: false,
      // 组织
      orgOptions: [],
      // 优惠券状态字典
      statusOptions: [],
      // 优惠券类型字典
      typeOptions: [],
      // 失效状态(0失效1正常)字典
      invalidStatusOptions: [],
      // 打包优惠券
      couponPckOptions: [],
      // 启用，禁用状态
      isEnableOptions: [],
      // 专属渠道
      activityTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        couponName: null,
        orgId: null,
        type: null,
        status: null,
        couponPckId: null
      },
      form: {},
      rules: {
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
          // { validator: this.verificationSort, trigger: "change" },
        ]
      },
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('CouponInfo')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('CouponInfo'))
      }
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    getDropDown('package').then((res) => {
      this.couponPckOptions = res.data
    })
    this.getDicts('coupon_status').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('coupon_type').then((response) => {
      this.typeOptions = response.data
    })
    this.getDicts('coupon_invalid_status').then((response) => {
      this.invalidStatusOptions = response.data
    })
    this.getDicts('coupon_is_enable').then((response) => {
      this.isEnableOptions = response.data
    })
    this.getDicts('coupon_activity_type').then((response) => {
      this.activityTypeOptions = response.data
    })
  },
  methods: {
    /** 验证排序是否存在 */
    verificationSort(rule, value, callback) {
      if (value !== this.form.originalSort) {
        checkSort(value).then((res) => {
          if (res.data) {
            callback()
          } else {
            callback(new Error('排序已存在，请重新输入~'))
          }
        })
      }
    },
    /** 查询优惠券信息列表 */
    getList() {
      this.loading = true
      listCouponInfo(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.couponInfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 优惠券类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.type)
    },
    // 失效状态(0失效1正常)字典翻译
    invalidStatusFormat(row, column) {
      return this.selectDictLabel(this.invalidStatusOptions, row.invalidStatus)
    },
    // 优惠券状态
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 禁用启用字典翻译
    isEnableFormat(row, column) {
      return this.selectDictLabel(this.isEnableOptions, row.isEnable)
    },
    thresholdFormat(row, column) {
      if (row.useThreshold === 'full_yuan') {
        return `满${this.toDecimal2(row.orderFull / 100)}元`
      } else {
        return '无门槛'
      }
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
        couponName: null,
        orgId: null,
        type: null,
        status: null,
        activityTypeFlag: null,
        couponPckId: null
      }
      localStorage.removeItem('CouponInfo')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.couponId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.couponInfoList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd(couponType) {
      const path = '/marketing/coupons/marketing/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          couponType,
          type: 'add'
        }
      })
    },
    /** 打开model */
    openModel(row) {
      this.form = {
        sort: row.sort,
        couponId: row.couponId,
        originalSort: row.sort
      }
      this.open = true
    },
    /** g关闭Model */
    cancel() {
      this.form = {}
      this.open = false
    },
    /** 修改Sort */
    handleSort() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm('是否确定修改优惠券排序？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = {
                ...this.form
              }
              delete params.originalSort
              return editSort(params)
            })
            .then(() => {
              this.cancel()
              this.getList()
              this.msgSuccess('修改优惠券排序成功~')
            })
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/marketing/coupons/marketing/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          couponId: row.couponId,
          type: 'update'
        }
      })
    },
    // 失效，有效
    handleStates(rows, invalidStatus) {
      this.$confirm(
        `是否确认${{ 0: '失效', 1: '有效' }[invalidStatus]}"${
          rows.couponName
        }"优惠券?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return invalid({ couponIds: [rows.couponId], invalidStatus })
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 0: '失效', 1: '有效' }[invalidStatus]}成功`)
        })
    },
    // 禁用启用状态
    handleEna(rows, status) {
      this.$confirm(
        `是否确认${{ 0: '禁用', 1: '启用' }[status]}"${
          rows.couponName
        }"优惠券?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return status === 0 ? disabled(rows.couponId) : enabled(rows.couponId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 0: '禁用', 1: '启用' }[status]}成功`)
        })
    },

    // 推广链接
    handlePromote(row) {
      getPromote(row.couponId).then((res) => {
        this.$refs['promote'].link = res.data
        this.$refs['promote'].open = true
        this.$refs['promote'].type = 'base64'
        this.$refs['promote'].generate()
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const couponIds = row.couponId || this.ids
      this.$confirm(
        `是否确认${
          typeof couponIds === 'object'
            ? '批量删除'
            : '删除"' + row.couponName + '"'
        }优惠券?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delCouponInfo(couponIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功~')
        })
    },
    handleCopy(row) {
      const path = '/marketing/coupons/marketing/copy'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          couponId: row.couponId,
          type: 'copy'
        }
      })
    },
    handleCheck(row) {
      const path = '/marketing/coupons/marketing/check'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponInfo', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          couponId: row.couponId,
          type: 'check'
        }
      })
    },
    // 跳转客户界面
    onJump(couponId, type) {
      const path = type === 'order' ? '/order/delivery/allorder' : '/customer/customerInfo'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          couponId
        }
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/marketing/couponInfo/export', this.queryParams)
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.couponInfoList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
