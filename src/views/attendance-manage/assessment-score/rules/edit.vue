<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form ref="form" :model="form" :rules="rules" :disabled="disabled" label-width="120px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :disabled="disabled"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="handleOrgChange"
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

      <el-form-item label="所属分组" prop="distributionGroupId">
        <el-select
          v-model="form.distributionGroupId"
          placeholder="请选择所属分组"
          clearable
          size="small"
          style="width: 300px"
        >
          <el-option
            v-for="group in groupOptions"
            :key="group.id"
            :label="group.name"
            :value="group.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="时间" prop="beginTime">
        <range-picker 
          clearable
          size="small"
          :disabled="disabled"
          :s-time.sync="form.beginTime"
          :e-time.sync="form.endTime"/>
      </el-form-item>

    <!-- 规则列表展示 -->
      <fieldset class="fieldset ">
        <legend>评分规则</legend>
        <el-button class="mb20" type="primary" size="mini" @click="handleAdd">添加规则</el-button>
        <div class="rule-list" v-for="(data, key) in form.examineGradeRuleDetailMap" :key="key">
          <el-table
            :data="data"
            border
            :span-method="objectSpanMethod"
            style="width: 100%; margin-bottom: 60px; width: 80%"
            >
            <el-table-column
              prop="id"
              label="评分对象"
              align="center"
              min-width="100"
              :formatter="gradeRoleFormat">
            </el-table-column>
            <el-table-column
              prop="gradeTarget"
              label="评分指标"
              align="center"
              min-width="100"
              :formatter="gradeTargetFormat">
            </el-table-column>
            <el-table-column
              prop="gradeType"
              label="评分方式"
              align="center"
              min-width="100"
              :formatter="gradeTypeFormat">
            </el-table-column>
            <el-table-column
              prop="scoreNum"
              align="center"
              min-width="100"
              label="分值" />
            <el-table-column
              prop="logic"
              align="center"
              min-width="200"
              label="评分逻辑">
              <template v-slot="{row}">
                <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                <span v-else>满分标准：{{row.fullScoreNum}}%, 每{{row.conditionId == 'up' ? '提高' : '降低'}}{{row.conditionVal}}%, {{row.conditionId == 'up' ? '加' : '扣'}}{{ Math.abs(row.addReduceScore)}}分</span>
              </template>
            </el-table-column>
              
            <el-table-column
              label="操作"
              align="center"
              min-width="160"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{row, $index}">
                <el-button
                  v-hasPermi="['distribution:examineGradeRule:edit']"
                  size="mini"
                  type="text"
                  @click="handleUpdate(row)"
                >
                  修改
                </el-button>
                <el-button
                  v-if="routerType != 'add'"
                  v-hasPermi="['distribution:examineGradeRuleDetail:remove']"
                  size="mini"
                  type="text"
                  @click="handleDelete(row, $index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </fieldset>
    </el-form>
    <div class="text-center">
      <el-button v-if="routerType != 'check'" type="primary" @click="submitForm" :loading="this.$store.state.isLoading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <el-dialog :visible.sync="open" :title="title" width="80%">
      <el-form
        ref="grandRuleForm"
        :model="grandRuleForm"
        label-width="0"
        :rules ="grandeRules"
        inline
      >
        <el-form-item label="评分对象" prop="gradeRole" label-width="120">
          <DictSelect :disabled="grandRuleForm.isUpdate" v-model="grandRuleForm.gradeRole" dict="attendance_grade_role"/>
        </el-form-item>
        <el-form-item label="基准值" prop="baseScoreNum" label-width="120px">
          <el-input-number class="mr10" v-model="grandRuleForm.baseScoreNum" />分
        </el-form-item>
        <div class="dialog-content">
          <el-table :data="grandRuleForm.examineGradeRuleDetailMap[grandRuleForm.gradeRole]">
            <el-table-column label="序号" type="index" width="50" />
            <el-table-column label="指标名称" prop="gradeTarget">
              <template slot-scope="{row, $index}">
                <el-form-item :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].gradeTarget`" :rules="grandeRules.gradeTarget">
                  <el-select v-model="row.gradeTarget"  size="mini">
                    <el-option
                      v-for="i in gradeTargetOptions"
                      :key="i.dictValue"
                      :value="i.dictValue"
                      :label="i.dictLabel"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="评分方式" prop="gradeType">
              <template slot-scope="{row, $index}">
                <el-form-item :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].gradeType`" :rules="grandeRules.gradeType">
                  <el-select v-model="row.gradeType"  size="mini">
                    <el-option
                      v-for="i in gradeTypeOptions"
                      :key="i.dictValue"
                      :value="i.dictValue"
                      :label="i.dictLabel"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="分值" prop="scoreNum">
              <template slot-scope="{row, $index}">
                <el-form-item :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].scoreNum`" :rules="grandeRules.scoreNum">
                  <el-input-number size="mini" type="text" v-model="row.scoreNum" />
                </el-form-item>
              </template>.
            </el-table-column>
            <el-table-column label="满分标准" prop="fullScoreNum">
                <template slot-scope="{row, $index}">
                  <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                  <el-form-item v-else :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].fullScoreNum`" :rules="grandeRules.fullScoreNum">
                    <el-input-number size="mini" type="text" v-model="row.fullScoreNum" />
                  </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="判断逻辑" prop="conditionId">
              <template slot-scope="{row, $index}">
                <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                  <el-form-item v-else :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].conditionId`" :rules="grandeRules.conditionId">
                  <el-select v-model="row.conditionId" size="mini">
                    <el-option
                      v-for="i in conditionTypeOptions"
                      :key="i.dictValue"
                      :value="i.dictValue"
                      :label="i.dictLabel"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="值" prop="conditionVal">
              <template slot-scope="{row, $index}">
                <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                  <el-form-item v-else :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].conditionVal`" :rules="grandeRules.conditionVal">
                  <el-input-number size="mini" type="text" v-model="row.conditionVal" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单位" prop="unit">
              <template slot-scope="{row, $index}">
                <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                  <el-form-item v-else :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].unit`" :rules="grandeRules.unit">
                  <el-select v-model="row.unit" size="mini">
                    <el-option
                      v-for="i in unitOptions"
                      :key="i.dictValue"
                      :value="i.dictValue"
                      :label="i.dictLabel"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="加减分" prop="addReduceScore">
              <template slot-scope="{row, $index}">
                <span v-if="['execution', 'dynamic'].includes(row.gradeTarget)">————</span>
                  <el-form-item v-else :prop="`examineGradeRuleDetailMap[${grandRuleForm.gradeRole}][${$index}].addReduceScore`" :rules="grandeRules.addReduceScore" >
                  <el-input-number size="mini" type="text" v-model="row.addReduceScore" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" prop="action" width="60">
              <template slot-scope="{row, $index}" >
                <i class="el-icon-delete" @click="handleDeleteRow(row, $index)" ></i> 
              </template>
            </el-table-column>
          </el-table>
          <div class="mt10" style="display: flex; align-items: center; justify-content: right">
            <el-button type="primary" size="mini" icon="add" @click="handleAddContional">添加条件</el-button>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" @click="handleAddRule">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addExamineGradeRule, getExamineGradeRule} from "@/api/distribution/examineGradeRule"
import { delExamineGradeRuleDetail} from "@/api/distribution/examineGradeRuleDetail"
import { getDropDown } from '@/api/selectUtils'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import DictSelect from '@/components/DictSelect.vue'
import GroupSelect from '@/components/GroupSelect.vue'

export default {
  components: {
    Cascader,
    DictSelect,
    GroupSelect
  },
  
  data() {
    const checkGradeTarget =  (rule, value, callback) => {
      const  data = this.grandRuleForm.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole].filter(item=>item.gradeTarget === value)
      if(data.length>1) {
        return callback(new Error("不能添加重复的评分指标！"))
      } else {
        return callback()
      }
    }
    return {
      loading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 是否禁用
      disabled: this.$route.query.type === 'check',
      // 组织
      orgOptions: [],
      
      // 表单参数
      form: { 
        distributionGroupId: undefined,
        examineGradeRuleDetailMap: {}
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织不能为空', trigger: 'blur' }
        ],
        ruleName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 15, message: '名称不能超过15个字符', trigger: 'blur' }
        ],
        beginTime:[{ required: true, message: '请选择有效期', trigger: 'blur' }]
      },
      // 规则弹框
      open: false,
      // 弹框标题
      title: '',
      // 规则表单参数
      grandRuleForm: {
        examineGradeRuleDetailMap: {
          member: [],
        }
      },
      // 规则表单校验
      grandeRules: {
        gradeRole: [
          { required: true, message: '请选择评分对象', trigger: 'change' }
        ],
        baseScoreNum: [
          { required: true, message: '基准值不能为空', trigger: 'blur' }
        ],
        gradeTarget: [
          { required: true, message: '评分指标不能为空', trigger: 'change' },
          { validator: checkGradeTarget, trigger: 'change'}
        ],
        gradeType: [
          { required: true, message: '评分方式不能为空', trigger: 'blur' }
        ],
        scoreNum: [
          { required: true, message: '分值不能为空', trigger: 'blur' }
        ],
        fullScoreNum: [
          { required: true, message: '满分标准不能为空', trigger: 'blur' }
        ],
        conditionId: [
          { required: true, message: '判断逻辑不能为空', trigger: 'change' }
        ],
        conditionVal: [
          { required: true, message: '值不能为空', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '单位不能为空', trigger: 'change' }
        ],
        addReduceScore: [
          { required: true, message: '加减分不能为空', trigger: 'blur' }
        ],
      },
      // 条件关系选项
      conditionTypeOptions: [],
      queryParamsGroupIds:[],

      gradeRoleOptions: [],
      // 评分方式
      gradeTypeOptions: [],
      // 评分指标
      gradeTargetOptions: [],
      // 判断逻辑
      gradeConditionOptions: [],
      // 判断单位
      gradeUnitOptions: [],
      // 所属分组
      groupOptions: []
    }
  },

  created() {
     getDropDown('distributionGroup').then((res) => {
      this.groupOptions = res.data
    })
  },
  mounted() {
    
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
      if (this.$route.query.type !== 'add') {
        this.handleInfo(this.$route.query.examineGradeRuleId)
      }
    })
    this.getDicts('assessment_grade_target').then((response) => {
      this.gradeTargetOptions = response.data
    })
    this.getDicts('attendance_grade_type').then((response) => {
      this.gradeTypeOptions = response.data
    })
    this.getDicts('attendance_grade_role').then((response) => {
      this.gradeRoleOptions = response.data
    })
    this.getDicts('attendance_grade_condition_logic').then((response) => {
      this.conditionTypeOptions = response.data
    })
    this.getDicts('attendance_grade_unit').then((response) => {
      this.unitOptions = response.data
    })

  },
  methods: {
    // 组织切换
    handleOrgChange(val) {
      getDropDown('distributionGroup', {orgId: this.form.orgId}).then((res) => {
        this.groupOptions = res.data
        this.form.distributionGroupId = ''
      })
    },
    // 评分指标
    gradeRoleFormat(row) {
      return this.selectDictLabel( this.gradeRoleOptions, row.gradeRole )
    },
    // 评分指标
    gradeTargetFormat(row) {
      return this.selectDictLabel( this.gradeTargetOptions, row.gradeTarget )
    },
    // 评分方式 
    gradeTypeFormat(row) {
      return this.selectDictLabel( this.gradeTypeOptions, row.gradeType )
    },
    // 判断单位 
    unitFormat(row) {
      return this.selectDictLabel( this.unitOptions, row.unit )
    },
    // 判断逻辑 
    conditionIdFormat(row) {
      return this.selectDictLabel( this.conditionTypeOptions, row.uniconditionId )
    },
    // 合并行
    objectSpanMethod({ rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return rowIndex=== 0 ? [999, 1] : [1, 0]
      }
    },
    // 处理数值 新增修改要 * 100    ，详情列表要 100
    formatValues(obj, operator) {
      // 需要处理的数据字段 
      const values = ['baseScoreNum', 'addReduceScore', 'conditionVal', 'fullScoreNum', 'scoreNum']
      for(const [key, value] of Object.entries(obj)){
        obj[key] = value.map(item => {
          for(const key in item) {
            if(values.includes(key)) item[key] = operator == '/' ? item[key] / 100 : item[key] * 100
          }
          return item
        })
      }
    },
    // 查询详情
    handleInfo(examineGradeRuleId) {
      getExamineGradeRule(examineGradeRuleId).then(res => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.formatValues(res.data.examineGradeRuleDetailMap, '/')
        const distributionGroupId =  res.data.distributionGroupId == 0 ? '' :  res.data.distributionGroupId
        this.form = {...res.data, orgId, distributionGroupId}
        this.loading = false
      })
    },
    
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          const query = {
            ...this.form,
            orgId: this.form.orgId
                ? typeof this.form.orgId === 'object'
                  ? this.form.orgId.slice(-1)[0]
                  : this.form.orgId
                : null,
          }

          this.$confirm(
            `是否确认${
              this.form.examineGradeRuleId ? '修改' : '新增'
            }奖励规则?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          .then(() => {
            const examineGradeRuleDetailMap = JSON.parse(JSON.stringify(query.examineGradeRuleDetailMap))
            this.formatValues(examineGradeRuleDetailMap)
            if(!query.distributionGroupId) delete query.distributionGroupId
            return addExamineGradeRule({...query, examineGradeRuleDetailMap })
          })
          .then(() => {
            this.msgSuccess(
              `${this.form.examineGradeRuleId ? '修改' : '新增'}成功`
            )
            this.cancel()
          })
        }
      })
    },

    /**
     * 返回界面
     */
    cancel() {
      this.$router.push({path: "/attendance-manage/assessment-score/rules"})
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.$refs['grandRuleForm']?.clearValidate()
      this.grandRuleForm = {
        isUpdate: false,
        gradeRole: 'member',
        examineGradeRuleDetailMap: {
          member: [],
          leader: []
        }
      }
      this.handleAddContional()
      this.open = true;
      this.title = "添加考核评分规则明细";
    },
    // 添加奖励条件   
    handleAddContional() {
      this.grandRuleForm.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole].push({})
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$set(this.grandRuleForm.examineGradeRuleDetailMap, row.gradeRole, JSON.parse(JSON.stringify(this.form.examineGradeRuleDetailMap[row.gradeRole])))
      this.grandRuleForm.baseScoreNum = row.baseScoreNum
      this.grandRuleForm.gradeRole = row.gradeRole
      this.grandRuleForm.isUpdate = true

      console.log(this.grandRuleForm.examineGradeRuleDetailMap[row.gradeRole])
      this.open = true
      this.title = "修改考核评分规则明细";
    },
    /** 删除按钮操作 */
    handleDelete(row, index) {
      this.$confirm(`是否确认删除该条评分规则?`, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
      }).then(() => {
          return delExamineGradeRuleDetail(row.examineGradeRuleDetailId);
      }).then(() => {
          // this.handleInfo();
          this.form.examineGradeRuleDetailMap[row.gradeRole].splice(index, 1)
          this.msgSuccess("删除成功");
      })
    },
    // 移除规则
    handleDeleteRow(row, $index){
      this.grandRuleForm.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole].splice($index, 1)
    },
    // 确认增加规则
    handleAddRule() {
      this.$refs['grandRuleForm'].validate(async (valid) => {
        if(valid) {
          this.form.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole] = this.form.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole] ?? []
          this.form.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole] = this.grandRuleForm.examineGradeRuleDetailMap[this.grandRuleForm.gradeRole].map(item =>{
            return {...item, baseScoreNum: this.grandRuleForm.baseScoreNum, gradeRole: this.grandRuleForm.gradeRole}
          })
          this.open = false
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.dialog-footer { 
  padding-bottom: 40px;
  text-align: center;
}

fieldset {
  border: 1px solid;
  padding: 20px;
  margin: 0 20px 20px;
  legend {
    display: inline-block;
    padding: 0 10px;
    width: auto;
  }
}
.dialog-content {
  padding: 10px;
  border: 1px solid #ddd; 
  /deep/ .el-form-item {
    margin:20px 0;
  } 
}

/deep/ .el-table tr.el-table__row,
/deep/ .el-table__header-wrapper th {
  background: #fff !important
}

</style>
