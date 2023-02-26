<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:label:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增标签规则
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
      <el-form-item label="标签规则" prop="labelRuleName">
        <el-input
          v-model="queryParams.labelRuleName"
          placeholder="请输入标签规则名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规则状态" prop="ruleStatus">
        <dict-select
          v-model="queryParams.ruleStatus"
          dict="customer_label_status"
          :out-dicts.sync="customer_label_status"
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

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="width: 100%"
      :max-height="maxHeight"
      :data="labelList"
      row-key="labelRuleId"
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
        label="标签规则名称"
        align="center"
        prop="labelRuleName"
      />
      <el-table-column
        min-width="100"
        label="规则状态"
        align="center"
        prop="ruleStatus"
      >
        <template #default="{ row }">
          <div>
            {{ selectDictLabel(customer_label_status, row.ruleStatus) }}
          </div>
          <el-button
            v-hasPermi="['customer:labelRule:labelStatus']"
            size="mini"
            type="text"
            @click="row.ruleStatus === 1 ? disabled(row) : enabled(row)"
          >
            {{ row.ruleStatus === 1 ? "失效" : "启用" }}
          </el-button>
        </template>
      </el-table-column>
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
            v-hasPermi="['customer:labelRule:edit']"
            size="mini"
            type="text"
            @click="handlePreview(scope.row)"
          >查看
          </el-button>
          <el-button
            v-hasPermi="['customer:labelRule:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['customer:labelRule:remove']"
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

    <!-- 添加或修改客户标签对话框 -->
    <el-dialog
      :title="title"
      width="1100px"
      :visible.sync="open"
      append-to-body
      :close-on-click-modal="false"
      @closed="resetForm"
      @open="queryUser"
    >
      <el-form
        v-if="form.customerLabelRule"
        ref="form"
        :model="form"
        label-width="100px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item
              label="会员标签"
              prop="customerLabelRule.labelId"
              :rules="rules.labelId"
            >
              <el-select
                v-model="form.customerLabelRule.labelId"
                :disabled="!editable"
                style="width: 100%"
                @change="setLabelTypeId"
              >
                <el-option
                  v-for="dict in listLabel"
                  :key="dict.labelId"
                  :label="dict.labelName"
                  :value="dict.labelId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="规则名称"
              prop="customerLabelRule.labelRuleName"
              :rules="rules.labelRuleName"
            >
              <el-input
                v-model="form.customerLabelRule.labelRuleName"
                :disabled="!editable"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="rule-container">
          <el-form-item
            prop="customerLabelRule.conditionType"
            label-width="0"
            :rules="rules.conditionType"
          >
            <dict-select
              v-model="form.customerLabelRule.conditionType"
              :disabled="!editable"
              style="width: 100px; margin-top: 50px; flex-shrink: 0"
              dict="customer_label_condition_type"
            />
          </el-form-item>
          <div class="rule-list">
            <div class="rule-line">
              <div class="rule-item title">判断属性</div>
              <div class="rule-item title">判断条件</div>
              <div class="rule-item title">判断逻辑</div>
              <div v-if="editable" class="buttons" />
            </div>
            <div
              v-for="(line, index) in form.customerLabelRuleDetailList"
              :key="line.uuid"
              class="rule-line"
            >
              <div class="rule-item">
                <el-form-item
                  label-width="0"
                  :prop="`customerLabelRuleDetailList[${index}].propertyId`"
                  :rules="rules.propertyId"
                >
                  <el-popover
                    v-model="line.__show"
                    :disabled="!editable"
                    placement="right"
                    width="500"
                    trigger="click"
                  >
                    <div>
                      <el-select
                        filterable
                        style="width: 100%"
                        :value="line.propertyId"
                        placeholder="输入关键字以搜索"
                        @change="(propertyId) => setLabelItem(line, propertyId)"
                      >
                        <el-option
                          v-for="item in allLabelProperty"
                          :key="item.propertyId"
                          :value="item.propertyId"
                          :label="item.propertyName"
                        />
                      </el-select>
                      <div class="group-list">
                        <div
                          v-for="(group, key) in listLabelProperty"
                          :key="key"
                          class="group-item"
                        >
                          <div class="group-title">
                            {{
                              selectDictLabel(customer_label_business_type, key)
                            }}
                          </div>
                          <div class="group-item-list">
                            <div
                              v-for="item in group"
                              :key="item.propertyId"
                              class="group-item-item"
                              :class="{
                                active: item.propertyId === line.propertyId,
                              }"
                              @click="setLabelItem(line, item.propertyId)"
                            >
                              {{ item.propertyName }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <el-select
                      slot="reference"
                      :value="line.propertyId"
                      disabled
                      :class="{ 'disabled-select': editable }"
                    >
                      <el-option
                        v-for="item in allLabelProperty"
                        :key="item.propertyId"
                        :value="item.propertyId"
                        :label="item.propertyName"
                      />
                    </el-select>
                  </el-popover>
                </el-form-item>
              </div>
              <div class="rule-item">
                <el-form-item
                  label-width="0"
                  :prop="`customerLabelRuleDetailList[${index}].conditionId`"
                  :rules="rules.conditionId"
                >
                  <ConditionSelect
                    v-model="line.conditionId"
                    :disabled="!editable"
                    :condition-code.sync="line.conditionCode"
                    :property="getProperty(line.propertyId)"
                  />
                </el-form-item>
              </div>
              <div
                v-if="!unNeedValue(line.propertyId, line.conditionCode)"
                class="rule-item"
              >
                <el-form-item
                  label-width="0"
                  :prop="`customerLabelRuleDetailList[${index}].propertyValue`"
                  :rules="getFieldValueValidator(getProperty(line.propertyId))"
                >
                  <div style="display: flex">
                    <ConditionField
                      v-model="line.propertyValue"
                      :disabled="!editable"
                      :property="getProperty(line.propertyId)"
                      :condition="line.conditionCode"
                    />
                    <el-tooltip
                      v-if="showToolTip(line)"
                      :content="getToolTip(line.conditionCode)"
                      effect="dark"
                      placement="top-end"
                    >
                      <i class="el-icon-warning-outline" />
                    </el-tooltip>
                  </div>
                </el-form-item>
              </div>
              <div v-else class="empty rule-item">/</div>
              <el-form-item v-if="editable" class="buttons" label-width="0">
                <el-button
                  circle
                  type="danger"
                  :disabled="form.customerLabelRuleDetailList.length <= 1"
                  icon="el-icon-delete"
                  @click="removeLine(line)"
                />
              </el-form-item>
            </div>
          </div>
        </el-row>
        <el-row>
          <div style="margin: 10px 0; text-align: right">
            <el-button
              icon="el-icon-search"
              @click="previewVipList"
            >预览筛选会员</el-button>
            <el-button
              v-if="editable"
              type="primary"
              icon="el-icon-plus"
              @click="addLine"
            >添加条件</el-button>
          </div>
          <pro-table
            ref="vipListTable"
            :params="formatSendDetail(form)"
            title=""
            :init-when-mounted="false"
            api="/customer/wide/customerList"
            method="post"
            show-order
            :columns="{
              nickname: '会员名称',
              levelName: '会员等级',
              consumeAmountTotal: {
                label: '消费总金额',
                formatter: (value) => toDecimal2(+value / 100),
              },
              consumeTimesTotal: '购买订单总数',
              customerLabelRelationList: {
                label: '客群标签',
                component: LabelRender,
              },
              createTime: '注册时间',
              updateBy: '最后编辑人',
            }"
          />
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="editable"
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
  createLabelRule,
  listLabelRule,
  listLabelDropdownList,
  listLabelPropertyList,
  removeLabelRule,
  detailLabelRule,
  disabledRuleId,
  enabledRuleId
} from '@/api/customer/label'
import DictSelect from '@/components/DictSelect.vue'
import ConditionSelect from './components/ConditionSelect.vue'
import ConditionField from './components/ConditionField'
import ProTable from '@/components/ProTable.vue'
import LabelRender from './components/LabelRender.vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

/* eslint-disable vue/one-component-per-file */
export default {
  name: 'Label',
  components: { DictSelect, ConditionSelect, ConditionField, ProTable },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      LabelRender,
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
      listLabel: [],
      conditionList: [],
      listLabelProperty: [],
      customer_label_status: [],
      customer_label_rule_flag: [],
      customer_label_business_type: [],
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
      // 是否可编辑
      editable: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        labelRuleName: null,
        labelStatus: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        labelRuleName: [
          { required: true, message: '标签规则名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur'
          }
        ],
        labelId: [{ required: true, message: '标签不能为空' }],
        conditionType: [{ required: true, message: '条件类型不能为空' }],
        propertyId: [{ required: true, message: '判断属性不能为空' }],
        conditionId: [{ required: true, message: '判断条件不能为空' }]
      }
    }
  },
  computed: {
    allLabelProperty() {
      const ret = []
      Object.values(this.listLabelProperty).forEach((i) => {
        ret.push(...i)
      })
      return ret
    }
  },
  created() {
    this.queryLabelDropdown()
    this.getList()
  },
  methods: {
    uuid() {
      var s = []
      var hexDigits = '0123456789abcdef'
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-'
      var uuid = s.join('')
      return uuid
    },
    getFieldValueValidator(property) {
      return [
        { required: true, message: '判断逻辑不能为空' },
        {
          validator: (rule, value, callback) => {
            if (property.callType === 'amount') {
              if (
                !value
                  .toString()
                  .split(',')
                  .every((i) => /^\d+(.\d{1,2})?$/.test(i))
              ) {
                callback('请输入正确的金额，最多保留两位小数！')
                return
              }
            }
            callback()
          }
        }
      ]
    },
    previewVipList() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$refs.vipListTable.refresh()
        }
      })
    },
    resetForm() {
      this.form = {}
    },
    /**
     * 不需要值的情况
     * 1. 如果类型等于date，但判断条件不等于 区间
     * 2. 如果类型为string, 并且类型为 有值和无值
     */
    unNeedValue(propertyId, conditionCode) {
      const property = this.getProperty(propertyId)
      if (!property || !conditionCode) return true
      return (
        (property.propertyType === 'date' && conditionCode !== 'BETWEEN') ||
        (property.propertyType === 'string' &&
          ['IS_NULL', 'NOT_NULL'].includes(conditionCode))
      )
    },
    setLabelTypeId(labelId) {
      const current = this.listLabel.find((i) => i.labelId === labelId)
      if (current) {
        this.form.customerLabelRule.labelTypeId = current.labelTypeId
      } else {
        this.form.customerLabelRule.labelTypeId = undefined
      }
    },
    getCondition(conditionId) {
      return this.conditionList.find((i) => i.conditionId === conditionId)
    },
    getProperty(propertyId) {
      return this.allLabelProperty.find((i) => i.propertyId === propertyId)
    },
    setLabelItem(line, propertyId) {
      const index = this.form.customerLabelRuleDetailList.indexOf(line)
      this.$set(this.form.customerLabelRuleDetailList, index, {
        ...line,
        __show: false,
        propertyId
      })
    },
    addLine() {
      this.form.customerLabelRuleDetailList.push({
        uuid: this.uuid()
      })
    },
    removeLine(currentItem) {
      this.$confirm('是否确认删除此行规则？', '警告').then((res) => {
        this.form.customerLabelRuleDetailList =
          this.form.customerLabelRuleDetailList.filter(
            (item) => item !== currentItem
          )
      })
    },
    queryLabelDropdown() {
      listLabelDropdownList({ labelStatus: 1 }).then((res) => {
        this.listLabel = res.data
      })
      listLabelPropertyList().then((res) => {
        this.listLabelProperty = res.data
      })
      this.getDicts('customer_label_business_type').then((res) => {
        this.customer_label_business_type = res.data
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
      listLabelRule({
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
        labelRuleName: null,
        labelStatus: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /**
     * 当是字符串类型，且值为 在什么之间，或不在什么之前的时候显示这个提示
     */
    showToolTip(line) {
      const property = this.getProperty(line.propertyId)
      return ['IN', 'NOT_IN'].includes(line.conditionCode) && property.propertyType === 'string'
    },
    getToolTip(conditionCode) {
      switch (conditionCode) {
        case 'IN':
          return '精确判断，当判断值存在多个时，实体或事件属性值等于任意一个，该实体或事件都会进入分析的数据集。例：“会员编号” "在...之间" "41068，41021，14258"'
        case 'NOT_IN':
          return '精确判断，当判断值存在多个时，实体或事件属性值等于任意一个，该实体或事件就不会进入分析的数据集。例：“手机号”“不在...之间”“185,153”'
      }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {}
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.labelRuleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.labelList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加标签规则'
      this.editable = true
      this.form = {
        customerLabelRule: {},
        customerLabelRuleDetailList: [{}]
      }
    },
    queryUser() {
      if (this.form.customerLabelRule.labelRuleId) {
        this.$nextTick(() => {
          this.$refs.vipListTable?.refresh()
        })
      }
    },
    formatSendDetail({ customerLabelRule, customerLabelRuleDetailList }) {
      return {
        customerLabelRule: customerLabelRule,
        customerLabelRuleDetailList: customerLabelRuleDetailList.map(
          ({ __show, ...i }) => {
            const property = this.getProperty(i.propertyId) || {}
            return {
              ...i,
              propertyValue:
                property.callType === 'amount'
                  ? i.propertyValue
                    ?.toString()
                    ?.split(',')
                    ?.map((i) => i * 100)
                    ?.join(',')
                  : i.propertyValue
            }
          }
        )
      }
    },
    formatDetail({ customerLabelRule, customerLabelRuleDetailList }) {
      const {
        labelRuleId,
        labelRuleName,
        labelTypeId,
        labelId,
        ruleStatus,
        conditionType
      } = customerLabelRule
      return {
        customerLabelRuleDetailList: customerLabelRuleDetailList.map((i) => {
          const property = this.getProperty(i.propertyId) || {}
          return {
            uuid: this.uuid(),
            ruleDetailId: i.ruleDetailId,
            labelRuleId: i.labelRuleId,
            propertyId: i.propertyId,
            conditionId: i.conditionId,
            propertyValue:
              property.callType === 'amount'
                ? i.propertyValue
                  .toString()
                  .split(',')
                  .map((i) => i / 100)
                  .join(',')
                : i.propertyValue
          }
        }),
        customerLabelRule: {
          labelRuleId,
          labelRuleName,
          labelTypeId,
          labelId,
          ruleStatus,
          conditionType
        }
      }
    },
    /** 查看详情 */
    handlePreview(row) {
      this.reset()
      detailLabelRule(row.labelRuleId).then((response) => {
        this.form = this.formatDetail(response.data)
        this.open = true
        this.editable = false
        this.title = '标签规则详情'
      })
    },
    // 修改状态
    disabled(row) {
      this.$confirm(`是否确认失效"${row.labelRuleName}"客户标签规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => disabledRuleId(row.labelRuleId))
        .then(() => {
          this.msgSuccess(`禁用客户标签规则成功`)
          this.getList()
        })
    },
    // 修改状态
    enabled(row) {
      this.$confirm(`是否确认启用"${row.labelRuleName}"客户标签规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => enabledRuleId(row.labelRuleId))
        .then(() => {
          this.msgSuccess(`启用客户标签规则成功`)
          this.getList()
        })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      detailLabelRule(row.labelRuleId).then((response) => {
        this.form = this.formatDetail(response.data)
        this.open = true
        this.editable = true
        this.title = '修改标签规则'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        const form = this.formatSendDetail(this.form)
        if (!form.customerLabelRuleDetailList?.length) {
          this.$message('请至少配置一条判断条件')
          return
        }

        if (valid) {
          this.$confirm(
            `是否确认${
              this.form.customerLabelRule.labelRuleId ? '修改' : '新增'
            }标签规则?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => createLabelRule(form))
            .then(() => {
              this.msgSuccess(
                `${form.customerLabelRule.labelRuleId ? '修改' : '新增'}成功`
              )
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const labelIds = row.labelRuleId || this.ids
      this.$confirm(
        `是否确认${
          typeof labelIds === 'object'
            ? '批量删除'
            : '删除"' + row.labelRuleName + '"'
        }标签规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return removeLabelRule(labelIds)
        })
        .then(() => {
          this.getList()
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
.disabled-select {
  .el-input__inner {
    background-color: unset !important;
    cursor: pointer !important;
  }
  .el-select__caret {
    cursor: pointer !important;
  }
}
</style>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";
.rule-container {
  display: flex;
  align-items: center;
  padding: 0 10px 10px;
  border: 1px solid #e1e1e1;
  .rule-list {
    flex: 1;
  }
  .el-icon-warning-outline {
    font-size: 22px;
    line-height: 36px;
    margin-left: 10px;
    margin-right: 10px;
  }
  .rule-line {
    display: flex;
    .buttons {
      width: 40px;
      text-align: right;
    }
    .rule-item {
      padding: 0 20px;
      .el-form-item {
        margin-bottom: 10px;
      }
      &.empty {
        text-align: center;
        line-height: 36px;
      }
      &:nth-child(1) {
        width: 200px;
      }
      &:nth-child(2) {
        width: 180px;
      }
      &:nth-child(3) {
        flex: 1;
        padding-right: 0;
        > div {
          width: 100%;
        }
      }
      &.title {
        line-height: 30px;
        height: 30px;
        margin: 10px 0;
        text-align: center;
        font-weight: 700;
      }
    }
  }
}
.group-list {
  .group-item {
    .group-title {
      font-weight: 700;
      padding: 10px 0;
    }
    .group-item-list {
      display: grid;
      padding: 10px 20px;
      grid-template-columns: repeat(3, 33.33%);
      grid-auto-rows: 40px;
      background: #f1f1f1;
      border-radius: 4px;
      .group-item-item {
        line-height: 30px;
        text-align: center;
        transition: background 0.3s;
        cursor: pointer;
        margin: 5px 10px;
        border-radius: 2px;
        &:hover {
          background: rgba($primary, 0.3);
        }
        &.active {
          background: $primary !important;
          color: #fff;
        }
      }
    }
  }
}
</style>
