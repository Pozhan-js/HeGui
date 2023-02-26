<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>销售排名</span>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="10px"
      >
        <date-field :queryParams="queryParams" label='' />
      </el-form>
    </div>
    <div class="ranking-table">
      <el-row class="ranking-table-head">
        <el-col :span="5">排名</el-col>
        <el-col :span="9">市场名称</el-col>
        <el-col :span="10">销售额（万元）</el-col>
      </el-row>
      <div class="ranking-table-body">
        <el-row class="ranking-table-body-item" v-for="(item, index) in list" :key="index">
          <el-col :span="5">{{index+1}}</el-col>
          <el-col :span="9">{{item.shopName}}</el-col>
          <el-col :span="10">{{item.totalSalesAmount}}</el-col>
        </el-row>
      </div>
    </div>
    
  </el-card>
</template>

<script>
  import { getSalesAnalysisList } from '@/api/home'
  import DateField from './components/DateField'
  import "moment/locale/zh-cn";
  import moment from "moment";

  
  export default {
    name: 'RankingList',
    components: {
      DateField,
    },
    data() {
      return {
        queryParams: {
          orderByColumn: 'total_sales_amount',
          isAsc: 'desc',
          periodTimeType: '1',
          time: moment().subtract(1, 'days'),
          pageNum: 1,
          pageSize: 10,
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
        getSalesAnalysisList(this.formatQuery(this.queryParams)).then((response) => {
          this.list = response?.rows?.map(item=>{
            item.totalSalesAmount = this.toDecimal2(item.totalSalesAmount / 100 / 10000)
            return item
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
    }
  }
</script>

<style lang="scss" scoped>
.ranking-table {
  margin: -15px -10px;
  text-align: center;
  line-height: 32px;
  height: 352px;
  &-head {
    background: #FAFAFA;
    color: #333;
  }
  &-body-item:nth-child(2n) {
    background-color: #FAFAFA;
  }
}

</style>