<template>
  <div>
    <div
      id="mapFencecontainer"
      class="mapBox"
      style="width: 100%; height: 100%; position: absolute"
    />
    <div v-loading="disabled" class="group">
      <div class="left">
        <div class="back" style="background: green;" @click="handleGroup('status')">状态</div>
        <div class="back" style="margin: 3px 0; background: yellow;" @click="handleGroup('order_num')">单量</div>
        <div class="back" style="background: goldenrod;" @click="handleGroup('order')">订单</div>
      </div>
      <div class="right">
        <div class="back" style="margin-top: 2px;" @click="handleGroup(null,'day')">日</div>
        <!-- @click="handleGroup(null,'week')" -->
        <div class="back" style="margin-top: 2px;background: #e6e6e6;">周</div>
      </div>
    </div>
    <div class="dis-container">
      <el-card class="dis-top" shadow="always" :body-style="{ padding: '5px 10px' }">
        <Cascader
          v-model="orgId"
          :options="orgOptions"
          style="width: 100%;"
          change-on-select
          expand-trigger="hover"
          :allow-clear="false"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @change="(e) => {
            if (e !== null && homeQueryType !== 'status') {
              onInquire()
            }
          }"
        />
        <div v-if="homeQueryType === 'status'" style="padding: 10px 0px 0 5px;">
          配送员：<el-switch v-model="distributionOpen" />
        </div>
      </el-card>
      <el-card v-if="distributionOpen && homeQueryType === 'status'" v-loading="distributionLoading" class="dis-main" shadow="always" :body-style="{ padding: '15px 10px' }">
        <div>
          <el-input
            v-model="queryCondition"
            placeholder="请输入配送员信息"
            clearable
            size="small"
            style="width: 72%;"
          >
            <el-button slot="append" type="primary" icon="el-icon-search" @click="onInquire">搜索</el-button>
          </el-input>
          <span style="margin: 0 8px;font-size: 12px">开启实时位置</span><el-checkbox v-model="renew" @change="hanldeRenew" />
        </div>
        <p style="margin: 8px 0;font-size: 15px">当前在线人数：<span style="color: #f6953c">{{ onlineNum }}人</span></p>
        <div class="dis-list">
          <p
            v-for="(item, index) in distribution"
            :key="index"
            class="dis-item"
            @click="handleDis(item)"
          >
            <span class="dot" :class="'dot_' + item.color" />
            {{ item.distributionName }}
          </p>
        </div>
      </el-card>
    </div>
    <el-dialog
      title="配送员详情"
      :visible.sync="open"
      width="800px"
      append-to-body
    >
      <el-row style="font-size: 15px">
        <el-col :span="4" style="text-align: end">姓名：</el-col>
        <el-col :span="20">{{ data.distributionName }}</el-col>
      </el-row>
      <el-row style="line-height: 40px; font-size: 15px">
        <el-col :span="4" style="text-align: end">最后上报时间：</el-col>
        <el-col :span="20">{{ data.locationTime }}</el-col>
      </el-row>
      <el-row style="font-size: 15px; margin-bottom: 10px">
        <el-col :span="4" style="text-align: end">经纬度：</el-col>
        <el-col :span="20">{{ data.lat }}——{{ data.lng }}</el-col>
      </el-row>
      <el-row>
        <!-- <el-col :span="4" style="text-align: end;font-size: 15px;">库存：</el-col> -->
        <!-- <el-col :span="20"> -->
        <el-table :data="data.list">
          <el-table-column label="图片" align="center" prop="thumbnail">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.thumbnail"
                :z-index="3000"
                style="width: 40px; height: 40px"
                :src="prefix + scope.row.thumbnail"
                :preview-src-list="
                  scope.row.thumbnail.split(',').map((item) => prefix + item)
                "
              />
            </template>
          </el-table-column>
          <el-table-column label="名称" align="center" prop="goodsName" />
          <el-table-column label="价格" align="center" prop="price">
            <template slot-scope="scope">
              {{ scope.row.price && toDecimal2(scope.row.price / 100) }}
            </template>
          </el-table-column>
          <el-table-column label="库存" align="center" prop="stock" />
        </el-table>
        <!-- </el-col> -->
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getDistribution, getGoodsstock } from '@/api/menu'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getGeofenceFence } from '@/api/merchant/geofence'
import { flatten, searchSuperior } from '@/utils/array'
import moment from 'moment'

export default {
  components: {
    Cascader
  },
  props: ['parentmsg'],
  data() {
    return {
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      map: null,
      distancePolyline: null,
      label: null,
      lastInfo: null,
      // 配送员modal框
      distributionOpen: true,
      // 是否显示弹出层
      open: false,
      data: {},
      // 当前定位位置
      latLng: null,
      renew: false,
      // 定时器
      interval: null,
      // 标点数组
      markersArray: [],
      // 配送员
      distribution: [],
      distributionLoading: false,
      // 区域围栏
      polyline: null,
      // 组织数据
      orgOptions: [],
      // 选中组织
      orgId: null,
      // 配送员
      queryCondition: null,
      // 围栏
      fncPolyline: [],
      // 查询参数
      inquireParams: {},
      // 时间类型
      timeType: 'day',
      // 查询类型 状态:status 单量:order_num 订单:order
      homeQueryType: 'status',
      markerClusterer: null,
      disabled: false
    }
  },
  computed: {
    onlineNum() {
      return this.distribution.filter(item => item.color === 'green').length
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  mounted() {
    this.init()
    // this.handleGroup()
  },
  destroyed() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    // 地图初始化
    init() {
      const map = new qq.maps.Map(
        document.getElementById('mapFencecontainer'),
        {
          center: new qq.maps.LatLng(28.23529, 112.93134),
          zoom: 11,
          // 平移控件的初始启用/停用状态。
          panControl: false,
          // 缩放控件的初始启用/停用状态。
          zoomControl: false
        }
      )
      this.map = map
      const drawingManager = new qq.maps.drawing.DrawingManager({
        drawingMode: qq.maps.drawing.OverlayType.null,
        drawingControl: true,
        drawingControlOptions: {
          position: qq.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            qq.maps.drawing.OverlayType.POLYLINE
          ]
        },
        circleOptions: {
          fillColor: new qq.maps.Color(255, 208, 70, 0.3),
          strokeColor: new qq.maps.Color(88, 88, 88, 1),
          strokeWeight: 3,
          clickable: false
        },
        PolylineOptions: {
          strokeLinecap: 'square'
        }
        // polylinecomplete:getPolylinecomplete(qq.maps.Polyline),
      })
      drawingManager.setMap(map)
      // 当一个折线覆盖物绘制完成时，触发此事件
      qq.maps.event.addListener(drawingManager, 'polylinecomplete', (event) => {
        const polylineLatLng = event.getPath()
        const start = new qq.maps.LatLng(polylineLatLng.elems[0].lat, polylineLatLng.elems[0].lng)
        const end = new qq.maps.LatLng(polylineLatLng.elems[polylineLatLng.length - 1].lat, polylineLatLng.elems[polylineLatLng.length - 1].lng)
        // 计算距离
        const distance = qq.maps.geometry.spherical.computeDistanceBetween(start, end)
        event.setVisible(false)
        if (this.distancePolyline) {
          this.distancePolyline.setVisible(false)
          this.label.setVisible(false)
        }
        this.label = new qq.maps.Label({
          position: end,
          map: map,
          content: parseInt(distance) + '米'
        })
        this.distancePolyline = new qq.maps.Polyline({
          // 折线是否可点击
          clickable: true,
          map: map,
          // 折线的路径
          path: [start, end],
          // 折线的宽度
          strokeWeight: 3,
          // 折线末端线帽的样式
          strokeLinecap: 'square',
          // 折线是否可见
          visible: true,
          // 折线的zIndex
          zIndex: 1000
        })
      })
      const citylocation = new qq.maps.CityService()
      // 请求成功回调函数
      citylocation.setComplete((result) => {
        this.latLng = result.detail.latLng
        map.setCenter(result.detail.latLng)
        this.getDis({ ...result.detail.latLng })
        this.getFence(result.detail.latLng)
      })

      citylocation.setError(function() {
        this.msgError('定位失败，默认位置为长沙市！')
      })
      if (!this.$route.query.type) {
        citylocation.searchLocalCity()
      } else {
        const orgArr = flatten(this.orgOptions, 'children')
        this.orgId = searchSuperior(this.$route.query.orgId, 'id', orgArr, 'parentId')
        this.getDis({ orgId: this.$route.query.orgId })
        this.getFence({ orgId: this.$route.query.orgId })
      }

      qq.maps.event.addListener(map, 'click', (event) => {
        this.map.setCenter(event.latLng)
        this.getDis(event.latLng)
        this.getFence(event.latLng)
        this.queryCondition = null
        // map.setZoom(13)
      })
    },
    getDis(latLng) {
      if (this.markersArray.length > 0) {
        this.markersArray.map((item) => {
          item.setMap(null)
        })
      }
      if (this.markerClusterer) {
        this.markerClusterer.clearMarkers()
      }
      const params = {
        ...latLng,
        homeQueryType: this.homeQueryType,
        periodBeginTime: this.timeType === 'day' ? moment().startOf('day').format('YYYY-MM-DD HH:mm:ss') : moment().weekday(0).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        periodEndTime: this.timeType === 'day' ? moment().endOf('day').format('YYYY-MM-DD HH:mm:ss') : moment().weekday(6).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      getDistribution(params).then((res) => {
        if (res.code !== 200) {
          return this.warning(res.msg)
        }
        let distribution = []
        let markArr = []
        distribution = res.data.statusList
        markArr = res.data
        this.latLng = latLng
        if (this.homeQueryType === 'status') {
          this.distribution = distribution
          this.markersArray.map((item) => {
            item.setMap(null)
          })
          if (this.markerClusterer) {
            this.markerClusterer.clearMarkers()
          }
          // this.polyline?.setMap(null);
          this.setMarker(markArr.statusList.map(item => {
            return {
              ...item,
              icon: new qq.maps.MarkerImage(
                `../punctuation/punctuation_${item.color}.png`,
                new qq.maps.Size(35, 35),
                new qq.maps.Point(0, 0),
                new qq.maps.Point(21, 45),
                new qq.maps.Size(35, 35)
              )
            }
          }))
          this.distributionLoading = false
        } else if (this.homeQueryType === 'order' || this.homeQueryType === 'order_num') {
          const size = new qq.maps.Size(40, 40)
          const origin = new qq.maps.Point(3, 3)
          let day = 1
          if (this.timeType === 'week') {
            day = moment().day() === 0 ? 7 : moment().day()
          }
          const MVCArray = new qq.maps.MVCArray()
          const Styles = [{
            icon: new qq.maps.MarkerImage(``, new qq.maps.Size(50, 50), new qq.maps.Point(0, 0), new qq.maps.Point(0, 0)),
            text: new qq.maps.MarkerDecoration('<div class="polymeric" style="width: 50px;height: 50px;font-size: 20px;font-weight: bold;line-height: 50px;text-align: center;border-radius: 100px;background: rgba(2, 167, 240, 0.65);">{num}</div>', new qq.maps.Point(-0, -0))
          }]
          if (this.homeQueryType === 'order_num') {
            this.setMarker(res.data.orderNumList.map(item => {
              let color = ''
              if (item.orderNum <= (16 * day)) {
                color = 'yellow'
              } else if (item.orderNum > (16 * day) && item.orderNum <= (27 * day)) {
                color = 'green'
              } else if (item.orderNum > (27 * day)) {
                color = 'purple'
              }
              return {
                ...item,
                icon: new qq.maps.MarkerImage(`../punctuation/diamond_${color}.png`, new qq.maps.Size(35, 35),
                  new qq.maps.Point(0, 0),
                  new qq.maps.Point(21, 45),
                  new qq.maps.Size(35, 35))
              }
              // const icon = new qq.maps.MarkerImage(`../punctuation/diamond_${color}.png`, size, origin)
              // const marker = new qq.maps.Marker({
              //   icon: icon,
              //   map: this.map,
              //   position: new qq.maps.LatLng(item.lat, item.lng)
              // })
              // MVCArray.push(marker)
            })
            )
          } else {
            res.data.orderList.map(item => {
              let color = ''
              if (item.orderNum > 5) {
                color = 'yellow'
              } else {
                if (item.statusFlag === 'normal') {
                  color = 'green'
                } else if (item.statusFlag === 'exception' || item.statusFlag === 'distribution_ing') {
                  color = 'red'
                }
              }

              const icon = new qq.maps.MarkerImage(`../punctuation/point_${color}.png`, size, origin)
              const marker = new qq.maps.Marker({
                icon: icon,
                map: this.map,
                position: new qq.maps.LatLng(item.lat, item.lng)
              })
              MVCArray.push(marker)
            })
            this.markerClusterer = new qq.maps.MarkerCluster({
              map: this.map,
              minimumClusterSize: 2, // 默认2
              markers: MVCArray,
              zoomOnClick: true, // 默认为true
              gridSize: 60, // 默认60
              averageCenter: false, // 默认false
              maxZoom: 18, // 默认18
              styles: Styles
            })
          }
        }
      })
    },
    getFence(params) {
      getGeofenceFence(params).then(res => {
        this.polyline?.setMap(null)
        this.fncPolyline.map(item => {
          item?.setMap(null)
        })
        this.fencePoltline = shopGeofence
        const shopGeofence = JSON.parse(res.shopGeofence)
        // this.map.setCenter(new qq.maps.LatLng(shopGeofence[0].lat, shopGeofence[0].lng))
        // this.map.setZoom(11)
        const orgArr = flatten(this.orgOptions, 'children')
        this.orgId = searchSuperior(res.orgId, 'id', orgArr, 'parentId')
        this.polyline = new qq.maps.Polyline({
          path: shopGeofence.concat([shopGeofence[0]]).map(item => new qq.maps.LatLng(item.lat, item.lng)),
          strokeColor: '#000000',
          strokeWeight: 3,
          map: this.map
        })
        this.fncPolyline = res.geofenceList.map(item => {
          let color = '#1890ff'
          if (this.$route.query) {
            if (this.$route.query.geofenceId === item.geofenceId) {
              color = 'ff0000'
            }
          }
          const data = JSON.parse(item.polygon)
          return new qq.maps.Polyline({
            path: data.concat([data[0]]).map(item => new qq.maps.LatLng(item.lat, item.lng)),
            strokeColor: color,
            strokeDashStyle: 'dash',
            strokeWeight: 3,
            map: this.map
          })
        })
      })
    },
    onInquire() {
      this.distributionLoading = true
      const orgId = this.orgId[this.orgId.length - 1]
      this.getDis({ orgId, queryCondition: this.queryCondition })
      this.getFence({ orgId })
    },
    /** 设置标点 */
    setMarker(markerArr) {
      if (!markerArr) return
      markerArr?.map((item, index) => {
        const marker = new qq.maps.Marker({
          icon: item.icon,
          position: new qq.maps.LatLng(item.lat, item.lng),
          map: this.map
        })

        // qq.maps.event.addListener(marker, "mouseover", (event) => {
        //   console.log(event)
        // })

        if (this.homeQueryType === 'status') {
          qq.maps.event.addListener(marker, 'click', (event) => {
            getGoodsstock({ distributionId: item.distributionId }).then((res) => {
              this.open = true
              this.data = {
                ...res.data,
                lat: item.lat,
                lng: item.lng
              }
            })
          })
        }

        // qq.maps.event.addListener(marker, "mouseover", () => {
        //   alert("您执行了mouseover事件");
        // });
        this.markersArray = this.markersArray.concat([marker])
      })
      // if (markerArr.borderFence) {
      //   let fenceData = JSON.parse(markerArr.borderFence)
      //   this.polyline = new qq.maps.Polyline({
      //     path: fenceData.concat([fenceData[0]]).map(item => new qq.maps.LatLng(item.lat, item.lng)),
      //     strokeColor: '#000000',
      //     strokeWeight: 3,
      //     map: this.map,
      //   });
      // }
    },
    /** 实时更新位置 */
    hanldeRenew(val) {
      if (val) {
        this.interval = setInterval(() => {
          if (this.markersArray.length) {
            this.markersArray.map((item) => {
              item.setMap(null)
            })
          }
          this.markersArray = []
          this.getDis(this.latLng)
        }, 60000)
      } else {
        clearInterval(this.interval)
      }
    },
    /** 点击列表配送员 */
    handleDis(item) {
      this.map.setCenter(new qq.maps.LatLng(item.lat, item.lng))
      this.map.setZoom(24)
      getGoodsstock({ distributionId: item.distributionId }).then((res) => {
        this.open = true
        this.data = {
          ...res.data,
          lat: item.lat,
          lng: item.lng
        }
      })
    },
    handleGroup(value, time) {
      if (this.homeQueryType === value) return
      this.disabled = true
      if (value === 'status') {
        this.renew = false
      }
      if (value) {
        this.homeQueryType = value
        this.timeType = 'day'
      }
      if (time) {
        this.timeType = time
      }
      // timeType: null,
      // 状态:status 单量:order_num 订单:order
      // queryType: null
      // this.getDis({ ...result.detail.latLng, homeQueryType: 'order', periodBeginTime: moment().weekday(1).startOf('day').format('YYYY-MM-DD HH:mm:ss'), periodEndTime: moment().weekday(7).endOf('day').format('YYYY-MM-DD HH:mm:ss') })
      // this.map.setZoom(13)
      this.getDis(this.latLng)
      if (this.interval) {
        clearInterval(this.interval)
      }
      setTimeout(() => {
        this.disabled = false
      }, 5000)
    }
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/styles/variables.scss";

.mapBox {
  position: relative;
  .mapBtn {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 999;
  }
}

/deep/ .info_master {
  margin: 10px;
  .info_title {
    width: 115px;
    text-align: end;
  }
}

.dis-container {
  position: absolute;
  top: 40px;
  left: 35px;
  width: 415px;
  padding: 10px;
  .dis-top {
    margin-bottom: 15px;
  }
  .dis-main {
    /deep/ .el-input-group .el-input-group__append {
      overflow: hidden;
      color: #fff;
      background-color: $primary;
      border-color: $primary;
    }
    /deep/ .el-checkbox__input.is-focus .el-checkbox__inner {
      border-color: $primary;
    }
    /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: $primary !important;
      border-color: $primary;
    }
    /deep/ .el-checkbox__input .el-checkbox__inner:hover {
      border-color: $primary;
    }
  }
  .dis-main .dis-list {
    display: grid;
    grid-template-columns: repeat(3, 30.3%);
    grid-column-gap: 15px;
    grid-row-gap: 10px;
    max-height: 280px;
    overflow-y: auto;
    .dis-item {
      height: 45px;
      margin: 0;
      line-height: 45px;
      box-sizing: content-box;
      border-radius: 5px;
      text-align: center;
      cursor: pointer;
      border: 1px solid #efefef;
      color: #515a6e;
      .dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 3px;
        position: relative;
        top: -1px;
        border-radius: 50%;
        &.dot_gray {
          background: #c1c1c1;
        }
        &.dot_green {
          background: #49d167;
        }
        &.dot_red {
          background: #f75656;
        }
      }
    }
  }
}
.group {
  position: absolute;
  right: 10px;
  top: 40px;
  display: flex;
  width: 130px;
  .left {
    width: 80px;
    .back {
      text-align: center;
      font-size: 14px;
      padding: 5px;
      color: #333;
      cursor: pointer;
    }
  }

  .right {
    margin-left: 5px;
    width: 45px;
    .back {
      width: 45px;
      height: 45px;
      background: rgba(2, 167, 240, 0.65);
      text-align: center;
      line-height: 45px;
      cursor: pointer;
    }
  }
}
</style>
