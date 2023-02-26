<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>数据概况</span>
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
      <el-col :md="12" :lg="6" class="card-panel-col" v-for="[k, {title, value, icon, suffix, path}] in list" :key = "k">
        <jump :path="path" class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon :icon-class="icon" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{title}}</div>
            <div class="card-panel-num">{{value}}{{suffix}}</div>
          </div>
        </jump>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import { getOverviewList } from '@/api/home'
  import DateField from './components/DateField'
  import OrgField from './components/OrgField'
  import "moment/locale/zh-cn";
  import moment from "moment";

  import CountTo from 'vue-count-to'

  const dataMap = new Map([
    ['initiativeOrderUserNumber', {title: '自然下单人数', icon:'natural-user',  suffix: '', path:'/data/overview/people'}],
    ['promoteOrderUserNumber', {title: '推广下单人数', icon:'promotion-user',  suffix: '', path:'/data/overview/people'}],
    ['addNumber', {title: '新增粉丝数', icon:'new-fans',  suffix: '', path:'/data/overview/fan'}],
    ['onlineNumber', {title: '配送员在线人数', icon:'online-distributors',  suffix: '', path:'/data/overview/distributionAnalyze'}],
    ['pageViewVolume', {title: '浏览量', icon:'page-veiws',  suffix: '', path:'/data/overview/visitor'}],
    ['timeoutOrderRate', {title: '订单超时率', icon:'time-out-rate', suffix: '%', path:'/data/overview/overtimeOrder'}],
    ['registerNumber', {title: '新注册配送员', icon:'new-distributor', suffix: '', path:'/data/overview/distributionAnalyze'}],
    ['initiativeOrderNumber', {title: '自然订单数', icon:'natural-order', suffix: '', path:'/data/overview/orderSales'}],
    ['paymentConversionRate', {title: '支付转化率', icon:'pay-inversion-rate', suffix: '%', path:'/data/overview/conversionRates'}],
    ['clickConversionRate', {title: '点击转化率', icon:'click-inversion-rate', suffix:  '%', path:'/data/overview/conversionRates'}],
    ['promoteOrderNumber', {title: '推广订单数', icon:'promotion-order', suffix: '', path:'/data/overview/orderSales'}],
  ])
  
  export default {
    name: 'Overview',
    components: {
      DateField,
      OrgField,
      CountTo
    },
    data() {
      return {
        queryParams: {
          orgId: null,
          periodTimeType: '1',
          time: moment().subtract(1, 'days'),
        },
        list: []
      }
    },
    watch: {
      queryParams: {
        handler(val, oldVal) {
          this.getList()
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      /** 查询客户数据概况 */
      getList() {
        this.loading = true;
        getOverviewList(this.formatQuery(this.queryParams)).then((response) => {
          const data = response.data
          for(let [k,v] of Object.entries(data)) {
            if(!dataMap.has(k)) continue
            dataMap.set(k, {...dataMap.get(k), value: v})
          }
          this.list = [...dataMap]
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
    }
  }
</script>

<style lang="scss" scoped>
.panel-group {
  padding: 0 48px;
  .card-panel {
    margin: 20px 20px 20px 0;
    .card-panel-icon-wrapper {
      margin-right: 30px;
    }
  }
}
</style>