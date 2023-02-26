<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['distribution:definition:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增班次
        </el-button>
      </el-col>
    </el-row>
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="适用组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          placeholder="请选择所在组织"
          change-on-select
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item
        label="班次"
        prop="scheduleType"
      >
        <dict-select v-model="queryParams.scheduleType" dict="distribution_schedule_type" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <dict-select v-model="queryParams.status" dict="schedule_is_enable" />
      </el-form-item>
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:definition:export']"
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
      style="margin-top: 20px"
      :row-key="(row) => row.scheduleDefinitionId"
      :data="definitionList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column label="适用组织" align="center" prop="orgName" />
      <el-table-column label="班次" align="center" prop="scheduleTypeName" />
      <el-table-column label="班次名称" align="center" prop="scheduleName" />
      <el-table-column label="上班时间" align="center" prop="workOnTime" />
      <el-table-column label="下班时间" align="center" prop="workOffTime" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="状态" width="60" align="center" prop="statusName" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['distribution:definition:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['distribution:definition:operation']"
            size="mini"
            type="text"
            @click="handleStatus(scope.row, scope.row.status)"
          >
            {{ scope.row.status === '2' ? '启用' : '停用' }}
          </el-button>
          <el-button
            v-hasPermi="['distribution:definition:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
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
          v-hasPermi="['distribution:definition:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
        <el-button
          v-hasPermi="['distribution:definition:operation']"
          size="mini"
          :disabled="multiple"
          @click="handleBatchStatus"
        >
          停用
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

    <!-- 添加或修改班次定义对话框 -->
    <el-dialog ref="dialog" :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="组织" prop="orgId">
          <Cascader
            v-model="form.orgId"
            :get-popup-container="() => $refs.dialog.$el"
            :options="orgOptions"
            placeholder="请选择所在组织"
            :field-names="{ value: 'id', label: 'label', children: 'children' }"
            :disabled="!!form.scheduleDefinitionId"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="班次名称" prop="scheduleName">
          <el-input v-model="form.scheduleName" placeholder="请输入班次名称" />
        </el-form-item>
        <el-form-item
          label="班次类型"
          prop="scheduleType"
        >
          <dict-select v-model="form.scheduleType" dict="distribution_schedule_type" placeholder="请选择班次类型" />
        </el-form-item>
        <el-form-item label="上、下班时间" prop="workTimeRange">
          <el-time-picker
            v-model="form.workTimeRange"
            is-range
            range-separator="-"
            format="HH:mm"
            value-format="HH:mm"
            start-placeholder="上班时间"
            end-placeholder="下班时间"
            placeholder="选择上下班时间范围"
            @change="handleWorkTimeChange"
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
import {
  addDefinition,
  delDefinition,
  getDefinition,
  listDefinition,
  updateDefinition
} from '@/api/attendance/shift'
import DictSelect from '@/components/DictSelect.vue'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  name: 'Definition',
  components: {
    DictSelect,
    Cascader
  },
  data() {
    const validateTimeRange = (rule, value, callback) => {
      if (value[0] === value[1]) {
        callback(new Error('上下班时间不能相同'))
      } else {
        callback()
      }
    }

    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 班次定义表格数据
      definitionList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'create_time',
        isAsc: 'desc',
        params: null,
        extend: null,
        orgId: null,
        scheduleType: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orgId: [{ required: true, message: '组织不能为空', trigger: 'blur' }],
        scheduleName: [
          { required: true, message: '班次名称不能为空', trigger: 'blur' },
          { max: 8, message: '班次名称不能超过8个字符', trigger: 'blur' }
        ],
        scheduleType: [{ required: true, message: '班次类型不能为空', trigger: 'change' }],
        workTimeRange: [
          { required: true, message: '上、下班时间不能为空', trigger: 'blur' },
          { validator: validateTimeRange, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  methods: {
    /** 查询班次定义列表 */
    getList() {
      this.loading = true
      listDefinition(this.queryParams).then((response) => {
        this.definitionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        scheduleDefinitionId: null,
        orgId: null,
        scheduleName: null,
        scheduleType: null,
        workTimeRange: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.scheduleDefinitionId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.definitionList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增考勤班次'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const scheduleDefinitionId = row.scheduleDefinitionId || this.ids
      getDefinition(scheduleDefinitionId).then((response) => {
        const orgArr = flatten(this.orgOptions, 'children')
        this.form = {
          ...response.data,
          orgId: searchSuperior(response.data.orgId, 'id', orgArr, 'parentId'),
          workTimeRange: [new Date(null, null, null, ...response.data.workOnTime.split(':')), new Date(null, null, null, ...response.data.workOffTime.split(':'))]
        }
        this.open = true
        this.title = '修改考勤班次'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const type = this.form.scheduleDefinitionId ? '修改' : '新增'
          this.$confirm(`是否确认${type}考勤班次?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = {
                ...this.form,
                orgId: this.form.orgId.slice(-1)[0]
              }
              return this.form.scheduleDefinitionId ? updateDefinition(params) : addDefinition(params)
            })
            .then(() => {
              this.msgSuccess(`${type}考勤班次成功`)
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const scheduleDefinitionIds = row.scheduleDefinitionId || this.ids
      this.$confirm(`是否确认${typeof scheduleDefinitionIds === 'object' ? '批量删除' : '删除"' + row.scheduleName + '"'}班次?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delDefinition(scheduleDefinitionIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/schedule/export',
        {
          ...this.queryParams
        }
      )
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.definitionList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleStatus(rows, status) {
      this.$confirm(`是否确认${{ 1: '停用', 2: '启用' }[status]}"${rows.scheduleName}"班次信息?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return updateDefinition({
            scheduleDefinitionId: rows.scheduleDefinitionId,
            status: status === '2' ? '1' : '2'
          })
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 1: '停用', 2: '启用' }[status]}成功`)
        })
    },
    handleBatchStatus() {
      this.$confirm('是否确认批量停用班次信息?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const list = this.ids.map(item => ({ scheduleDefinitionId: item, status: '2' }))
          return updateDefinition(list)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('停用成功')
        })
    },
    handleWorkTimeChange(val) {
      this.form.workOnTime = val?.[0]
      this.form.workOffTime = val?.[1]
    }
  }
}
</script>
