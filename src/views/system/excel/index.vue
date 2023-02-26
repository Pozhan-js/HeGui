<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="系统模块" prop="title">
        <el-select
          v-model="queryParams.title"
          placeholder="请选择系统模块"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in titleOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="业务类型" prop="businessType">
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
      </el-form-item> -->
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择操作状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="操作时间" prop="time">
          <el-date-picker
            clearable
            size="small"
            v-model="queryParams.time"
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
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="excelList"
    >
      <el-table-column
        label="操作时间"
        align="center"
        prop="operTime"
        width="180"
      />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column
        label="系统模块"
        align="center"
        prop="title"
      />
      <el-table-column label="文件名称" align="center" prop="fileName">
        <template slot-scope="scope">
          <a style="color: #46a6ff;" v-if="scope.row.fileUrl" :href="scope.row.fileUrl">{{ scope.row.fileName }}</a>
          <div v-else>{{ scope.row.fileName }}</div>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="业务类型"
        align="center"
        prop="businessType"
        :formatter="businessTypeFormat"
      /> -->
      <el-table-column label="用户账号" align="center" prop="userName" />
      <el-table-column
        label="操作状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="错误消息" align="center" prop="errorMsg">
          <template slot-scope="scope">
            <el-popover
                placement="right"
                width="400"
                trigger="click">
                <div>{{ scope.row.errorMsg }}</div>
                <el-button type="text" slot="reference" v-if="scope.row.errorMsg">错误信息</el-button>
            </el-popover>
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
import {
  listExcel,
} from "@/api/system/excel";

export default {
  name: "Excel",
  components: {},
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
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 导出报表表格数据
      excelList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 系统模块字典
      titleOptions: [],
      // 业务类型字典
      businessTypeOptions: [],
      // 操作状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        fileName: null,
        businessType: null,
        userName: null,
        time: null,
        status: null,
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_oper_menu").then((response) => {
      this.titleOptions = response.data;
    });
    this.getDicts("sys_oper_type").then((response) => {
      this.businessTypeOptions = response.data;
    });
    this.getDicts("sys_excel_status").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询导出报表列表 */
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
      };
      if (this.queryParams.time && this.queryParams.time.length > 0) {
        params.createTime = this.queryParams.time[0];
        params.updateTime = this.queryParams.time[1];
        delete params.time;
      }
      listExcel(params).then((response) => {
        this.excelList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 系统模块字典翻译
    titleFormat(row, column) {
      return this.selectDictLabel(this.titleOptions, row.title);
    },
    // 业务类型字典翻译
    businessTypeFormat(row, column) {
      return this.selectDictLabel(this.businessTypeOptions, row.businessType);
    },
    // 操作状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>