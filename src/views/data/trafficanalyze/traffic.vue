<style lang="scss" scoped>
.bar-container {
  padding-top: 30px;
  min-height: 700px;
  min-width: 400px;
}

.orders {
  padding: 10px 0;
  font-size: 18px;
  font-weight: 700;
}

.pageview {
  display: flex;
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;

  .map {
    flex: 1;
  }

  .pie {
    flex: 1;
  }
}
</style>

<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <OrgSelect v-model="queryParams.orgId" @query="handleQuery" />
      </el-form-item>
      <el-form-item label="统计时间" prop="periodBeginTime">
        <RangePicker
          :clearable="false"
          size="small"
          :s-time.sync="queryParams.periodBeginTime"
          :e-time.sync="queryParams.periodEndTime"
          placeholder="选择时间维度"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <div class="content">
      <div class="pageview">
        <div ref="map" class="map" />
        <div ref="mapPie" class="pie" />
      </div>
      <div style="height: 20px" />
      <pro-table
        ref="shopTable"
        :params="queryParams"
        title="市场流量"
        api="/customerTrafficDataStatistics/shop"
        :columns="{
          orgName: '组织',
          pageViewVolume:'浏览量',
          visitorVolume: '访客量',
          goodsPageViewVolume: '商品浏览量',
          goodsVisitorVolume: '商品访客量'
        }"
      />
      <div style="height: 20px" />
      <pro-table
        ref="goodsTable"
        :params="queryParams"
        title="商品流量"
        api="/customerTrafficDataStatistics/goods"
        :columns="{
          goodsName: '商品名',
          pageViewVolume:'浏览量',
          visitorVolume: '访客量',
        }"
      />
    </div>
  </div>
</template>

<script>
import OrgSelect from '@/components/OrgSelect'
import ProTable from '@/components/ProTable'
import { customerTrafficDataStatistics } from '@/api/data/traffic'
import { sum } from 'lodash'
import { Message } from 'element-ui'
import moment from 'moment'

export default {
  name: 'Services',
  components: {
    ProTable,
    OrgSelect
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        orgId: null,
        periodBeginTime: moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      totalOrder: 0
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      this.pieChart = this.$echarts.init(this.$refs.mapPie)
      this.map = new qq.maps.Map(this.$refs.map, {
        zoom: 12,
        disableDefaultUI: true
      })
      const citylocation = new qq.maps.CityService()
      citylocation.searchLocalCity()
      citylocation.setComplete((result) => {
        const center = new qq.maps.LatLng(result.detail.latLng.lat, result.detail.latLng.lng)
        this.map.panTo(center)
        this.centerMarker = new qq.maps.Marker({
          map: this.map,
          position: this.map.getCenter()
        })
        this.latLng = center
        this.queryPieCharts()
        qq.maps.event.addListener(this.map, 'click', e => {
          this.latLng = e.latLng
          this.queryPieCharts()
          this.map.panTo(e.latLng)
          this.centerMarker.setPosition(e.latLng)
        })
      })
    },
    setPieCharts(data) {
      const total = sum(data.map(i => +i.pageViewVolume))
      this.pieChart.setOption({}, true)
      this.pieChart.setOption({
        tooltip: {
          formatter: '{b} 浏览量：{c} {d}%'
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: '20%',
          formatter: (name) => {
            const series = this.pieChart.getOption().series[0]
            const value = series.data.filter(row => row.name === name)[0].value
            return name + ': 浏览量 ' + value + `  ${(value / total * 100).toFixed(2)}%`
          }
        },
        series: {
          type: 'pie',
          radius: '60%',
          center: ['30%', '50%'],
          data: data.map(i => ({
            value: i.pageViewVolume,
            name: i.orgName
          }))
        }
      }, true)
    },
    queryPieCharts() {
      if (!this.latLng) return
      customerTrafficDataStatistics({
        ...this.queryParams,
        'longitudeLatitude.lat': this.latLng.lat,
        'longitudeLatitude.lng': this.latLng.lng
      }).then(res => {
        if (res.code === 501) {
          Message({
            message: res.subMsg,
            type: 'error',
            duration: 5 * 1000
          })
        }
        this.setPieCharts(res.data?.customerTrafficList ?? [])
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.$refs.shopTable.refresh()
      this.$refs.goodsTable.refresh()
      this.queryPieCharts()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
