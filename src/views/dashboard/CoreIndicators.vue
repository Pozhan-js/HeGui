<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>核心指标</span>
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
    <swiper class="swiper" :options="swiperOption" style="padding: 20px 0 3px;">
      <swiper-slide class="swiper-slide-item" v-for="item in list" :key="item.title">
        <div class="card-panel text-center"> 
          <div>{{item.title}}</div>
          <div class="number-main">{{item.value}}</div>
          <div class="card-panel-foot" >
            <template v-if="queryParams.periodTimeType == '1'">
              <span>较上一日<span :class="`indeicator_${item.day.type}`">{{item.day.value}}%{{item.day.indicator}}</span></span>
              <span>较上一月<span :class="`indeicator_${item.moon.type}`">{{item.moon.value}}%{{item.moon.indicator}}</span></span>
            </template>
            <template v-else>
              <span>同比<span :class="`indeicator_${item.same.type}`">{{item.same.value}}%{{item.same.indicator}}</span></span>
              <span>环比<span :class="`indeicator_${item.ratio.type}`">{{item.ratio.value}}%{{item.ratio.indicator}}</span></span>
            </template>
          </div>
        </div>
      </swiper-slide>
      <div class="swiper-button-prev" slot="button-prev" ></div>
      <div class="swiper-button-next" slot="button-next"></div>
    </swiper>
  </el-card>
</template>

<script>
  import { getCoreIndicators } from '@/api/home'
  import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
  import 'swiper/css/swiper.css'
  import DateField from './components/DateField'
  import OrgField from './components/OrgField'
  import "moment/locale/zh-cn";
  import moment from "moment";
  const cardValue = require('@/views/data/salesanalyze/coreIndicators/card.json')
  
  export default {
    name: 'CoreIndicators',
    components: {
      Swiper,
      SwiperSlide,
      DateField,
      OrgField
    },
    data() {
      return {
        swiperOption : {
          slidesPerView: 6,
          spaceBetween: 5,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: { 
            320: {  //当屏幕宽度大于等于320
              slidesPerView: 1,
              // spaceBetween: 10
            },
            768: {  //当屏幕宽度大于等于768 
              slidesPerView: 3,
              // spaceBetween: 20
            },
            980: {  //当屏幕宽度大于等于768 
              slidesPerView: 4,
              // spaceBetween: 20
            },
            1280: {  //当屏幕宽度大于等于1280
              slidesPerView: 5,
              // spaceBetween: 30
            },
            1980: {  //当屏幕宽度大于等于1280
              slidesPerView: 6,
              // spaceBetween: 30
            }
          }
        },
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
      /** 查询核心数据列表 */
      getList() {
        this.loading = true;
        getCoreIndicators(this.formatQuery(this.queryParams)).then((response) => {
          const data = response.data
          const dataListKey = {1: 'dayCard', 2: 'moonCard'}[this.queryParams.periodTimeType]
          this.list = cardValue[dataListKey].map(item => {
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
                indicator: data[item.key].compareLastDayRate > 0 ? '↑' : '↓',
                type: data[item.key].compareLastDayRate > 0 ? 'top' : 'bottom'
              },
              moon: {
                value: data[item.key].compareLastMonthRate,
                indicator: data[item.key].compareLastMonthRate > 0 ? '↑' : '↓',
                type: data[item.key].compareLastMonthRate > 0 ? 'top' : 'bottom'
              },
              ratio: {
                value: data[item.key].compareYoYRate,
                indicator: data[item.key].compareYoYRate > 0 ? '↑' : '↓',
                type: data[item.key].compareYoYRate > 0 ? 'top' : 'bottom'
              },
              same: {
                value: data[item.key].compareMoMRate,
                indicator: data[item.key].compareMoMRate > 0 ? '↑' : '↓',
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
        }
        return params
      },
    }
  }
</script>

<style lang="scss" scoped>
.card-panel{
  padding-bottom: 10px;
  &_foot{
    font-size: 12px;
  }
  .number-main{
    line-height: 1.8;
    font-size: 24px;
    font-size: 700;
    color: #333;
  }
}

.indeicator_bottom{
  color:rgba($color: green, $alpha: 0.6);
}
.indeicator_top{
  color: rgba($color: red, $alpha: 0.6)
}
.swiper-button-prev {
  left: -10px;
}
.swiper-button-next{
  right: -10px;
}
.swiper-button-prev, .swiper-button-next{
  color:rgba($color: #000, $alpha: 0.6);
}
.swiper-button-prev:after, .swiper-button-next:after {
  font-size: 14px;
}
.swiper-slide-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: -4px;
  height: 100%;
  width: 1px; 
  background: #ccc;
}
.swiper-slide-item:last-child::after {
  background: transparent;
}
.card-panel-foot {
  display: flex;
  justify-content: center;
  &>span+span {
    margin-left: 10px;
  }
}
</style>