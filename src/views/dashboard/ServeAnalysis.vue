<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>服务分析</span>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <org-field :queryParams="queryParams"/>
        <date-field :queryParams="queryParams"/>
      </el-form>
    </div>
    <el-row :gutter="40" class="panel-group">
      <el-col :md="12" :lg="6" class="card-panel-col" v-for="[k, item] in serveData" :key = "k">
        <div class="card-panel">
          <div v-if="k == 'goodServeRate'" class="card-panel-title">
            <Progress strokeColor="#6160DC" type="circle" :percent="item.value" :width="80" :strokeWidth="15">
              <template #format="percent">
                <span style="color: #6160DC; font-weight: 700">{{ percent }}%</span>
              </template>
            </Progress>
          </div>
           <div v-else-if="k == 'onlineDistribution'" class="card-panel-title pt10" >
             <span>{{item.value}}</span>
           </div>
           <div v-else class="card-panel-title pt10" >
            <span class="minutes">{{item.value.minutes}}</span>
            <span class="seconds">/{{item.value.seconds}}</span>
            <small>({{item.suffix}})</small>
          </div>
          <div class="card-panel-text">{{item.title}}</div>
          <div class="card-panel-foot" >
            <template v-if="queryParams.periodTimeType == '1'">
              <span>较上一日<span :style="{color: item.day.color}">{{item.compareLastDayRate}}%{{item.day.indicator}}</span> </span>
              <span>较上一周<span :style="{color: item.week.color}">{{item.compareLastWeekRate}}%{{item.week.indicator}}</span></span>
            </template>

            <template v-else-if="queryParams.periodTimeType == '2'">
              <span>环比<span :style="{color: item.ratio.color}">{{item.compareYoYRate}}%{{item.ratio.indicator}}</span> </span>
              <span>同比<span :style="{color: item.same.color}">{{item.compareMoMRate}}%{{item.same.indicator}}</span></span>
            </template>
          </div>
        </div>
      </el-col>
    </el-row>
    <serve-chart :chart-data="chartData" class="serve-chart" />
  </el-card>
</template>

<script>
  import { getServeList, getServerChart } from '@/api/home'
  import DateField from './components/DateField'
  import OrgField from './components/OrgField'
  import ServeChart from './components/ServeChart'
  import "moment/locale/zh-cn";
  import moment from "moment";
  import { Progress } from "ant-design-vue";
  
  export default {
    name: 'ServeAnalysis',
    components: {
      DateField,
      OrgField,
      ServeChart,
      Progress
    },
    data() {
      return {
        queryParams: {
          orgId: null,
          periodTimeType: '1',
          time: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
        },
        serveData: [],
        chartData: {},
      }
    },
    watch: {
      queryParams: {
        handler(val, oldVal) {
          this.init()
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      init() {
        this.getServeList()
        this.getServerChart()
      },
      /** 查询客户数据概况 */
      getServeList() {
        this.loading = true;
        getServeList(this.formatQueryForRate(this.queryParams)).then((response) => {
          const data  = response.data
          const map = new Map([
            ['goodServeRate', {title: '服务好评率', suffix: '%'}],
            ['avgDistributionTime', {title: '总平均配送时长', suffix: '分/秒'}],
            ['initiativeAvgDistributionTime', {title: '自然订单平均配送时长', suffix: '分/秒'}],
            ['onlineDistribution', {title: '在线数量', suffix: ''}],
          ])
          for(let [k, v] of Object.entries(data)) {
            if(!map.has(k)) continue
            v.day = {
              indicator: v.compareLastDayRate > 0 ? '↑' : '↓',
              color: v.compareLastDayRate > 0 ? '#F75656' : '#49D167'
            }
            v.week = {
              indicator: v.compareLastWeekRate > 0 ? '↑' : '↓',
              color: v.compareLastWeekRate > 0 ? '#F75656' : '#49D167'
            }
            v.ratio = {
              indicator: v.compareYoYRate > 0 ? '↑' : '↓',
              color: v.compareYoYRate > 0 ? '#F75656' : '#49D167'
            }
            v.same = {
              indicator: v.compareMoMRate > 0 ? '↑' : '↓',
              color: v.compareMoMRate > 0 ? '#F75656' : '#49D167'
            }
            if(map.get(k).suffix == '分/秒') v.value = {minutes : v.value/60 >>0, seconds: v.value % 60}
            map.set(k, {...map.get(k), ...v})
          }
          this.serveData = [...map]
          this.loading = false;
        });
      },

      getServerChart() {
        this.loading = true;
        getServerChart(this.formatQuery(this.queryParams)).then((response) => {
          if(response.data?.length==0) return
          const data = response.data
          const formatSecond = (arr) => arr.map(item => {
           item.number = item.number / 60 >> 0
           return item
          })
          data.avgDistributionTimeChartResponse.numberList = formatSecond(data.avgDistributionTimeChartResponse.numberList)
          data.initiativeAvgDistributionChartResponse.numberList = formatSecond(data.initiativeAvgDistributionChartResponse.numberList)
          this.chartData = response.data
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
          params.periodBeginTime = moment(param.time).subtract(1, 'month').startOf('day').format('YYYY-MM-DD 00:00:00');
          params.periodEndTime = moment(param.time).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        } else if (param.periodTimeType == 2) {
          params.periodBeginTime = moment(param.time).subtract(1, 'year').endOf('month').format('YYYY-MM-DD 00:00:00');
          params.periodEndTime = moment(param.time).endOf('month').format('YYYY-MM-DD HH:mm:ss');
        }
        return params
      },
      /**
       * 环比查询格式化
       */
      formatQueryForRate(param) {
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
        }
        return params
      },
    }
  }
</script>

<style lang="scss" scoped>
.serve-chart {
  padding-bottom: 35px;
}
.panel-group {
  padding: 13px 20px 15px;
  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel {
    flex-direction: column; 
    .card-panel-title {
      height: 80px;
      margin-bottom: 24px;
      font-size: 36px;
      font-weight: 700;
      color: #1A55AF;
      &.pt10{
        padding-top: 10px;
      }
      .seconds {
        font-size: 24px;
      }
      small {
        margin-left: 6px;
        font-size: 14px;
      }
    }
    .card-panel-text {
      margin-bottom: 5px;
      font-size: 18px;
    }
    .card-panel-num {
      font-size: 20px;
    }
    .card-panel-foot {
      &>span+span{
        margin-left: 20px;
      }
    }
  }
}

</style>