<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-if="amountrulesList.length < 6"
          v-hasPermi="['distribution:amountrules:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增质保金规格
        </el-button>
      </el-col>
    </el-row>
    <!-- <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="金额" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入金额"
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
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form> -->

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="amountrulesList"
      :row-key="(row) => row.rulesId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column label="ID" align="center" prop="rulesId" />
      <!-- <el-table-column label="排序" align="center" prop="sort" /> -->
      <el-table-column label="金额" align="center" prop="amount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['distribution:amountrules:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['distribution:amountrules:remove']"
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
          v-hasPermi="['distribution:amountrules:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 添加或修改质保金规格对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :precision="0"
            placeholder="请输入金额"
          />
        </el-form-item>
        <!-- <el-form-item label="排序" prop="sort">
          <el-input-number
            :min="0"
            v-model="form.sort"
            placeholder="请输入排序"
          />
        </el-form-item> -->
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
  addAmountrules,
  delAmountrules,
  getAmountrules,
  listAmountrules,
  updateAmountrules
} from '@/api/finance/amountrules'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  name: 'Amountrules',
  components: {
    Cascader
  },
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
      // 质保金规格表格数据
      amountrulesList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        orgId: null,
        amount: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getList()
  },
  methods: {
    /** 查询质保金规格列表 */
    getList() {
      this.loading = true
      listAmountrules(this.queryParams).then((response) => {
        this.amountrulesList = response.data
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
        rulesId: null,
        // sort: null,
        amount: null
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
      this.ids = selection.map((item) => item.rulesId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.amountrulesList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加质保金规格'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const rulesId = row.rulesId
      const orgArr = flatten(this.orgOptions, 'children')
      getAmountrules(rulesId).then((response) => {
        this.form = {
          rulesId: response.data.rulesId,
          //   orgId: searchSuperior(response.data.orgId, "id", orgArr, "parentId"),
          sort: response.data.sort,
          amount: response.data.amount / 100
        }
        this.open = true
        this.title = '修改质保金规格'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const amountArr = this.amountrulesList.map(item => item.amount)
          if (amountArr.includes(this.form.amount * 100)) {
            return this.warning('已存在相同质保金规格~')
          }
          const type = this.form.rulesId != null ? '修改' : '新增'
          this.$confirm(`是否确认${type}质保金规格?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              const params = {
                ...this.form,
                amount: this.form.amount * 100
              }
              return this.form.rulesId != null
                ? updateAmountrules(params)
                : addAmountrules(params)
            })
            .then(() => {
              this.msgSuccess(`${type}质保金规格成功`)
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const rulesIds = row.rulesId || this.ids
      const type =
        typeof rulesIds === 'object'
          ? '批量删除'
          : '删除'
      this.$confirm(`是否确认${type}质保金规格?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delAmountrules(rulesIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.amountrulesList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
