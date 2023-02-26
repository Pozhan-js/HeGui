<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:label:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增标签
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
      <el-form-item label="标签名称" prop="labelName">
        <el-input
          v-model="queryParams.labelName"
          placeholder="请输入标签名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标签状态" prop="labelStatus">
        <dict-select
          v-model="queryParams.labelStatus"
          dict="customer_label_status"
          :out-dicts.sync="customer_label_status"
        />
      </el-form-item>
      <el-form-item label="标签规则" prop="labelRuleFlag">
        <dict-select
          v-model="queryParams.labelRuleFlag"
          dict="customer_label_rule_flag"
          :out-dicts.sync="customer_label_rule_flag"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="beginTime">
        <RangePicker
          :clearable="false"
          size="small"
          style="max-width: 360px"
          :s-time.sync="queryParams.beginTime"
          :e-time.sync="queryParams.endTime"
          placeholder="选择创建时间"
        />
      </el-form-item>
      <el-row :gutter="10" style="margin-left: 95px; margin-top: 5px">
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            class="gray-btn"
            size="mini"
            @click="resetQuery"
          >重置</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:label:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <div style="display: flex; margin-top: 20px;">
      <div class="tag" style="margin-right: 10px">
        <LabelType
          v-model="queryParams.labelTypeId"
          :label-type="labelType"
          @getLabelType="getLabelType"
          @input="handleQuery"
        />
      </div>

      <div style="flex: 1; overflow: hidden">
        <el-table
          ref="multipleTable"
          v-loading="loading"
          style="width: 100%"
          :max-height="maxHeight"
          :data="labelList"
          row-key="labelId"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="80" align="center" />
          <el-table-column
            min-width="100"
            label="标签类型"
            align="center"
            prop="labelTypeName"
          />
          <el-table-column
            min-width="100"
            label="标签名称"
            align="center"
            prop="labelName"
          />
          <el-table-column
            min-width="100"
            label="会员数"
            sortable
            align="center"
            prop="customerNum"
          />
          <el-table-column
            min-width="100"
            label="标签状态"
            align="center"
            prop="labelStatus"
          >
            <template #default="{ row }">
              <div>
                {{ selectDictLabel(customer_label_status, row.labelStatus) }}
              </div>
              <el-button
                v-hasPermi="['customer:label:labelStatus']"
                size="mini"
                type="text"
                @click="row.labelStatus === 1 ? disabled(row) : enabled(row)"
              >
                {{ row.labelStatus === 1 ? "失效" : "启用" }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            min-width="100"
            label="标签规则"
            align="center"
            prop="labelRuleFlag"
            :formatter="
              (_, __, value) => selectDictLabel(customer_label_rule_flag, value)
            "
          />
          <el-table-column
            min-width="100"
            label="标签背景色"
            align="center"
            prop="labelColor"
          >
            <template slot-scope="{ row }">
              <div
                :style="{ background: row.labelColor, 'border-radius': '4px', color: getTextColor(row.labelColor) }"
              >
                {{ row.labelColor }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            min-width="100"
            label="说明备注"
            align="center"
            prop="remark"
          />
          <el-table-column
            min-width="100"
            label="创建时间"
            align="center"
            prop="createTime"
          >
            <template slot-scope="{ row }">
              <break-time :date-time="row.createTime" />
            </template>
          </el-table-column>
          <el-table-column
            min-width="100"
            label="最后编辑人"
            align="center"
            prop="updateBy"
          />
          <el-table-column
            min-width="100"
            label="操作"
            align="center"
            fixed="right"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                class="outer-link--text"
                size="mini"
                type="text"
                @click="toUserList(scope.row)"
              >查看会员
              </el-button>
              <el-button
                v-hasPermi="['customer:label:edit']"
                size="mini"
                type="text"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-hasPermi="['customer:label:remove']"
                size="mini"
                type="text"
                @click="handleDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-row style="padding-bottom: 10px">
          <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
            <el-checkbox
              v-model="checked"
              @change="toggleSelection"
            >当页全选</el-checkbox>
          </el-col>
          <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
            <el-button
              v-hasPermi="['customer:label:remove']"
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
      </div>
    </div>

    <div class="group-list">
      <div class="group-list__title">标签展示</div>
      <div class="group-list__body">
        <div
          v-for="(group, index) in labelType"
          :key="group.labelTypeId"
          class="group-list__item"
        >
          <div class="group-item__index">{{ index + 1 }}</div>
          <div class="group-item__body">
            <div class="group-body__name">{{ group.labelTypeName }}</div>
            <div class="group-body__list-container">
              <div ref="label" class="group-body__list">
                <div
                  v-for="label in group.customerLabelList"
                  :key="label.labelId"
                  class="group-body__item"
                  :style="{ background: label.labelColor, color: getTextColor(label.labelColor) }"
                >
                  {{ label.labelName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 添加或修改客户标签对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col span="12">
            <el-form-item label="标签类型" prop="labelTypeId">
              <el-select v-model="form.labelTypeId">
                <el-option
                  v-for="dict in labelType"
                  :key="dict.labelTypeId"
                  :label="dict.labelTypeName"
                  :value="dict.labelTypeId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col span="12">
            <el-form-item label="标签状态" prop="labelStatus">
              <el-radio-group v-model="form.labelStatus">
                <el-radio
                  v-for="dict in customer_label_status"
                  :key="dict.dictValue"
                  :label="parseInt(dict.dictValue)"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="标签名称" prop="labelName">
              <el-input v-model="form.labelName" placeholder="请输入标签名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签背景色" prop="labelColor">
              <el-color-picker v-model="form.labelColor" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="说明备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入说明备注"
            />
          </el-form-item>
        </el-row>
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
  addLabel,
  delLabel,
  getLabel,
  listLabel,
  updateLabel,
  enabled,
  disabled,
  listLabelType
} from '@/api/customer/label'
import DictSelect from '@/components/DictSelect.vue'
import LabelType from './components/labelType.vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Label',
  components: { DictSelect, LabelType },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      labelType: [],
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
      customer_label_status: [],
      customer_label_rule_flag: [],
      // 总条数
      total: 0,
      // 客户标签表格数据
      labelList: [],
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
        labelName: null,
        labelStatus: null
      },
      // 表单参数
      form: {
        labelStatus: 1
      },
      // 表单校验
      rules: {
        labelTypeId: [
          { required: true, message: '请选择标签类型' }
        ],
        labelName: [
          { required: true, message: '标签名称不能为空', trigger: 'blur' },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    labelType() {
      this.$nextTick(() => {
        this.$refs.label?.forEach((i) => {
          if (i.scrollHeight > i.clientHeight) {
            i.classList.add('overflow')
          } else {
            i.classList.remove('overflow')
          }
        })
      })
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getTextColor(hex) {
      try {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        const r = parseInt(result[1], 16)
        const g = parseInt(result[2], 16)
        const b = parseInt(result[3], 16)
        const grayscale = r * 0.299 + g * 0.587 + b * 0.114
        return grayscale > 100 ? '#000' : '#fff'
      } catch {
        return '#000'
      }
    },
    getLabelType() {
      listLabelType().then((res) => {
        this.labelType = res.data
      })
    },
    toUserList(row) {
      this.$router.push({
        path: '/customer/customerInfo',
        query: {
          labelId: row.labelId
        }
      })
    },
    /** 查询客户标签列表 */
    getList() {
      this.loading = true
      listLabel({
        orderByColumn: 'create_time',
        isAsc: 'desc',
        ...this.queryParams
      }).then((response) => {
        this.labelList = response.rows
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
        labelStatus: 1
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
      this.ids = selection.map((item) => item.labelId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.labelList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加客户标签'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const labelId = row.labelId || this.ids
      getLabel(labelId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改客户标签'
      })
    },
    // 修改状态
    disabled(row) {
      this.$confirm(`是否确认失效"${row.labelName}"客户标签?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => disabled(row.labelId))
        .then(() => {
          this.msgSuccess(`禁用客户标签成功`)
          this.getList()
          this.getLabelType()
        })
    },
    // 修改状态
    enabled(row) {
      this.$confirm(`是否确认启用"${row.labelName}"客户标签?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => enabled(row.labelId))
        .then(() => {
          this.msgSuccess(`启用客户标签成功`)
          this.getList()
          this.getLabelType()
        })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${this.form.labelId ? '修改' : '新增'}客户标签?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.labelId
                ? updateLabel(this.form)
                : addLabel(this.form)
            })
            .then(() => {
              this.msgSuccess(`${this.form.labelId ? '修改' : '新增'}成功`)
              this.getLabelType()
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const labelIds = row.labelId || this.ids
      this.$confirm(
        `是否确认${
          typeof labelIds === 'object'
            ? '批量删除'
            : '删除"' + row.labelName + '"'
        }客户标签?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delLabel(labelIds)
        })
        .then(() => {
          this.getList()
          this.getLabelType()
          this.msgSuccess('删除成功~')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/label/export',
        {
          ...this.queryParams
        },
        `customer_label.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.labelList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/styles/variables";

.group-list {
  .group-list__title {
    font-weight: 700;
    padding: 20px 0;
  }
  .group-list__body {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-auto-rows: 170px;
  }
  .group-list__item {
    display: flex;
    .group-item__index {
      width: 60px;
      height: 70px;
      background: $blue;
      text-align: center;
      line-height: 80px;
      font-size: 32px;
      color: #fff;
      margin-left: 20px;
      position: relative;
      &:before {
        content: "";
        position: absolute;
        border-style: solid;
        /*边框颜色*/
        border-color: $blue;
        /*边框宽度*/
        border-width: 30px;
        left: 0;
        bottom: -60px;
        border-right-color: transparent;
        border-left-color: transparent;
        border-bottom-color: transparent;
      }
    }
    .group-item__body {
      margin-left: 5px;
      flex: 1;
      .group-body__name {
        font-weight: 600;
        margin-left: 5px;
      }
      .group-body__list-container {
        position: relative;
        height: 100px;
      }
      .group-body__list {
        padding: 10px 0 5px 5px;
        height: 100px;
        overflow: hidden;
        border-radius: 4px;
        transition: all 0.3s;
        &.overflow:hover {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          overflow: scroll;
          height: 250px;
          background: #fff;
          box-shadow: 2px 0 12px rgba(0, 21, 41, 0.35);
          z-index: 1;
        }
      }
      .group-body__item {
        flex-shrink: 0;
        padding: 2px 6px;
        font-size: 13px;
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
        border-radius: 3px;
      }
    }
  }
}
</style>
