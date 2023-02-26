<template>
  <div v-loading="loading" style="padding: 20px">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :disabled="isCheck"
      label-width="125px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :disabled="isCheck"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="名称" prop="ruleName">
        <el-input
          v-model="form.ruleName"
          style="width: 30%"
          placeholder="请输入名称"
          clearable
          size="small"
        />
      </el-form-item>
      <el-form-item label="惩罚对象" prop="punishUser">
        <el-select
          v-model="form.punishUser"
          style="width: 30%"
          placeholder="请选择惩罚对象"
          size="small"
        >
          <el-option
            v-for="dict in punishUserOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          v-model="form.time"
          style="width: 30%"
          size="small"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="考勤指标和惩罚" required>
        <el-table :data="form.attendancePunishTargetList" align="center">
          <el-table-column label="类型" prop="attendanceType">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('PunishTarget_AttendanceType_' + scope.$index)"
                :class="errorMap.has('PunishTarget_AttendanceType_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-select
                  v-model="scope.row.attendanceType"
                  placeholder="请选择类型"
                  @change="handleSelectAttendanceType($event, scope)"
                >
                  <el-option
                    v-for="dict in attendanceOptions"
                    :key="dict.dictValue"
                    :label="dict.dictLabel"
                    :value="dict.dictValue"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="时间维度" prop="targetType">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('PunishTarget_TargetType_' + scope.$index)"
                :class="errorMap.has('PunishTarget_TargetType_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-select
                  v-model="scope.row.targetType"
                  placeholder="请选择时间维度"
                  @change="handleSelectTimeType($event, scope)"
                >
                  <el-option
                    :disabled="scope.row.attendanceType === 'noAttendance'"
                    label="日"
                    value="1"
                  />
                  <el-option
                    label="月"
                    value="2"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            label="条件（大于等于>=）"
            prop="targetStartCondition"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('PunishTarget_StartCondition_' + scope.$index)"
                :class="errorMap.has('PunishTarget_StartCondition_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-input-number
                  v-model="scope.row.targetStartCondition"
                  :min="0"
                  :max="+scope.row.targetEndCondition || Infinity"
                  :step="10"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="条件（小于<）" prop="targetEndCondition">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('PunishTarget_EndCondition_' + scope.$index)"
                :class="errorMap.has('PunishTarget_EndCondition_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-input-number
                  v-model="scope.row.targetEndCondition"
                  :min="+scope.row.targetStartCondition"
                  :step="10"
                  @change="handleChangeEndCondition(scope.row)"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('PunishTarget_Unit_' + scope.$index)"
                :class="errorMap.has('PunishTarget_Unit_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-select
                  v-model="scope.row.unit"
                  placeholder="请选择单位"
                >
                  <el-option
                    :disabled="scope.row.targetType === '2' "
                    label="分钟"
                    value="1"
                  />
                  <el-option
                    :disabled="scope.row.targetType === '1'"
                    label="天"
                    value="2"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="惩罚（元）" prop="punishAmount">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.punishAmount"
                :min="0"
                :step="10"
                @blur="handleBlurAmount(scope)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="!isCheck" label="操作" prop="action" width="80px">
            <template slot-scope="scope">
              <i
                v-if="scope.$index > 0"
                :class="$style.deleteIcon"
                class="el-icon-delete"
                @click="removePunishTargetItem(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-button v-if="!isCheck" type="primary" plain :class="$style.addBtn" @click="addPunishTargetItem">添加</el-button>
        <div :class="$style.tipContainer">
          <p v-for="(item, i) in punishTargeTextArr" :key="i" :class="$style.text" v-text="item" />
        </div>
      </el-form-item>
      <el-form-item label="缺勤指标设置" required>
        <el-table :data="form.attendanceIndicatorDefinitionList" align="center">
          <el-table-column label="类型" prop="attendanceType">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('IndicatorDefinition_AttendanceType_' + scope.$index)"
                :class="errorMap.has('IndicatorDefinition_AttendanceType_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-select
                  v-model="scope.row.attendanceType"
                  placeholder="请选择类型"
                >
                  <el-option
                    v-for="dict in attendanceIndicatorOptions"
                    :key="dict.dictValue"
                    :label="dict.dictLabel"
                    :value="dict.dictValue"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="时间维度" prop="targetType">
            日
          </el-table-column>
          <el-table-column label="条件（大于等于>=）" prop="targetCondition">
            <template slot-scope="scope">
              <el-form-item
                :error="errorMap.get('IndicatorDefinition_TargetCondition_' + scope.$index)"
                :class="errorMap.has('IndicatorDefinition_TargetCondition_' + scope.$index) ? $style.hasErrorText : ''"
              >
                <el-input-number v-model="scope.row.targetCondition" :min="0" :step="10" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单位" prop="unit"> 分钟 </el-table-column>
          <el-table-column v-if="!isCheck" label="操作" prop="action" width="80px">
            <template slot-scope="scope">
              <i
                v-if="scope.$index > 0"
                :class="$style.deleteIcon"
                class="el-icon-delete"
                @click="removeAttendanceItem(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-button
          v-if="!isCheck"
          :disabled="form.attendanceIndicatorDefinitionList.length >= 2"
          type="primary"
          plain
          :class="$style.addBtn"
          @click="addAttendanceItem"
        >添加</el-button>
        <div :class="$style.tipContainer">
          <p v-for="(item, i) in indicatorTextArr" :key="i" :class="$style.text" v-text="item" />
        </div>
      </el-form-item>
    </el-form>
    <div :class="$style.dialogFooter">
      <el-button
        v-if="!isCheck"
        type="primary"
        :loading="this.$store.state.isLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {
  addAttendancePunishRule,
  getAttendancePunishRule
} from '@/api/attendance/punish'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { flatten, searchSuperior } from '@/utils/array'
import moment from 'moment'
import Decimal from 'decimal.js'

export default {
  components: {
    Cascader
  },
  data(vm) {
    return {
      loading: true,
      isCheck: vm.$route.query.type === 'check',
      isAdd: vm.$route.name === 'Add',
      // 组织
      orgOptions: [],
      // 惩罚对象(1专职配送员，2兼职配送员)字典
      punishUserOptions: [],
      // 迟到/缺勤/早退 字典
      attendanceOptions: [],
      // 表单参数
      form: {
        ruleName: null,
        punishUser: null,
        time: null,
        attendancePunishTargetList: [
          {
            attendanceType: 'beLate',
            targetType: '1',
            targetStartCondition: null,
            targetEndCondition: null,
            unit: '1',
            punishAmount: 0
          },
          {
            attendanceType: 'leaveEarly',
            targetType: '1',
            targetStartCondition: null,
            targetEndCondition: null,
            unit: '1',
            punishAmount: 0
          },
          {
            attendanceType: 'noAttendance',
            targetType: '2',
            targetStartCondition: null,
            targetEndCondition: null,
            unit: '2',
            punishAmount: 0
          }
        ],
        attendanceIndicatorDefinitionList: [
          {
            targetType: '1',
            attendanceType: 'beLate',
            targetCondition: null,
            unit: '1'
          }
        ]
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: '组织不能为空', trigger: 'blur' }
        ],
        ruleName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
          { max: 20, message: '名称不能超过20个字符', trigger: 'blur' }
        ],
        time: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
        punishUser: [
          { required: true, message: '惩罚对象不能为空', trigger: 'blur' }
        ]
      },
      errorMap: new Map()
    }
  },
  computed: {
    attendanceIndicatorOptions() {
      return this.attendanceOptions.filter(item => item.dictValue !== 'noAttendance')
    },
    punishTargeTextArr() {
      return this.form.attendancePunishTargetList.map(item => {
        const type = this.attendanceOptions.find(option => option.dictValue === item.attendanceType)?.dictLabel || ' '
        const unit = item.targetType === '1' ? '分钟' : '次'
        const endText = item.targetEndCondition ? ` 至 小于${item.targetEndCondition}${unit}` : ''

        return `每${item.targetType === '2' ? '月' : '天'}${type}大于等于 ${item.targetStartCondition ?? ''}${unit}${endText}， 惩罚${item.punishAmount ?? ''}元；`
      })
    },
    indicatorTextArr() {
      return this.form.attendanceIndicatorDefinitionList.map(item => {
        const type = this.attendanceOptions.find(option => option.dictValue === item.attendanceType)?.dictLabel || ''

        return `每日${type}大于等于 ${item.targetCondition ?? ''}分钟，视为缺勤；`
      }, '')
    }
  },
  created() {
    this.loading = !this.isAdd
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        if (!this.isAdd) {
          this.getInfo(this.$route.query.attendancePunishId)
        }
      }
    })
    this.getDicts('finance_award_user').then((response) => {
      this.punishUserOptions = response.data
    })
    this.getDicts('distribution_attendance_status').then((response) => {
      this.attendanceOptions = response.data
    })
  },
  methods: {
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (!this.validateForm() || !valid) {
          return
        }

        this.$confirm(
          `是否确定${this.isAdd ? '新增' : '修改'}考勤惩罚规则?`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(() => {
            const params = {
              ...this.form,
              beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
              endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
              orgId: this.form.orgId.slice(-1)[0],
              attendancePunishTargetList: this.form.attendancePunishTargetList.map(item => ({ ...item, punishAmount: new Decimal(item.punishAmount).mul(100).toNumber() }))
            }
            return addAttendancePunishRule(params)
          })
          .then(() => {
            this.msgSuccess(`${this.isAdd ? '新增' : '修改'}成功`)
            this.cancel()
          })
      })
    },
    addPunishTargetItem() {
      this.form.attendancePunishTargetList.push({
        attendanceType: null,
        targetType: null,
        targetStartCondition: null,
        targetEndCondition: null,
        unit: null,
        punishAmount: 0
      })
    },
    removePunishTargetItem(index) {
      this.form.attendancePunishTargetList.splice(index, 1)
    },
    addAttendanceItem() {
      this.form.attendanceIndicatorDefinitionList.push({
        targetType: '1',
        attendanceType: null,
        targetCondition: null,
        unit: '1'
      })
    },
    removeAttendanceItem(index) {
      this.form.attendanceIndicatorDefinitionList.splice(index, 1)
    },
    handleSelectAttendanceType(type, scope) {
      if (type === 'noAttendance') {
        this.$set(this.form.attendancePunishTargetList, scope.$index, {
          ...scope.row,
          targetType: '2',
          unit: '2'
        })
      }
    },
    handleSelectTimeType(type, scope) {
      this.$set(this.form.attendancePunishTargetList, scope.$index, {
        ...scope.row,
        unit: type === '1' ? '1' : '2'
      })
    },
    handleBlurAmount(scope) {
      this.$set(this.form.attendancePunishTargetList, scope.$index, {
        ...scope.row,
        punishAmount: Math.round(scope.row.punishAmount * 100) / 100
      })
    },
    // 修改日维度的条件时，同步更改缺勤指标条件
    handleChangeEndCondition(row) {
      if (row.targetType === '2' || row.attendanceType === 'noAttendance') {
        return
      }
      const noMax = this.form.attendancePunishTargetList.some(item => item.attendanceType === row.attendanceType && item.targetEndCondition > row.targetEndCondition)
      if (noMax) {
        return
      }
      const list = this.form.attendanceIndicatorDefinitionList
      const index = list.findIndex(item => item.attendanceType === row.attendanceType)
      if (index !== -1) {
        this.$set(this.form.attendanceIndicatorDefinitionList, index, {
          ...list[index],
          targetCondition: row.targetEndCondition
        })
      }
    },
    getInfo(attendancePunishId) {
      getAttendancePunishRule(attendancePunishId).then((res) => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        const {
          attendancePunishId,
          ruleName,
          punishUser,
          attendancePunishTargetList,
          attendanceIndicatorDefinitionList
        } = res.data
        this.form = {
          attendancePunishId,
          ruleName,
          orgId,
          punishUser,
          time: [new Date(res.data.beginTime), new Date(res.data.endTime)],
          attendancePunishTargetList: attendancePunishTargetList.map(
            (item) => ({
              targetId: item.targetId,
              attendanceType: item.attendanceType,
              targetType: item.targetType,
              targetStartCondition: item.targetStartCondition,
              targetEndCondition: item.targetEndCondition,
              unit: item.unit,
              punishAmount: item.punishAmount / 100
            })
          ),
          attendanceIndicatorDefinitionList: attendanceIndicatorDefinitionList.map(
            (item) => ({
              id: item.id,
              targetType: item.targetType,
              attendanceType: item.attendanceType,
              targetCondition: item.targetCondition,
              unit: item.unit
            }))
        }
        this.loading = false
      })
    },
    validateForm() {
      const map = new Map()
      this.validateRequiredFiled(map)
      this.validatePunishTargetFiled(map)
      this.validateIndicatorDefinitionFiled(map)
      this.errorMap = map
      return !this.errorMap.size
    },
    validateRequiredFiled(errMap) {
      this.form.attendancePunishTargetList.forEach((item, index) => {
        if (!item.attendanceType) {
          errMap.set(`PunishTarget_AttendanceType_${index}`, '类型不能为空')
        }
        if (!item.targetType) {
          errMap.set(`PunishTarget_TargetType_${index}`, '时间维度不能为空')
        }
        if (!item.targetStartCondition) {
          errMap.set(`PunishTarget_StartCondition_${index}`, '条件不能为空或0')
        }
        if (!item.targetEndCondition) {
          errMap.set(`PunishTarget_EndCondition_${index}`, '条件不能为空或0')
        }
        if (item.targetStartCondition && (item.targetStartCondition === item.targetEndCondition)) {
          errMap.set(`PunishTarget_StartCondition_${index}`, '条件不能相同')
          errMap.set(`PunishTarget_EndCondition_${index}`, '条件不能相同')
        }
        if (!item.unit) {
          errMap.set(`PunishTarget_Unit_${index}`, '单位不能为空')
        }
      })
      this.form.attendanceIndicatorDefinitionList.forEach((item, index) => {
        if (!item.attendanceType) {
          errMap.set(`IndicatorDefinition_AttendanceType_${index}`, '类型不能为空')
        }
        if (!item.targetCondition) {
          errMap.set(`IndicatorDefinition_TargetCondition_${index}`, '条件不能为空或0')
        }
      })
    },
    validatePunishTargetFiled(errMap) {
      const punishObj = Object.create(null)
      this.form.attendancePunishTargetList.forEach((item, index) => {
        const punishKey = `${item.attendanceType}_${item.targetType}`
        const punishValue = { ...item, initialIndex: index }
        if (Array.isArray(punishObj[punishKey])) {
          punishObj[punishKey].push(punishValue)
        } else {
          punishObj[punishKey] = [punishValue]
        }
      })
      const reduceFn = (previousValue, currentValue) => {
        if (previousValue.targetEndCondition < currentValue.targetStartCondition) {
          errMap.set(`PunishTarget_EndCondition_${previousValue.initialIndex}`, '条件不能存在间隔')
          errMap.set(`PunishTarget_StartCondition_${currentValue.initialIndex}`, '条件不能存在间隔')
        }
        if (previousValue.targetEndCondition > currentValue.targetStartCondition) {
          errMap.set(`PunishTarget_EndCondition_${previousValue.initialIndex}`, '条件不能存在交叉')
          errMap.set(`PunishTarget_StartCondition_${currentValue.initialIndex}`, '条件不能存在交叉')
        }
        return currentValue
      }
      Object.entries(punishObj).forEach(([key, value]) => {
        const sortedArr = value.sort((a, b) => a.targetStartCondition - b.targetStartCondition)
        sortedArr.reduce(reduceFn)
      })
    },
    validateIndicatorDefinitionFiled(errMap) {
      this.form.attendanceIndicatorDefinitionList.reduce((previousValue, currentValue, index) => {
        if (previousValue.attendanceType === currentValue.attendanceType) {
          errMap.set(`IndicatorDefinition_AttendanceType_${index - 1}`, '类型不能相同')
          errMap.set(`IndicatorDefinition_AttendanceType_${index}`, '类型不能相同')
        }
        return currentValue
      })
    },
    cancel() {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" module>
@import "~@/assets/styles/variables.scss";

  .tipContainer {
    margin-top: 15px;
    color: $red;
    .text {
      line-height: 24px;
      margin: 0;
    }
  }
  .hasErrorText {
    height: 55px;
  }
  .deleteIcon {
    font-size: 20px;
    color: $red;
    cursor: pointer;
  }
  .dialogFooter {
    margin-left: 120px;
  }
  .addBtn {
    width: 150px;
    margin-top: 15px;
  }
</style>
