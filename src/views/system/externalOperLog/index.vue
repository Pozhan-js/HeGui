<template>
  <div>
    <pro-table
      :api-config="{ url: '/externalOperLog/list' }"
      :columns="columns"
      :params="params"
      :before-search-submit="formatSearchParams"
      rowKey = "businessId"
    >
      <template #action_column_content="scope">
        <el-button
          v-hasPermi="['system:externalOperLog:query']"
          size="mini"
          type="text"
          @click="handleView(scope.row)"
        >详情
        </el-button>
      </template>
    </pro-table>
    <!-- 操作日志详细 -->
    <el-dialog title="外部接口操作日志详细" :visible.sync="dialogVisible" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="8">
            <el-form-item label="操作模块：">{{ form.title }}</el-form-item>
            <el-form-item
              label="主机地址："
            >{{ form.operIp }}</el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="创建时间">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === 1" label="异常信息：">{{ form.errorMsg }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述：">{{ form.description }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {
      orderByColumn: 'create_time',
      isAsc: 'desc'
    },
    dialogVisible: false,
    form: {}
  }),
  computed: {
    columns() {
      return [
        { label: "模块标题", prop: "title", minWidth: 138, valueType: 'text'},
        { label: '业务ID', prop: 'businessId', minWidth: 60, valueType: 'text'}, 
        { label: "方法名称", prop: "method", minWidth: 70, valueType: 'text'},
        { label: "请求方式", prop: "requestMethod", hideInSearch: true, minWidth: 70, valueType: 'text'},
        { label: "主机地址", prop: "operIp", minWidth: 90, valueType: "text" },
        { label: '操作状态', prop: 'status', hideInSearch: true, minWidth: 60, valueType: 'dictSelect', fieldProps: { dict: 'sys_common_status' }}, 
        { label: '错误信息', prop: 'errorMsg', hideInSearch: true, hideInSearch: true, minWidth: 60, valueType: 'text'},
        { label: '创建时间', minWidth: 100, valueType: 'dateTimeRange', paramsRange: ['beginTime', 'endTime'], order: 1, render: (h, { record }) => (<BreakTime dateTime={record.createTime} /> ),},
        { label: '操作', prop: 'action', hideInSearch: true, minWidth: 60},
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    handleView(row) {
      this.form = row
      this.dialogVisible = true
    } 
  }
}
</script>
<style >
  .text-wrap{
    white-space: break-spaces;
  }
  
</style>
