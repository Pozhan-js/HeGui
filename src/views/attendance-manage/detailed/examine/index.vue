<template>
  <div>
  <pro-table
    ref="proTable"
    :api-config="{ url: '/attendance/appeal/list/condition' }"
    :columns="columns"
    :searchTabsConfig="{dictName: 'attendance_examine_status', paramKey: 'status'}"
    row-key="attendanceMonthDetailsId"
    :before-search-submit="formatSearchParams"
    :params="params"
  >
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button v-hasPermi="['distribution:attendance:appeal:export']" size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>

    <template #action_column_content="scope">
      <template v-if="scope.row.status == 0">
        <el-button
          type="text"
          v-hasPermi="['distribution:attendance:appeal:audit']"
          size="mini"
          @click="handleExamine(scope.row, 1)"
        >
          审批通过
        </el-button>
        <el-button
          type="text"
          v-hasPermi="['distribution:attendance:appeal:audit']"
          size="mini"
          @click="handleExamine(scope.row, 0)"
        >
          审批拒绝
        </el-button>
      </template>
    </template>
  </pro-table>
  <el-dialog title="审核备注" :visible.sync="open" width="30%" inline append-to-body @closed="handleClosed">
    <el-form :model="form">
      <el-form-item label="原因备注" prop="reason"> 
        <el-input
          v-model="form.reason"
          type="textarea"
          placeholder="审核备注"
          :autosize="{ minRows: 3, maxRows: 5 }"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="open = false">取 消</el-button>
      <el-button type="primary" @click="handleAppeal">确 定</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import moment from 'moment'
import {
  appealAgree,
  appealRefuse
} from '@/api/attendance/examine'

export default {
  components: {
    ProTable
  },
  data: () => ({
    // 申诉类型
    appealTypeOptions: [],
    // 审核模态框
    open: false,
    form: {},
    params: {
      attendanceMonth: moment().subtract(1, 'month').endOf('month').format('YYYY-MM'),
    },
    appealId: ''
  }),
  computed: {
    columns() {
      const renderAppealConent = ({ record }) => {
        const appealType = this.appealTypeOptions.find(item=>item.dictValue==record.appealType).dictLabel
        return `由于${record.content}原因，申诉将${appealType}由${record.appealBeforeDays}天改为${record.appealAfterDays}天`
      }
      return [
        { label: '组织', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '配送员', prop: 'distributionInfo', hideInTable: true, order: 1},
        { label: '月份', prop: 'attendanceMonth', minWidth: 90, valueType: 'dateMonth', order: 2 },
        { label: '组织', prop: 'orgName', hideInSearch: true, minWidth: 120, valueType: 'text' },
        { label: '供应商名称', prop: 'shopName', hideInSearch: true, minWidth: 100},
        { label: '配送员', prop: 'distributionName', hideInSearch: true, minWidth: 100, order: 2, valueType: 'text'},
        { label: '手机号', prop: 'distributionPhone', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '配送员类型', prop: 'distributionType', hideInSearch: true, minWidth: 100, valueType: 'dictSelect', fieldProps: { dict: 'distribution_type' }},
        { label: '配送员状态', prop: 'distributionStatus', hideInSearch: true, minWidth: 100, valueType: 'dictSelect', fieldProps: { dict: 'distribution_status' } },
        { label: '审核状态', prop: 'status', hideInSearch: true, minWidth: 100, valueType: 'dictSelect', fieldProps: { dict: 'attendance_examine_status' } },
        { label: '申诉内容', hideInSearch: true, minWidth: 220, hideInSearch: true, renderText: renderAppealConent},
        { label: '操作', prop: 'action', minWidth: 100, hideInSearch: true},
      ]
    }
  },
  created(){
    this.getDicts('attendance_appeal_type').then((response) => {
      this.appealTypeOptions = response.data
    })
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
        orderByColumn: 'appeal_id',
        isAsc: 'desc'
      }
    },
    handleExport({ getParams }) {
      const params = getParams()
      this.download('attendance/appeal/export', this.formatSearchParams(params))
    },
    handleClosed() {
      this.form = {}
    },
    handleExamine(row, isAgree) {
      this.appealId = row.appealId
      this.isAgree = isAgree
      this.open = true
    },
    handleAppeal() {
      this.form.appealId = this.appealId
      this.$confirm(
        `是否确认${this.isAgree ? '通过': '拒绝'}审批`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        } 
      )
        .then(() => {
          return this.isAgree ? appealAgree(this.form) : appealRefuse(this.form)
        })
        .then(() => {
          this.msgSuccess(`${this.isAgree ? '审批已通过': '审批已拒绝'}`)
          this.$refs?.proTable?.getListData()
          this.open = false
        })
    }
  }
}
</script>
