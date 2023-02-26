<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作菜单" prop="operTitle">
        <el-select
          v-model="queryParams.operTitle"
          placeholder="请选择操作菜单"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in businessMenuOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select
          v-model="queryParams.businessType"
          placeholder="请选择业务类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in businessTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模块" prop="modularName">
        <el-select
          v-model="queryParams.modularName"
          placeholder="请选择模块"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in businessModularOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入操作人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="操作时间" prop="time">
          <el-date-picker
            v-model="queryParams.time"
            clearable
            size="small"
            :picker-options="pickerOptions"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
      </el-row>
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['system:businessLog:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="businessLogList"
    >
      <!-- @selection-change="handleSelectionChange" -->
      <!-- <el-table-column type="selection" width="80" align="center" /> -->
      <el-table-column min-width="140" label="组织名称" align="center" prop="orgName" />
      <!-- <el-table-column min-width="100" label="账号" align="center" prop="userName" /> -->
      <el-table-column min-width="90" label="操作人员信息" align="center" prop="nickName">
        <template slot-scope="scope">
          <div>{{ scope.row.nickName }}</div>
          <div>{{ scope.row.phonenumber }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="操作菜单" align="center" prop="operTitle" />
      <el-table-column
        min-width="90"
        label="操作类型"
        align="center"
        prop="businessType"
        :formatter="businessTypeFormat"
      />
      <el-table-column
        min-width="90"
        label="模块"
        align="center"
        prop="modularName"
        :formatter="businessModularFormat"
      />
      <el-table-column min-width="140" label="操作内容" align="center" prop="operContent" />
      <el-table-column min-width="100" label="操作时间" align="center" prop="operTime">
        <template slot-scope="{row}">
          {{ formatDate(row.operTime)[0] }}<br>
          {{ formatDate(row.operTime)[1] }}
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
  </div>
</template>

<script>
import { listBusinessLog } from '@/api/system/businessLog'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'

export default {
  name: 'BusinessLog',
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
      // 总条数
      total: 0,
      // 业务操作日志记录表格数据
      businessLogList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 业务类型字典
      businessTypeOptions: [],
      // 操作菜单
      businessMenuOptions: [],
      // 模块
      businessModularOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        operTitle: null,
        businessType: null,
        userName: null,
        modularName: null,
        time: null
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'))
              const end = new Date(moment(new Date()).endOf('day'))
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(start).endOf('day'))
              ])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          }
        ]
      }
    }
  },
  created() {
    this.getList()

    this.getDicts('sys_oper_menu').then((response) => {
      this.businessMenuOptions = response.data
    })
    this.getDicts('sys_oper_type').then((response) => {
      this.businessTypeOptions = response.data
    })
    this.getDicts('sys_business_modular').then((response) => {
      this.businessModularOptions = response.data
    })
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  methods: {
    /** 查询业务操作日志记录列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.queryParams.time && this.queryParams.time.length > 0) {
        params.createTime = this.queryParams.time[0]
        params.updateTime = this.queryParams.time[1]
        delete params.time
      }

      listBusinessLog(params).then((response) => {
        this.businessLogList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 业务类型字典翻译
    businessTypeFormat(row, column) {
      return this.selectDictLabel(this.businessTypeOptions, row.businessType)
    },
    // 模块字典类型翻译
    businessModularFormat(row, column) {
      return this.selectDictLabel(this.businessModularOptions, row.modularName)
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
      this.ids = selection.map((item) => item.businessLogId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.businessLogList.length === selection.length
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/businessLog/export',
        {
          ...this.queryParams
        },
        `system_businessLog.xlsx`
      )
    }
    // // 全选
    // toggleSelection(value) {
    //   if (value) {
    //     this.$refs.multipleTable.clearSelection();
    //     this.businessLogList.forEach((row) => {
    //       this.$refs.multipleTable.toggleRowSelection(row);
    //     });
    //   } else {
    //     this.$refs.multipleTable.clearSelection();
    //   }
    // },
  }
}
</script>
