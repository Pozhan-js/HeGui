<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['goodsmanage:group:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增分组
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
      <el-form-item label="分组名称" prop="groupName">
        <el-input
          v-model="queryParams.groupName"
          placeholder="请输入分组名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分组类型" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="请选择分组类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分组序号" prop="groupNumber">
        <el-input
          v-model="queryParams.groupNumber"
          placeholder="请输入分组序号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['goodsmanage:group:export']"
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
      :data="groupList"
      :row-key="(row) => row.groupId"
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column label="商品分组id" align="center" prop="groupId" /> -->
      <el-table-column min-width="100" label="分组名称" align="center" prop="groupName" />
      <el-table-column
        min-width="100"
        label="分组类型"
        align="center"
        prop="groupType"
        :formatter="groupTypeFormat"
      />
      <el-table-column min-width="90" label="商品数量" align="center" prop="goodsNum" />
      <el-table-column min-width="90" label="分组序号" align="center" prop="groupNumber" />
      <el-table-column min-width="100" label="创建时间" align="center" prop="createTime" />
      <el-table-column
        min-width="60"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['goodsmanage:group:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['goodsmanage:group:remove']"
            >删除
          </el-button> -->
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

    <!-- 添加或修改商品分组对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入分组名称" />
        </el-form-item>

        <el-form-item label="分组序号" prop="groupNumber">
          <el-input-number
            v-model="form.groupNumber"
            :min="0"
            placeholder="请输入分组序号"
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
  addGroup,
  delGroup,
  getGroup,
  listGroup,
  updateGroup,
  removePre
} from '@/api/goodsmanage/group'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Group',
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
      // 商品分组表格数据
      groupList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 分组类型(商品，赠品)字典
      groupTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        groupName: null,
        groupType: null,
        groupNumber: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        groupName: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' }
        ],
        groupType: [
          {
            required: true,
            message: '分组类型(商品，赠品)不能为空',
            trigger: 'change'
          }
        ],
        groupNumber: [
          { required: true, message: '分组序号不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('merchant_group_type').then((response) => {
      this.groupTypeOptions = response.data
    })
  },
  methods: {
    /** 查询商品分组列表 */
    getList() {
      this.loading = true
      listGroup(this.queryParams).then((response) => {
        this.groupList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 分组类型(商品，赠品)字典翻译
    groupTypeFormat(row, column) {
      return this.selectDictLabel(this.groupTypeOptions, row.groupType)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        groupId: null,
        groupName: null,
        groupType: null,
        groupNumber: null
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
      this.ids = selection.map((item) => item.groupId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加商品分组'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const groupId = row.groupId || this.ids
      getGroup(groupId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改商品分组'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(`是否确认${this.form.groupId != null ? '修改' : '新增'}商品分组？`, '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return this.form.groupId != null ? updateGroup(this.form) : addGroup(this.form)
          }).then(res => {
            this.msgSuccess(`${this.form.groupId != null ? '修改' : '新增'}成功~`)
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const groupIds = row.groupId || this.ids
      removePre(groupIds).then((res) => {
        this.$confirm(
          res.msg !== null && res.msg !== ''
            ? `商品分组中存在${res.msg}是否确认删除？`
            : `是否确认${typeof groupIds === 'object' ? '批量删除' : '删除"' + row.groupName + '"'}商品分组?`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(function() {
            return delGroup(groupIds)
          })
          .then(() => {
            this.getList()
            this.msgSuccess('删除成功')
          })
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'merchant/group/export',
        {
          ...this.queryParams
        },
        `merchant_group.xlsx`
      )
    }
  }
}
</script>
