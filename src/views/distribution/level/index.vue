<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['distribution:level:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增等级
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
      <el-form-item label="等级名称" prop="levelName">
        <el-input
          v-model="queryParams.levelName"
          placeholder="请输入等级名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评价星级" prop="rating">
        <el-select
          v-model="queryParams.rating"
          placeholder="请选择评价星级"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in ratingOptions"
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
            v-hasPermi="['distribution:level:export']"
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
      :data="levelList"
      :row-key="(row) => row.levelId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="100" label="等级名称" align="center" prop="levelName" />
      <el-table-column min-width="100" label="累计在线时长" align="center" prop="totalOltime" />
      <el-table-column
        min-width="100"
        label="自然订单多包数"
        align="center"
        prop="naturalOrderNum"
      />
      <el-table-column min-width="100" label="订单数" align="center" prop="orderNum" />
      <el-table-column min-width="100" label="优先级" align="center" prop="priority" :formatter="priorityFormat" />
      <el-table-column
        min-width="100"
        label="评价星级"
        align="center"
        prop="rating"
        :formatter="ratingFormat"
      />
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
      >
        <template slot-scope="scope">
          <div>{{ statusFormat(scope.row) }}</div>
          <el-button
            v-if="scope.row.status === 1"
            v-hasPermi="['distribution:level:failure']"
            size="mini"
            type="text"
            @click="handleStandLevel(scope.row)"
          >
            失效
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">

          <el-button
            v-hasPermi="['distribution:level:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            v-hasPermi="['distribution:level:remove']"
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
          v-hasPermi="['distribution:level:remove']"
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

    <!-- 添加或修改等级对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
        <el-form-item label="累计在线时长" prop="totalOltime">
          <el-col :span="8">
            <el-input-number
              v-model="form.totalOltime"
              placeholder="请输入累计在线时长"
              :min="1"
              :max="999999"
            />
          </el-col>
          <el-col :span="11"> 小时 </el-col>
        </el-form-item>
        <el-form-item label="自然订单多包数" prop="naturalOrderNum">
          <el-input-number
            v-model="form.naturalOrderNum"
            placeholder="请输入自然订单多包数"
            :min="1"
            :max="999999"
          />
        </el-form-item>
        <el-form-item label="订单数" prop="orderNum">
          <el-input-number
            v-model="form.orderNum"
            placeholder="请输入订单数"
            :min="1"
            :max="999999"
          />
        </el-form-item>
        <el-form-item label="评价星级" prop="rating">
          <el-select v-model="form.rating" placeholder="请选择评价星级">
            <el-option
              v-for="dict in ratingOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option
              v-for="dict in priorityOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="等级名称" prop="levelName">
          <el-input v-model="form.levelName" placeholder="请输入等级名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addLevel,
  delLevel,
  getLevel,
  listLevel,
  updateLevel,
  failureLevel
} from '@/api/distribution/level'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Level',
  components: {},
  mixins: [SetTableMaxHeight],
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
      // 等级表格数据
      levelList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 评价星级字典
      ratingOptions: [],
      // 优先级
      priorityOptions: [],
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: null,
        extend: null,
        levelName: null,
        orgId: null,
        totalOltime: null,
        naturalOrderNum: null,
        orderNum: null,
        priority: null,
        rating: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        totalOltime: [
          { required: true, message: '累计在线时长不能为空', trigger: 'blur' }
        ],
        naturalOrderNum: [
          { required: true, message: '自然订单多包数不能为空', trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: '订单数不能为空', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '优先级不能为空', trigger: 'blur' }
        ],
        rating: [
          { required: true, message: '评价星级不能为空', trigger: 'blur' }
        ],
        levelName: [
          { required: true, message: '等级名称不能为空', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('distribution_rating').then((response) => {
      this.ratingOptions = response.data
    })
    this.getDicts('yes_no_effective').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('distribution_level_priority').then((response) => {
      this.priorityOptions = response.data
    })
  },
  methods: {
    /** 查询等级列表 */
    getList() {
      this.loading = true
      listLevel(this.queryParams).then((response) => {
        this.levelList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 评价星级字典翻译
    ratingFormat(row, column) {
      return this.selectDictLabel(this.ratingOptions, row.rating)
    },
    // 优先级字典翻译
    priorityFormat(row, column) {
      return this.selectDictLabel(this.priorityOptions, row.priority)
    },
    // 状态字典翻译
    statusFormat(row, column) {
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
        levelId: null,
        levelName: null,
        totalOltime: null,
        naturalOrderNum: null,
        orderNum: null,
        priority: null,
        rating: null,
        status: null
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
      this.ids = selection.map((item) => item.levelId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.levelList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加等级'
    },
    /**
     * 等级禁用启用
     */
    handleStandLevel(rows) {
      this.$confirm(
        `是否确认失效"${rows.levelName}"等级信息?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return failureLevel(rows.levelId)
      }).then(() => {
        this.getList()
        this.msgSuccess(`失效配送员成功~`)
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const levelId = row.levelId || this.ids
      getLevel(levelId).then((response) => {
        this.form = {
          levelId: response.data.levelId,
          levelName: response.data.levelName,
          totalOltime: response.data.totalOltime,
          naturalOrderNum: response.data.naturalOrderNum,
          orderNum: response.data.orderNum,
          priority: response.data.priority,
          rating: response.data.rating,
          status: response.data.status
        }
        this.open = true
        this.title = '修改等级'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${this.form.levelId ? '修改' : '新增'}配送员等级?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return this.form.levelId ? updateLevel(this.form) : addLevel(this.form)
          }).then(() => {
            this.msgSuccess(`${this.form.levelId ? '修改' : '新增'}成功`)
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const levelIds = row.levelId || this.ids
      this.$confirm(
        `是否确认${typeof levelIds === 'object' ? '批量删除' : '删除"' + row.levelName + '"'}等级?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delLevel(levelIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/level/export',
        {
          ...this.queryParams
        },
        `distribution_level.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.levelList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
