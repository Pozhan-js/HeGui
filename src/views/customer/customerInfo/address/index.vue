<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:address:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增收货地址
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
      <el-form-item label="收件人" prop="recipient">
        <el-input
          v-model="queryParams.recipient"
          placeholder="请输入收件人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入联系电话"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地区" prop="area">
        <Cascader
          v-model="queryParams.area"
          :options="areaOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请输入地区"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否默认" prop="defaultFlag">
        <el-select
          v-model="queryParams.defaultFlag"
          placeholder="请选择是否默认"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in defaultFlagOptions"
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
        <el-col class="gray" :span="1.5">
          <el-button size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:address:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="addressList"
      :row-key="(row) => row.addressId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="客户收货地址id" align="center" prop="addressId" /> -->
      <el-table-column min-width="120" label="收件人" align="center" prop="recipient" />
      <el-table-column min-width="120" label="联系电话" align="center" prop="phone" />
      <el-table-column min-width="120" label="地区" align="center" prop="regionName" />
      <el-table-column min-width="120" label="详细地址" align="center" prop="details" />
      <el-table-column
        min-width="100"
        label="默认标志"
        align="center"
        prop="defaultFlag"
        :formatter="defaultFlagFormat"
      />
      <el-table-column
        min-width="80"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['customer:address:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['customer:address:remove']"
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

    <!-- 添加或修改客户收货地址对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收件人" prop="recipient">
          <el-input v-model="form.recipient" placeholder="请输入收件人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地区" prop="area">
          <el-cascader
            v-model="form.area"
            style="width: 100%"
            :options="areaOptions"
            :props="{ value: 'id', label: 'label', expandTrigger: 'hover' }"
            placeholder="请输入地区"
          />

        </el-form-item>
        <el-form-item label="详细地址" prop="details">
          <el-input
            v-model="form.details"
            type="textarea"
            placeholder="请输入详细地址"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="默认地址" prop="defaultFlag">
          <el-radio-group v-model="form.defaultFlag">
            <el-radio
              v-for="dict in defaultFlagOptions"
              :key="dict.dictValue"
              :label="parseInt(dict.dictValue)"
            >{{ dict.dictLabel }}
            </el-radio>
          </el-radio-group>
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
  addAddress,
  delAddress,
  getAddress,
  listAddress,
  updateAddress
} from '@/api/customer/address'
import { getAreaTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'Address',
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
      // 总条数
      total: 0,
      // 客户收货地址表格数据
      addressList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 默认标志字典
      defaultFlagOptions: [],
      // 地区数据
      areaOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerId: this.$route.query.customerId,
        recipient: null,
        phone: null,
        area: null,
        defaultFlag: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        recipient: [
          { required: true, message: '收件人不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '联系电话不能为空', trigger: 'blur' }
        ],
        area: [{ required: true, message: '地区不能为空', trigger: 'blur' }],
        details: [
          { required: true, message: '详细地址不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('customer_default_flag').then((response) => {
      this.defaultFlagOptions = response.data
    })
    // 查询地区
    getAreaTree().then((res) => {
      this.areaOptions = res.data
    })
  },
  methods: {
    /** 查询客户收货地址列表 */
    getList() {
      this.loading = true
      const prams = {
        ...this.queryParams
      }
      if (this.queryParams.area) {
        prams.area = this.queryParams.area[this.queryParams.area.length - 1]
      }
      listAddress(prams).then((response) => {
        this.addressList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 默认标志字典翻译
    defaultFlagFormat(row, column) {
      return this.selectDictLabel(this.defaultFlagOptions, row.defaultFlag)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        recipient: null,
        phone: null,
        area: null,
        details: null,
        defaultFlag: 0
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
      this.ids = selection.map((item) => item.addressId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.addressList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加客户收货地址'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const addressId = row.addressId || this.ids[0]
      getAddress(addressId).then((response) => {
        this.form = {
          addressId: response.data.addressId,
          recipient: response.data.recipient,
          phone: response.data.phone,
          area: response.data.area,
          details: response.data.details,
          defaultFlag: response.data.defaultFlag
        }
        this.open = true
        this.title = '修改客户收货地址'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${
              this.form.addressId ? '修改收货地址？' : '添加收货地址？'
            }`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const prams = {
                ...this.form,
                customerId: this.$route.query.customerId
              }
              if (typeof this.form.area === 'object') {
                prams.province = this.form.area[0]
                prams.city = this.form.area[1]
                prams.area = this.form.area[2]
              } else {
                prams.area = this.form.area
              }
              return this.form.addressId
                ? updateAddress(prams)
                : addAddress(prams)
            })
            .then((res) => {
              this.msgSuccess(
                this.form.addressId ? '修改收货地址成功~' : '添加收货地址成功~'
              )
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const addressIds = row.addressId || this.ids
      this.$confirm(
        `是否确认${
          typeof addressIds === 'object' ? '批量删除' : '删除"' + row.recipient +
        '"'}收货地址?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delAddress(addressIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功~')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/address/export',
        {
          ...this.queryParams
        },
        `customer_address.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.addressList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
