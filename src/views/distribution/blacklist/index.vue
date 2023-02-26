<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['distribution:blacklist:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增黑名单
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
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入姓名或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="编号" prop="distributionCode">
        <el-input
          v-model="queryParams.distributionCode"
          placeholder="请输入编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="queryParams.idCard"
          placeholder="请输入身份证号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="加入时间" prop="time">
          <el-date-picker
            v-model="queryParams.time"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row>
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
            v-hasPermi="['distribution:blacklist:export']"
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
      :data="blacklistList"
      :row-key="(row) => row.blacklistId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="80" label="编号" align="center" prop="distributionCode" />
      <el-table-column min-width="100" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="100" label="姓名" align="center" prop="distributionName" />
      <el-table-column min-width="110" label="电话" align="center" prop="telephone" />
      <el-table-column
        min-width="100"
        label="加入时间"
        align="center"
        prop="createTime"
      >
        <template slot-scope="scope">
          <break-time :date-time="scope.row.createTime"/>
        </template>
      </el-table-column>
      <el-table-column min-width="120" label="身份证号" align="center" prop="idCard" />
      <el-table-column min-width="120" label="加入原因" align="center" prop="remark" />
      <el-table-column
        min-width="80"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['distribution:blacklist:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >移除黑名单
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
          v-hasPermi="['distribution:blacklist:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >移除黑名单
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

    <!-- 添加或修改黑名单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="distributionName">
          <el-input v-model="form.distributionName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="telephone">
          <el-input v-model="form.telephone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="加入原因" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            maxlength="30"
            show-word-limit
            placeholder="请输入加入原因"
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
  addBlacklist,
  delBlacklist,
  getBlacklist,
  listBlacklist
} from '@/api/distribution/blacklist'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Blacklist',
  components: {
    Cascader
  },
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
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 黑名单表格数据
      blacklistList: [],
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
        orgId: null,
        distributionCode: null,
        idTag: null,
        idCard: null,
        time: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        idCard: [
          { required: true, message: '身份证号码不能为空', trigger: 'blur' }
        ],
        telephone: [
          { required: true, message: '电话不能为空', trigger: 'blur' }
        ],
        distributionName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '加入原因不能为空', trigger: 'blur' }
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
  },
  methods: {
    /** 查询黑名单列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.firedSTime = moment(this.queryParams.time[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        params.firedETime = moment(this.queryParams.time[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        delete params.time
      }
      listBlacklist(params).then((response) => {
        this.blacklistList = response.rows
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
        idCard: null,
        telephone: null,
        distributionName: null,
        remark: null
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
      this.ids = selection.map((item) => item.blacklistId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.blacklistList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加黑名单'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const blacklistId = row.blacklistId || this.ids
      getBlacklist(blacklistId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改黑名单'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(`是否确认新增黑名单?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              return addBlacklist(this.form)
            })
            .then(() => {
              this.msgSuccess(`新增黑名单成功~`)
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const blacklistIds = row.blacklistId || this.ids
      this.$confirm(
        `是否确认${typeof blacklistIds === 'object' ? '批量移除' : '移除"' + row.distributionName + '"'}黑名单?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return delBlacklist(blacklistIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('移除黑名单成功~')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/blacklist/export',
        {
          ...this.queryParams
        },
        `distribution_blacklist.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.blacklistList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
