<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :fieldNames="{
            value: 'id',
            label: 'label',
            children: 'children',
          }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodTimeType">
        <el-select
          v-model="queryParams.periodTimeType"
          placeholder="请选择统计时间"
          size="small"
        >
          <el-option
            v-for="dict in periodTimeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="time">
        <el-date-picker
        v-model="queryParams.time"
        :type="{1 : 'date', 3: 'week', 2: 'month'}[queryParams.periodTimeType]"
        placeholder="选择日期"/>
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
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
    <div style="margin-top: 20px;display: flex;flex-wrap: wrap;justify-content: center;" v-loading="loading">
      <el-card class="box-card" style="width: 500px;margin-right: 20px;margin-bottom: 20px;" v-for="(item, index) in dataList" :key="index">
        <div style="font-size: 16px;font-weight: 700;text-align: left;font-family: 'PingFang SC';">{{ item.title }}</div>
        <div style="font-size: 36px;font-weight: 700;text-align: left;font-family: 'PingFang SC';">{{ item.value }}</div>
        <div style="border-top: 1px solid #DEDEDE;padding-top: 10px;">
          <el-row v-if="type == 1">
            <el-col :span="8" style="text-align: center;">
              <Progress strokeLinecap="square" strokeColor="#49A8FF" type="circle" :percent="item.day.value" :showInfo="false" :width="50" :strokeWidth="15" />
              <div style="margin-top: 5px;">
                <div style="color: #253049;font-size: 16px;font-weight: 700;font-family: 'PingFang SC';border-right: 1px solid #DEDEDE">
                  {{ item.day.value }}%
                  <i v-if=" item.day.type === 'top'" class="el-icon-caret-top" style="color:rgb(255, 0, 0);"/>
                  <i v-else class="el-icon-caret-bottom" style="color:rgb(0, 255, 0);"/>
                </div>
                <div style="color: #A0A4B0;font-size: 14px;font-weight: 400;font-family: 'PingFang SC';">较上一日</div>
              </div>
            </el-col>
            <el-col :span="8" style="text-align: center;">
              <Progress strokeLinecap="square" strokeColor="#FF9E44" type="circle" :percent="item.week.value" :showInfo="false" :width="50" :strokeWidth="15" />
              <div style="margin-top: 5px;">
                <div style="color: #253049;font-size: 16px;font-weight: 700;font-family: 'PingFang SC';border-right: 1px solid #DEDEDE">
                  {{ item.week.value }}%
                  <i v-if=" item.week.type === 'top'" class="el-icon-caret-top" style="color:rgb(255, 0, 0);"/>
                  <i v-else class="el-icon-caret-bottom" style="color:rgb(0, 255, 0);"/>
                </div>
                <div style="color: #A0A4B0;font-size: 14px;font-weight: 400;font-family: 'PingFang SC';">较上一周</div>
              </div>
            </el-col>
            <el-col :span="8" style="text-align: center;">
              <Progress strokeLinecap="square" strokeColor="#C082FF" type="circle" :percent="item.moon.value" :showInfo="false" :width="50" :strokeWidth="15" />
              <div style="margin-top: 5px;">
                <div style="color: #253049;font-size: 16px;font-weight: 700;font-family: 'PingFang SC';">
                  {{ item.moon.value }}%
                  <i v-if=" item.moon.type === 'top'" class="el-icon-caret-top" style="color:rgb(255, 0, 0);"/>
                  <i v-else class="el-icon-caret-bottom" style="color:rgb(0, 255, 0);"/>
                </div>
                <div style="color: #A0A4B0;font-size: 14px;font-weight: 400;font-family: 'PingFang SC';">较上一月</div>
              </div>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="12" style="text-align: center;">
              <Progress strokeLinecap="square" strokeColor="#49A8FF" type="circle" :percent="item.ratio.value" :showInfo="false" :width="50" :strokeWidth="15" />
              <div style="margin-top: 5px;">
                <div style="color: #253049;font-size: 16px;font-weight: 700;font-family: 'PingFang SC';border-right: 1px solid #DEDEDE">
                  {{ item.ratio.value }}%
                  <i v-if=" item.ratio.type === 'top'" class="el-icon-caret-top" style="color:rgb(255, 0, 0);"/>
                  <i v-else class="el-icon-caret-bottom" style="color:rgb(0, 255, 0);"/>
                </div>
                <div style="color: #A0A4B0;font-size: 14px;font-weight: 400;font-family: 'PingFang SC';">环比</div>
              </div>
            </el-col>
            <el-col :span="12" style="text-align: center;">
              <Progress strokeLinecap="square" strokeColor="#FF9E44" type="circle" :percent="item.same.value" :showInfo="false" :width="50" :strokeWidth="15" />
              <div style="margin-top: 5px;">
                <div style="color: #253049;font-size: 16px;font-weight: 700;font-family: 'PingFang SC';">
                  {{ item.same.value }}%
                  <i v-if=" item.same.type === 'top'" class="el-icon-caret-top" style="color:rgb(255, 0, 0);"/>
                  <i v-else class="el-icon-caret-bottom" style="color:rgb(0, 255, 0);"/>
                </div>
                <div style="color: #A0A4B0;font-size: 14px;font-weight: 400;font-family: 'PingFang SC';">同比</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getList } from "@/api/data/coreIndicators";
import { getOrgTree } from "@/api/utils";
import { Cascader, Calendar, Progress } from "ant-design-vue";
import "moment/locale/zh-cn";
import moment from "moment";
const cardValue = require('./card.json')

export default {
  name: "CoreIndicators",
  components: {
    Cascader,
    Calendar,
    Progress
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 表格数据
      dataList: [],
      // 时间类型
      periodTimeTypeOptions: [],
      // 查询参数
      queryParams: {
        orgId: null,
        periodTimeType: '1',
        time: moment().subtract(1, 'days'),
      },
      type: 1
    };
  },
  created() {
    this.getList();
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
    this.getDicts("data_period_time_type").then((response) => {
      this.periodTimeTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询客户购买统计列表 */
    getList() {
      this.loading = true;
      getList(this.formatQuery(this.queryParams)).then((response) => {
        const data = response.data
        this.type = this.queryParams.periodTimeType
        const dataListKey = {1: 'dayCard', 2: 'moonCard'}[this.queryParams.periodTimeType]
        this.dataList = cardValue[dataListKey].map(item => {
          let value = data[item.key].value
          if (item.value === 'toDecimal2') {
            value = this.toDecimal2(data[item.key].value / 100)
          } else if (item.value === 'percentage') {
            value = data[item.key].value + '%'
          } 
          return {
            title: item.title,
            value: value,
            day: {
              value: data[item.key].compareLastDayRate,
              type: data[item.key].compareLastDayRate > 0 ? 'top' : 'bottom'
            },
            week: {
              value: data[item.key].compareLastWeekRate,
              type: data[item.key].compareLastWeekRate > 0 ? 'top' : 'bottom'
            },
            moon: {
              value: data[item.key].compareLastMonthRate,
              type: data[item.key].compareLastMonthRate > 0 ? 'top' : 'bottom'
            },
            ratio: {
              value: data[item.key].compareYoYRate,
              type: data[item.key].compareYoYRate > 0 ? 'top' : 'bottom'
            },
            same: {
              value: data[item.key].compareMoMRate,
              type: data[item.key].compareMoMRate > 0 ? 'top' : 'bottom'
            }
          }
        })
        this.loading = false;
      });
    },
    /**
     * 查询格式化
     */
    formatQuery(param) {
      const params = {
        ...param,
      }
      delete params.time
      if (param.periodTimeType == 1) {
        params.periodBeginTime = moment(param.time).format('YYYY-MM-DD');
        params.periodEndTime = moment(param.time).format('YYYY-MM-DD');
      } else if (param.periodTimeType == 2) {
        params.periodBeginTime = moment(param.time).startOf('month').format('YYYY-MM-DD');
        params.periodEndTime = moment(param.time).endOf('month').format('YYYY-MM-DD');
      } else if (param.periodTimeType == 3) {
        params.periodBeginTime = moment(param.time).subtract(moment(param.time).format('E') - 1, 'days').format('YYYY-MM-DD')
        params.periodEndTime = moment(param.time).add(7 - moment(param.time).format('E'), 'days').format('YYYY-MM-DD')
      }
      return params
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = {
        orgId: null,
        periodTimeType: '1',
        time: moment().subtract(1, 'days'),
      };
      this.handleQuery();
    },
  },
};
</script>