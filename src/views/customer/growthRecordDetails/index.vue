<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
			<el-row>
				<el-form-item label="统计时间" prop="time">
					<el-date-picker
						clearable
						size="small"
						v-model="queryParams.time"
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
			<el-form-item label="订单编号" prop="orderNo">
        <el-input
          placeholder="请输入订单编号"
          v-model="queryParams.orderNo"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
			<el-form-item label="用户ID" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入用户ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
			<el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="变更类型" prop="changeType">
        <el-select
          v-model="queryParams.changeType"
          placeholder="请选择变更类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in changeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="策略类型"
        prop="strategyType"
      >
        <el-select
          v-model="queryParams.strategyType"
          placeholder="请选择策略类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in strategyTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['customer:growthRecord:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      :max-height="maxHeight"
      style="margin-top: 20px"
      ref="multipleTable"
      v-loading="loading"
      :data="growthRecordList"
    >
      <el-table-column min-width="80" label="账期" align="center" prop="period" />
      <el-table-column min-width="100" label="用户ID" align="center" prop="customerId" />
			<el-table-column min-width="100" label="图像名称" align="center" prop="loginName">
				<template slot-scope="scope">
					<div style="cursor: pointer" @click="onJump(scope.row.customerId)">
						<img
							:src="scope.row.avatar ? scope.row.avatar : '/avatar.png'"
							style="width: 40px; height: 40px; border-radius: 100px"
						/>
						<div class="outer-link--text">{{ scope.row.nickname }}</div>
					</div>
				</template>
			</el-table-column>
      <el-table-column min-width="100" label="变更类型" align="center" prop="changeType" :formatter="changeTypeFormat" />
			<el-table-column min-width="150" label="订单编号" align="center" prop="orderNo" />
			<el-table-column min-width="120" label="变更时间" align="center" prop="updateTime">
        <template slot-scope="{row}">
          {{formatDate(row.updateTime)[0]}}<br/>
          {{formatDate(row.updateTime)[1]}}
        </template>
      </el-table-column>
			<el-table-column min-width="100" label="变动前成长值" align="center" prop="beforeNum" />
			<el-table-column min-width="100" label="变动后成长值" align="center" prop="afterNum" />
      <el-table-column min-width="90" label="策略类型" align="center" prop="strategyType" :formatter="strategyTypeFormat" />
			<el-table-column min-width="90" label="原因" align="center" prop="reason" />

      <!-- <el-table-column label="业务资源id" align="center" prop="resourceId" />
      <el-table-column label="策略类型" align="center" prop="strategyType" :formatter="strategyTypeFormat"/>
      <el-table-column label="账期时间" align="center" prop="periodTime"/>
      <el-table-column label="用户id" align="center" prop="customerId" />
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      
      <el-table-column label="数量" align="center" prop="growthNum" /> -->
     
    </el-table>
    <el-row>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-row>
  </div>
</template>

<script>
import { listGrowthRecord } from "@/api/customer/growthRecordDetails";
import moment from 'moment';
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: "GrowthRecordDetails",
  components: {},
  mixins: [ SetTableMaxHeight ],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 成长值变动记录表格数据
      growthRecordList: [],
      // 变更类型(1策略2任务3手动)字典
      changeTypeOptions: [],
      // 策略类型(consume消费recharge充值sign签到share分享score评价)字典
      strategyTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        changeType: null,
        strategyType: null,
        time: null,
        customerId: this.$route.query.customerId,
				loginName: null,
        orderByColumn: 'create_time',
        isAsc:'desc'
      },
			pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'));
              const end = new Date(moment(new Date()).endOf('day'));
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(start).endOf('day'))]);
            },
          },
          {
            text: "近七天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("customer_growth_change_type").then((response) => {
      this.changeTypeOptions = response.data;
    });
    this.getDicts("customer_growth_strategy_type").then((response) => {
      this.strategyTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询成长值变动记录列表 */
    getList() {
      this.loading = true;
			const params = {
        ...this.queryParams,
      }
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.beginTime = this.queryParams.time[0]
        params.endTime = this.queryParams.time[1]
      }
      delete params.time
      listGrowthRecord(params).then((response) => {
        this.growthRecordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 变更类型字典翻译
    changeTypeFormat(row, column) {
      return this.selectDictLabel(this.changeTypeOptions, row.changeType);
    },
    // 策略类型字典翻译
    strategyTypeFormat(row, column) {
      return this.selectDictLabel(this.strategyTypeOptions, row.strategyType);
    },
		// 跳转客户界面
    onJump(customerId) {
      this.$router.push({
        path: "/customer/customerInfo",
        query: {
          customerId,
        },
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        changeType: null,
        strategyType: null,
        time: null,
        customerId: null,
				loginName: null,
        orderByColumn: 'create_time',
        isAsc:'desc'
      }
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导出按钮操作 */
    handleExport() {
      const params = {
        ...this.queryParams,
      }
      if (this.queryParams.time && this.queryParams.time.length === 2) {
        params.beginTime = this.queryParams.time[0]
        params.endTime = this.queryParams.time[1]
      }
      delete params.time
      this.download("/growthRecord/export", params);
    },
  },
};
</script>