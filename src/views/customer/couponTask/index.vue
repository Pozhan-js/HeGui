<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:couponTask:add']"
          type="primary"
          size="mini"
          @click="handleAdd('consume')"
        >新增消费情况发券
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:couponTask:add']"
          type="primary"
          size="mini"
          @click="handleAdd('waitingTime')"
        >新增等待时长发券
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:couponTask:add']"
          type="primary"
          size="mini"
          @click="handleAdd('unpaid')"
        >新增未支付订单发券
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:couponTask:add']"
          type="primary"
          size="mini"
          @click="handleAdd('label')"
        >新增会员标签发券
        </el-button>
      </el-col>
    </el-row>
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="任务类型"
        prop="taskType"
      >
        <el-select
          v-model="queryParams.taskType"
          placeholder="请选择任务类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in taskTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
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
      <el-row>
        <el-form-item label="发券时间" prop="couponTime">
          <el-date-picker
            v-model="queryParams.couponTime"
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
        style="margin-left: 75px; margin-top: 5px"
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
            v-hasPermi="['customer:couponTask:export']"
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
      :data="couponTaskList"
      :row-key="(row) => row.couponTaskId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="100" label="优惠券名称" align="center" prop="couponName" />
      <el-table-column min-width="100" label="类型" align="center" prop="taskType" :formatter="taskTypeFormat" />
      <el-table-column min-width="100" label="发券区域" align="center" prop="orgName" />
      <el-table-column min-width="100" label="发券总客户数" align="center" prop="couponTotal" />
      <el-table-column min-width="100" label="实发客户数" align="center" prop="usedCouponNum" />
      <el-table-column min-width="100" label="已使用量" align="center" prop="usedNum" />
      <el-table-column min-width="100" label="未使用量" align="center" prop="notUsedNum" />
      <el-table-column min-width="100" label="发券时间" align="center" prop="couponTime" />
      <el-table-column min-width="100" label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column min-width="100" label="任务创建时间" align="center" prop="createTime" />
      <!-- <el-table-column label="开始时间" align="center" prop="beginTime" />
      <el-table-column label="结束时间" align="center" prop="endTime"/> -->
      <el-table-column
        min-width="100"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status !== 3 && scope.row.status !== 2"
            v-hasPermi="['customer:couponTask:disabled']"
            size="mini"
            type="text"
            @click="handleDisabled(scope.row)"
          >失效
          </el-button>
          <el-button
            v-hasPermi="['customer:couponTask:edit']"
            size="mini"
            type="text"
            :disabled="scope.row.status === 3 || scope.row.status === 2"
            @click="handleUpdate(scope.row, 'update')"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(scope.row,'check')"
          >查看
          </el-button>
          <el-button
            v-if="scope.row.status === 3"
            v-hasPermi="['customer:couponTask:remove']"
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
          v-hasPermi="['customer:couponTask:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
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
</template>

<script>
import {
  delCouponTask,
  listCouponTask,
  disabled
} from '@/api/customer/couponTask'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'CouponTask',
  components: {
    Cascader
  },
  mixins: [ SetTableMaxHeight ],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length >= 5,
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
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 客户发券任务表格数据
      couponTaskList: [],
      // 全选状态
      checked: false,
      // 任务类型(1消费情况2等待时长3未支付订单)字典
      taskTypeOptions: [],
      // 状态(0未开始1进行中2已结束3失效)字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        taskType: null,
        status: null,
        couponTime: null,
        orderByColumn: 'create_time',
        isAsc: 'desc'
      },
      // 表单参数
      form: {},
      searchParams: {},
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
      }
    }
  },
  created() {
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('customer_coupon_task_type').then((response) => {
      this.taskTypeOptions = response.data
    })
    this.getDicts('customer_coupon_task_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询客户发券任务列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.couponTime && this.queryParams.couponTime.length === 2) {
        params.couponBeginTime = this.queryParams.couponTime[0]
        params.couponEndTime = this.queryParams.couponTime[1]
        delete params.couponTime
      }
      listCouponTask(params).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.couponTaskList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 任务类型(1消费情况2等待时长3未支付订单)字典翻译
    taskTypeFormat(row) {
      return this.selectDictLabel(this.taskTypeOptions, row.taskType)
    },
    // 状态(0未开始1进行中2已结束3失效)字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null,
        taskType: null,
        status: null,
        couponTime: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.couponTime = null
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.couponTaskId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.couponTaskList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd(type) {
      const path = `/customer/userGroup/couponTask/${type}`
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponTask', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'add',
          viveType: type
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row, type) {
      const couponTaskId = row.couponTaskId
      const path = {
        1: '/customer/userGroup/couponTask/consume',
        2: '/customer/userGroup/couponTask/waitingTime',
        3: '/customer/userGroup/couponTask/unpaid',
        4: '/customer/userGroup/couponTask/label'
      }[row.taskType]
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('CouponTask', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type,
          viveType: { 1: 'consume', 2: 'waitingTime', 3: 'unpaid', 4: 'label' }[row.taskType],
          couponTaskId
        }
      })
    },
    // 客户发券失效
    handleDisabled(row) {
      this.$confirm(`是否确认失效客户发券任务?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return disabled(row.couponTaskId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('失效成功')
        })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const couponTaskIds = row.couponTaskId || this.ids
      const type = typeof couponTaskIds === 'object' ? '批量删除' : '删除'
      this.$confirm(`是否确认${type}客户发券任务?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delCouponTask(couponTaskIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/couponTask/export',
        {
          ...this.queryParams
        },
        `customer_couponTask.xlsx`
      )
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.couponTaskList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
