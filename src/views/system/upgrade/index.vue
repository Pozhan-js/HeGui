<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="90px"
    >
      <el-form-item label="配送员信息" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="姓名或手机"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="使用端" prop="appType">
        <el-select
          v-model="queryParams.appType"
          placeholder="请选择使用端"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in appTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="当前版本" prop="suffixVersionNo">
        <el-select
          v-model="queryParams.suffixVersionNo"
          placeholder="请选择当前版本"
          clearable
          size="small"
        >
          <el-option
            v-for="version in versionstatusOptions"
            :key="version"
            :label="version"
            :value="version"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="系统" prop="sysType">
        <el-select
          v-model="queryParams.sysType"
          placeholder="请选择系统"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in sysTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="更新时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button 
          class="blue-btn"
          size="mini" 
          @click="handleQuery"
          v-hasPermi="['system:upgrade:list']"
            >筛选</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      :max-height="maxHeight"
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="logList"
    >
      <el-table-column min-width="110"
        label="配送员编号"
        align="center"
        prop="distributeCode"
      />
      <el-table-column min-width="100"
        label="配送员姓名"
        align="center"
        prop="distributeName"
      />
      <el-table-column min-width="100"
        label="配送员手机号码"
        align="center"
        prop="distributePhone"
      />
      <el-table-column min-width="100"
        label="使用端"
        align="center"
        prop="appType"
        :formatter="appTypeFormat"
      />
      <el-table-column min-width="100" label="操作系统类型" align="center" prop="sysType" />
      <el-table-column min-width="140"
        label="更新时间"
        align="center"
        prop="upDate"
      />
      <el-table-column min-width="80"
        label="更新前版本"
        j
        align="center"
        prop="prefixVersionNo"
      />
      <el-table-column min-width="90"
        label="更新后版本"
        align="center"
        prop="suffixVersionNo"
      />
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
import { listLog } from "@/api/system/log";
import { listVersionNo } from "@/api/system/version";
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: "Log",
  components: {},
  mixins: [SetTableMaxHeight],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 项目升级版本信息记录表格数据
      logList: [],
      // 项目类型字典
      appTypeOptions: [],
      // 版本号字典
      versionstatusOptions: [],
      // 系统类型字典
      sysTypeOptions: [],
      // 更新时间
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: null,
        extend: null,
        appType: null,
        userName: null,
        suffixVersionNo: null,
        sysType: null
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_app_type").then((response) => {
      this.appTypeOptions = response.data;
    });
    this.getDicts("sys_sys_type").then((response) => {
      this.sysTypeOptions = response.data;
    });
    // 查询系统版本号
    listVersionNo().then((response) => {
      this.versionstatusOptions = response.data;
    });
  },
  methods: {
    /** 查询项目升级版本信息记录列表 */
    getList() {
      this.loading = true;
      listLog(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.logList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 项目类型字典翻译
    appTypeFormat(row, column) {
      return this.selectDictLabel(this.appTypeOptions, row.appType);
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>