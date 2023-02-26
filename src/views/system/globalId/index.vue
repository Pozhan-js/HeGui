<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:globalId:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增全局ID
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
      <el-form-item label="业务对应key" prop="businessKey">
        <el-input
          v-model="queryParams.businessKey"
          placeholder="请输入业务对应key"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="初始ID" prop="startId">
        <el-input
          v-model="queryParams.startId"
          placeholder="请输入初始ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="业务增长步长" prop="step">
        <el-input
          v-model="queryParams.step"
          placeholder="请输入业务增长步长"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="当前ID" prop="currentId">
        <el-input
          v-model="queryParams.currentId"
          placeholder="请输入当前ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
            v-hasPermi="['system:dict:export']"
            >导出</el-button
          >
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="globalIdList"
      :row-key="(row) => row.id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="主键" align="center" prop="id" /> -->
      <el-table-column min-width="100" label="业务对应key" align="center" prop="businessKey" />
      <el-table-column min-width="100" label="初始id" align="center" prop="startId" />
      <el-table-column min-width="100" label="业务增长步长" align="center" prop="step" />
      <el-table-column min-width="100" label="当前id" align="center" prop="currentId" />
      <el-table-column
        min-width="100"
        label="业务id生成位数填充"
        align="center"
        prop="filling"
      />
      <el-table-column
        min-width="100"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:globalId:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['system:globalId:remove']"
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
          v-hasPermi="['system:dict:remove']"
          plain
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

    <!-- 添加或修改业务全局id配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="业务对应key" prop="businessKey">
          <el-input
            v-model="form.businessKey"
            placeholder="请输入业务对应key"
          />
        </el-form-item>
        <el-form-item label="初始id" prop="startId">
          <el-input v-model="form.startId" placeholder="请输入初始id" />
        </el-form-item>
        <el-form-item label="业务增长步长" prop="step">
          <el-input v-model="form.step" placeholder="请输入业务增长步长" />
        </el-form-item>
        <el-form-item label="当前id" prop="currentId">
          <el-input v-model="form.currentId" placeholder="请输入当前id" />
        </el-form-item>
        <el-form-item label="位数填充" prop="filling">
          <el-input
            v-model="form.filling"
            placeholder="请输入业务id生成位数填充"
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
  addGlobalId,
  delGlobalId,
  getGlobalId,
  listGlobalId,
  updateGlobalId
} from '@/api/system/globalId'

export default {
  name: 'GlobalId',
  components: {},
  data() {
    return {
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
      // 业务全局id配置表格数据
      globalIdList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        businessKey: null,
        startId: null,
        step: null,
        currentId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        businessKey: [
          { required: true, message: '业务对应key不能为空', trigger: 'blur' }
        ],
        startId: [
          { required: true, message: '初始ID不能为空', trigger: 'blur' }
        ],
        step: [
          { required: true, message: '业务增长步长不能为空', trigger: 'blur' }
        ],
        currentId: [
          { required: true, message: '当前ID不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询业务全局id配置列表 */
    getList() {
      this.loading = true
      listGlobalId(this.queryParams).then((response) => {
        this.globalIdList = response.rows
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
        id: null,
        businessKey: null,
        startId: null,
        step: null,
        currentId: null,
        filling: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.globalIdList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加业务全局ID配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getGlobalId(id).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改业务全局ID配置'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${this.form.id != undefined ? '修改' : '新增'}全局ID配置?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.id != undefined
                ? updateGlobalId(this.form)
                : addGlobalId(this.form)
            })
            .then((res) => {
              this.msgSuccess(
                `${this.form.id != undefined ? '修改' : '新增'}成功~`
              )
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm(
        `是否确认${
          typeof ids === 'object' ? '批量删除' : '删除"' + row.businessKey + '"'
        }全局ID配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delGlobalId(ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/globalId/export',
        {
          ...this.queryParams
        },
        `system_globalId.xlsx`
      )
    },
    // 全部选中
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.globalIdList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
