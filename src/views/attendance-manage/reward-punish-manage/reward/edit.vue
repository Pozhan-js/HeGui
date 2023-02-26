<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :disabled="disabled"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="名称" prop="ruleName">
        <el-input
          v-model="form.ruleName"
          :disabled="disabled"
          style="width: 30%"
          placeholder="请输入名称"
          clearable
          size="small"
        />
      </el-form-item>
      
      <el-form-item label="时间" prop="beginTime">
        <range-picker 
          clearable
          size="small"
          :disabled="disabled"
          :s-time.sync="form.beginTime"
          :e-time.sync="form.endTime"/>
      </el-form-item>

      <el-form-item label="质保金月份数" prop="guaranteeMonth">
        <el-input-number 
          size="small"
          :min="1"
          style="width: 30%"
          :disabled="disabled"
          v-model="form.guaranteeMonth"
        /> 个自然月
      </el-form-item>

      <el-form-item>
        <el-button
          v-if="!awardRuleForm.attendanceAwardId && routerType != 'check'"
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >保存，下一步</el-button>
      </el-form-item>
    </el-form>
    <!-- 规则列表展示 -->
    <el-form v-if="awardRuleForm.attendanceAwardId" label-width="120px">
      <fieldset class="fieldset " v-for="(ruleType, index) in rulesList" :key="`ruleType${index}`">
        <legend>{{ruleType.title}}</legend>
        <el-button :disabled="disabled" class="mb10" type="primary" size="mini" @click="handleAddRule(ruleType.type)">添加规则</el-button>
        <div class="rule-list">
          <div v-for="(rule, i) in ruleType.list" :key="`${ruleType.type}${i}`">
            {{i+1}}、 {{rule.desc}}
            <el-button :disabled="disabled"  type="text" @click="handupdateRule(rule)">修改 </el-button>
            <el-button :disabled="disabled"  type="text" size="mini" @click="handleDeleteRule(rule.targetId)">删除</el-button>
          </div>
        </div>
      </fieldset>
    </el-form>

    <!-- 添加规则 -->
    <el-dialog :visible.sync="open" title="添加规则" width="80%" @closed="resetAwardRuleForm">
      <el-form
        ref="awardRuleForm"
        :model="awardRuleForm"
        label-width="0"
        :rules="rules">
      <div class="dialog-content">
        <el-table :data="awardRuleForm.targetPropertiesList" border>
          <el-table-column align="center" label="序号" type="index" width="50" />
          <el-table-column align="center" label="条件关系" width="100" prop="conditionType" />
          <el-table-column min-width="120" align="center" label="判断属性" prop="propertyValue">
            <template slot-scope="{row, $index}">
              <el-form-item :prop="'targetPropertiesList['+ $index + '].propertyValue'" :rules="rules.propertyValue">
                <el-popover
                  v-model="row.__show"
                  :disabled = "$index == 0"
                  placement="right"
                  width="500"
                  trigger="click"
                >
                  <div>
                    <el-select
                      filterable
                      style="width: 100%"
                      v-model="propertyValue"
                      placeholder="输入关键字以搜索"
                      @change="(propertyValue) => setLabelItem(row, propertyValue)"
                    >
                      <el-option
                        v-for="item in allLabelProperty"
                        :key="item.code"
                        v-model="item.code"
                        :label="item.name"
                      />
                    </el-select>
                    <div class="group-list">
                      <div
                        v-for="(item, index) in listLabelProperty"
                        :key="index"
                        class="group-item"
                      >
                        <div class="group-title"> {{ item.type }}</div>
                        <div class="group-item-list">
                          <div
                            v-for="property in item.propertiesDTOList"
                            :key="property.code"
                            class="group-item-item"
                            :class="{
                              active: property.code === row.propertyValue,
                            }"
                            @click="setLabelItem(row, property.code)"
                          > {{ property.name }} 
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-select
                    slot="reference"
                    v-model="row.propertyValue"
                    disabled
                    :class="{ 'disabled-select': !disabled }"
                  >
                    <el-option
                      v-for="item in allLabelProperty"
                      :key="item.code"
                      :value="item.code"
                      :label="item.name"
                    />
                  </el-select>
                </el-popover>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column min-width="100" align="center" label="子项" >
            <template slot-scope="{row}">
              <span v-if="!row.property || !row.property.propertiesDTOList">——</span>
              <template v-else>
                <el-form-item v-for="(item, index) in row.property.propertiesDTOList" :key="row.uuid+index">
                  <el-input type="text" :value="item.name" readonly/>
                </el-form-item>
              </template>
            </template>
          </el-table-column>
          <el-table-column min-width="120" align="center" label="判断条件" prop="conditional">
            <template slot-scope="{row, $index}">
              <span v-if="!row.property || !row.propertyValue">——</span>
              <template v-else-if="row.subPropertiesList" >
                <template v-for="(item, index) in row.property.conditionList" >
                  <el-form-item
                    :key="index" 
                    :prop="'targetPropertiesList['+ $index + '].subPropertiesList['+ index + '].conditionValue'" 
                    :rules="rules.conditionValue">
                      <el-select v-model="row.subPropertiesList[index].conditionValue" placeholder="请选择"> 
                        <el-option
                          v-for="dict in item"
                          :key="dict.code"
                          :label="dict.name"
                          :value="dict.code">
                        </el-option>
                      </el-select>
                  </el-form-item>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column min-width="200" align="center" label="判断逻辑">
            <template slot-scope="{row, $index}">
              <span v-if="!row.property || !row.propertyValue">——</span>
              <template v-else-if="row.subPropertiesList" >
                <template v-for="(item, index) in row.property.conditionList" >
                  <span v-if="!row.subPropertiesList[index].conditionValue" :key="row.uuid+index">——</span>
                  <el-form-item 
                    v-else
                    :key="row.uuid+index"
                    :prop="'targetPropertiesList['+ $index + '].subPropertiesList['+ index + '].logicValue'" 
                    :rules="rules.logicValue"
                  >
                    <ConditionField
                      v-model="row.subPropertiesList[index].logicValue"
                      :disabled="disabled"
                      :property="row.property"
                      :condition="row.subPropertiesList[index].conditionValue"
                    />
                  </el-form-item>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column min-width="120" align="center" label="单位" prop="unit">
            <template slot-scope="{row, $index}">
              <span v-if="!row.property || !row.propertyValue">——</span>
              <template v-else-if="row.subPropertiesList" >
                <template v-for="(item, index) in row.property.conditionList">
                  <span v-if="!row.subPropertiesList[index].unitOptions || !row.subPropertiesList[index].unitOptions.length" :key="row.uuid+index">——</span>
                  <el-form-item 
                    v-else
                    :prop="'targetPropertiesList['+ $index + '].subPropertiesList['+ index + '].unitValue'" 
                    :key="row.uuid+index"
                    :rules="rules.unitValue"
                    >
                    <el-select v-model="row.subPropertiesList[index].unitValue" placeholder="请选择"> 
                      <el-option
                        v-for="dict in row.subPropertiesList[index].unitOptions"
                        :key="dict.code"
                        :label="dict.name"
                        :value="dict.code">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" prop="action" width="60">
            <template slot-scope="{row, $index}" >
              <i v-if="$index" class="el-icon-delete" @click="handleDeleteRow(row, $index)" ></i> 
            </template>
          </el-table-column>
        </el-table>
        <div class="mt10 award-amount">
          <span>奖励<el-input-number v-model="awardRuleForm.awardAmount" />元</span>
          <el-button type="primary" size="mini" icon="el-icon-add" @click="handleAddContional">添加条件</el-button>
        </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitRulesForm" >确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addAttendanceAwardRule, getAttendanceAwardRule, getPropertiesList, addAwardRule, getAwardRuleList, delAwardRule, getUnitList, getAwardRule, updateAwardRule} from '@/api/attendance/reward'
import { flatten, searchSuperior } from '@/utils/array'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import DictSelect from '@/components/DictSelect.vue'
import RangePicker from '@/components/RangePicker.vue'
import ConditionField from './components/ConditionField'


export default {
  components: {
    DictSelect,
    RangePicker,
    ConditionField,
    Cascader,
  },
  data() {
    return {
      loading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 是否禁用
      disabled: this.$route.query.type === 'check',
      // 组织
      orgOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织不能为空', trigger: 'change' }
        ],
        ruleName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 15, message: '名称不能超过15个字符', trigger: 'blur' }
        ],
        beginTime:[{ required: true, message: '请选择有效期', trigger: 'blur' }],
        guaranteeMonth:[{ required: true, message: '请输入质保金月份数', trigger: 'blur' }],
        propertyValue: [{ required: true, message: '判断属性不能为空', trigger: 'change' }],
        conditionValue: [{ required: true, message: '判断条件不能为空', trigger: 'change' }],
        logicValue: [{ required: true, message: '判断逻辑不能为空', trigger: 'change' }],
        unitValue: [{ required: true, message: '单位不能为空', trigger: 'change' }],
      },
      // 规则弹框
      open: false,
      // 规则参数
      awardRuleForm: {
        targetType: '',
        awardAmount: '',
        targetPropertiesList: []
      },
      
      // 分组属性列表
      listLabelProperty: [],
      //属性值
      propertyValue: '',
      // 奖励规则列表
      awardRuleList: [],

      // 修改规则标识
      isUpdateRule: false

    }
  },
  
  mounted() {
    // 查询组织
    if (this.$route.query.type !== 'add') this.loading = true
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      if (this.$route.query.type !== 'add') {
        this.handleInfo(this.$route.query.attendanceAwardId)
      }
    })
    this.getDicts('finance_award_user').then((response) => {
      this.awardUserOptions = response.data
    })
  },
  watch: {
    'awardRuleForm.targetType'(val, oldVal) {
      if(val && val != oldVal && !this.awardRuleForm.targetId) this.getPropertiesList(val) // 判断属性列表
    }
  },
  computed: {
    // 所有属性列表
    allLabelProperty() {
      const ret = []
      this.listLabelProperty.forEach((i) => {
        const propertiesDTOList = i?.propertiesDTOList.map(item=>{
          const obj = { ...item, conditionList:  item.conditionDTOList ? [item.conditionDTOList] : (item.propertiesDTOList?.map(item=> item.conditionDTOList) ?? [])  }
          // 新增规则，默认第一条规则为工作天数
          if(item.code == 'workDay' && !this.isUpdateRule && this.awardRuleForm.targetPropertiesList.length == 1)  {
            this.setRow(this.awardRuleForm.targetPropertiesList[0], obj, 'workDay')
          }
          return obj
        })
        ret.push(...propertiesDTOList)
      })
      return ret
    },
    // 规则列表
    rulesList() {
      return ['day', 'month', 'full_time'].map(type=>{
        const map = new Map([['day', '日奖励'], ['month', '月奖励'], ['full_time', '专职月度奖励']])
        const title = map.get(type)
        let list = this.awardRuleList ? this.formatRuleDesc(this.awardRuleList.filter(item=>item.targetType == type)) : []
        return { type, title, list}
      })
    },
    // 奖励规则参数
    awardRuleQuery() {
      const targetPropertiesList = this.awardRuleForm?.targetPropertiesList.map(item=>{
        const subPropertiesList = item?.subPropertiesList.map((i,ind)=>{
          return {
            propertiesId: i.propertiesId,
            subPropertiesId: i.subPropertiesId,
            logicValue: i.logicValue,
            conditionValue: i.conditionValue,
            propertyValue: item.property.propertiesDTOList ? item.property.propertiesDTOList[ind].code : i.propertyValue,
            unitValue: i.unitValue
          }
        })
        return {
          propertyValue: item.propertyValue,
          subPropertiesList
        }
      })
      return { 
        ...this.awardRuleForm,
        targetPropertiesList
      }
    }
  },
  methods: {
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
        return v.toString(16)
      })
    },
    // 格式化文字拼接
    formatRuleDesc(rule) {
      return rule.map(item=>{
        let ret = []
        item?.targetPropertiesList.forEach((i, index)=>{
          let text = ''
          if(index == 0) {
            text = `当${i.propertyName}满足`
          } else {
            text = `且${i.propertyName}满足`
          }
          if(i.subPropertiesList) {
            const len = i.subPropertiesList.length
            if(len > 1)  {
              ret.push(`${text}(`)
              text = ''
            }
            i.subPropertiesList.forEach((s, index) =>{
              const {conditionValue, propertyName, logicName, logicValue, unitName, unitValue } = s
              if(len > 1) text+=propertyName?? ''
              if(conditionValue == 'BETWEEN') {
                let loginValueArr = logicValue.split(',')
                let unitStr = unitValue == 'percentage' ? '%' : (unitName ?? '')
                text += `${loginValueArr[0]}到${loginValueArr[1]}${unitStr}`
              } else {
                text += (logicName || logicValue) + (unitName ?? '')
              }
              ret.push(text)
              text = ''
            })
            if(len > 1) ret.push(')')
          }
        })
        const awardText= item.targetType == 'day' ? `奖励${item.awardAmount}元/日` : item.targetType=='month' ?  `奖励${item.awardAmount}元/月` : `月度奖励${item.awardAmount}元`
        ret.push(awardText)
        const desc = ret.join(', ').replace(/\(\,\s*/g, '(').replace(/\,\s*\)/g, ')')
        return { ...item, desc}
      })
    },
    // 属性列表
    getPropertiesList(targetType) {
      getPropertiesList(targetType).then((res) => { 
        this.listLabelProperty = res.rows
      })
    },
    // 选中属性项
    getProperty(code) {
      return this.allLabelProperty.find((i) => i.code === code)
    },
    // 选择属性
    setLabelItem(row, code) {
      const property = this.getProperty(code)
      this.$set(row, '__show', false)
      this.setRow(row, property, code)
    },
    
    setRow(row, property, code) {
      this.$set(row, 'propertyValue', code)
      this.$set(row, 'property', property)
      const subPropertiesList = property.conditionList.map(item=> {
        return {
          conditonCode: undefined,
          conditionValue: undefined,
          propertyValue: code,
          logicValue: undefined,
          unitValue: undefined,
          unitOptions: undefined
        } 
      })
      this.$set(row, 'subPropertiesList', subPropertiesList)
      this.getUnitList(code, row)
    },
    // 规则单位
    getUnitList(propertiesCode, row) {
       getUnitList({propertiesCode, ruleType: this.awardRuleForm.targetType}).then(res=>{
          this.$set(row, 'subPropertiesList', row.subPropertiesList.map(item=> ({ ...item, unitOptions: res.rows })))
       })
    },
    // 查询详情
    handleInfo(attendanceAwardId) {
      getAttendanceAwardRule(attendanceAwardId).then(res => {
        const {attendanceAwardId, beginTime, endTime, ruleName, guaranteeMonth} = res.data
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          attendanceAwardId, beginTime, endTime, orgId, ruleName, guaranteeMonth
        }
        this.loading = false
      })
      if(this.disabled) {
        this.$set(this.awardRuleForm, 'attendanceAwardId', attendanceAwardId)
        this.getAwardRuleList(attendanceAwardId)
      }
    },
    // 重置规则表单
    resetAwardRuleForm() {
      this.awardRuleForm =  {
        attendanceAwardId: this.awardRuleForm.attendanceAwardId,
        targetType: '',
        awardAmount: '',
        targetPropertiesList: []
      }
      this.resetForm('awardRuleForm')
    },
    // 获取规则列表
    getAwardRuleList(attendanceAwardId) {
      getAwardRuleList({attendanceAwardId}).then(res=>{
        this.awardRuleList = res.rows ? res.rows.map(item=>({...item, awardAmount: this.toDecimal2(item.awardAmount / 100)})) : []
      })
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1)
    },
    // 添加奖励规则
    handleAddRule(type) {
      this.open = true
      this.isUpdateRule = false
      this.$set(this.awardRuleForm, 'targetType', type)
      this.awardRuleForm.targetPropertiesList.push({
        uuid: this.guid(),
        conditionType: '当',
      })
    },
    // 添加奖励条件   
    handleAddContional() {
      this.awardRuleForm.targetPropertiesList.push({
        uuid: this.guid(),
        conditionType: this.awardRuleForm.targetPropertiesList.length ? '且' : '当',
        property: null, //判断属性
      })
    },
    // 移除规则
    handleDeleteRow(row, $index){
      this.awardRuleForm.targetPropertiesList.splice($index, 1)
    },
    // 删除规则
    handleDeleteRule(targetId){
      this.$confirm(`是否删除该条规则?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        return delAwardRule(targetId);
      })
      .then(() => {
        this.getAwardRuleList(this.awardRuleForm.attendanceAwardId);
        this.msgSuccess("删除成功");
      });
    },
    // 修改规则
    async handupdateRule({targetId, targetType}) {
      await this.getPropertiesList(targetType)
      this.isUpdateRule = true
      getAwardRule(targetId).then(res=>{
        this.awardRuleForm = res.data
        this.awardRuleForm.awardAmount = this.toDecimal2(res.data.awardAmount / 100)
        this.awardRuleForm.targetPropertiesList.forEach(async (item, index)=>{
          item.uuid = this.guid()
          item.property = this.getProperty(item.propertyValue) 
          item.conditionType = index == 0 ? '当' : '且'
          this.getUnitList(item.propertyValue, item)
        })
        this.open = true
      })
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          addAttendanceAwardRule({...this.form, orgId: this.form.orgId
                ? typeof this.form.orgId === 'object'
                  ? this.form.orgId.slice(-1)[0]
                  : this.form.orgId
                : null}).then(res=>{
            this.$set(this.awardRuleForm, 'attendanceAwardId', res.data)
            this.getAwardRuleList(res.data)
          })
        }
      })
    },

    /** 提交按钮 */
    submitRulesForm() {
      if(this.awardRuleForm.targetPropertiesList.length == 0) return this.$message.error('新增规则不能为空')
      this.$refs['awardRuleForm'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${
              this.awardRuleForm.targetId ? '修改' : '新增'
            }奖励规则?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              const query = {...this.awardRuleQuery, awardAmount: this.awardRuleQuery.awardAmount * 100}
              return this.awardRuleForm.targetId ? updateAwardRule(query) : addAwardRule(query)
            })
            .then(() => {
              this.msgSuccess(
                `${this.$route.query.attendanceAwardId ? '修改' : '新增'}成功`
              )
              this.open = false
              this.getAwardRuleList(this.awardRuleQuery.attendanceAwardId)
            })
        }
      })
    },
  }
}
</script>
<style scoped lang="scss">
@import "~@/assets/styles/variables.scss";
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}

.award-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/ .el-input-number {
    width: 100px !important;
    .el-input__inner {
      padding: 0px;
      border-style: none;
      border-bottom: 1px solid;
      border-radius: 0px;
    }
  }
}


fieldset {
  border: 1px solid;
  padding: 20px;
  margin: 0 20px 20px;
  max-height: 400px;
  overflow-y:auto;
  legend {
    display: inline-block;
    padding: 0 10px;
    width: auto;
  }
}
.dialog-content {
  padding: 10px;
  border: 1px solid #ddd; 
  /deep/ .el-form-item{
    margin: 20px 0;
    +.el-form-item{
      margin-top: 10px;
    }
  } 
  /deep/ .el-table tr.el-table__row,
  /deep/ .el-table__header-wrapper th {
    background: #fff !important
  }

  /deep/ .el-input-number__decrease {
    display: none;
  }
  /deep/ .el-input-number__increase {
    display: none;
  }

}

.disabled-select {
  .el-input__inner {
    background-color: unset !important;
    cursor: pointer !important;
  }
  .el-select__caret {
    cursor: pointer !important;
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
