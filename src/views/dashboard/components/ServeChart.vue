<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../mixins/resize'

export default {
  name: 'ServeChart',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '450px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.chartData)
    },
    setOptions({ avgDistributionTimeChartResponse, goodRateLineChartResponse,initiativeAvgDistributionChartResponse, onlineDistributionChartResponse } = {}) {
      if(!avgDistributionTimeChartResponse) return
      const xAxisData = avgDistributionTimeChartResponse.numberList.map(item=>item.date)
      const getSeriesData =  (arr) => arr?.map( item=> item.number)
      const legend = ['服务好评率', '总平均配送时长', '自然订单平均配送时长', '在线数量']
      const colors =['#6160DC', '#FFB74A', '#54C5EB', '#FF4A55']
      const series = [goodRateLineChartResponse, avgDistributionTimeChartResponse, initiativeAvgDistributionChartResponse, onlineDistributionChartResponse ].map((item, index) => {
        const seriesItem = {
          name: legend[index], 
          itemStyle: {
            normal: {
              color: colors[index],
              lineStyle: {
                color: colors[index],
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          yAxisIndex: index,
          data: getSeriesData(item.numberList),
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }
        return seriesItem
      })
      this.chart.setOption({
        xAxis: {
          data: xAxisData,
          boundaryGap: true,
          axisTick: {
            show: false,
          }
        },
        grid: {
          left: 50,
          right: 80,
          bottom: 40,
          top: 40,
          containLabel: true,
          borderWidth: 0
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function (params) {
            let result = params[0].name;
            let suffixs = ['%', '分钟', '分钟', '人'];
            params.forEach(function (item) {
              result += "<br/>";
              result +=
                '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
                item.color +
                '"></span>';
              result += item.seriesName + "：";
              result += isNaN(item.value) ? 0 : item.value;
              result += suffixs[item.seriesIndex];
            });
            return result;
          },
          padding: [5, 10]
        },
        yAxis: [
          {
            type: 'value',
            name: '服务好评率\n(%)',
            position: 'left',
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[0]
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '总平均配送时长\n(分钟)',
            position: 'left',
            alignTicks: true,
            offset: 70,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[1]
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name:  '平均配送时长\n自然订单(分钟)',
            position: 'right',
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[2]
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '在线人数\n(人)',
            position: 'right',
            alignTicks: true,
            offset: 80,
            axisLine: {
              show: true,
              lineStyle: {
                color: colors[3]
              }
            },
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        legend: {
          data: legend,
          x: 'center',
          y: 'bottom',
          icon: 'rect',
          itemWidth: 24,
          itemHeight: 4,
          itemGap: 108,
        },
        series: series
      })
    }
  }
}
</script>
