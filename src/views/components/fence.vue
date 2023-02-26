<template>
  <div :style="{height: `${height}px`}">
    <div
      id="mapFencecontainer"
      class="mapBox"
      style="width: 100%; height: 100%; position: absolute"
    >
      <div v-if="showSub" class="mapBtn">
        <!-- <el-button size="small" type="danger" @click="delpolygon()">删除多边形</el-button> -->
        <el-button
          size="small"
          type="danger"
          @click="clearOverlays()"
        >清除</el-button>
        <el-button
          size="small"
          type="primary"
          @click="resetOverlays"
        >重置</el-button>
      </div>
    </div>
    <!-- <p>给地图绑定了点击事件，当点击地图时，会在点击位置显示Marker。</p> -->
  </div>
</template>

<script>
import { virtualHasShelves } from '@/api/merchant/geofence'

export default {
  name: 'Fence',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    redundantFence: {
      type: Array,
      default: () => []
    },
    dashFence: {
      type: Array,
      default: () => []
    },
    positioning: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 800
    },
    showSub: {
      type: Boolean,
      default: true
    },
    zoom: {
      type: Number,
      default: 11
    },
    expansion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: null,
      marker: null,
      citylocation: null,
      polygon: null,
      drawingManager: null,
      lngLat: null,
      markersArray: [],
      overlaysArray: [],
      path4: [],
      arr: this.data.concat([]),
      expansionDashline: null
    }
  },
  watch: {
    data(val, oldVal) {
      this.resetOverlays()
    },
    redundantFence(val, oldVal) {
      this.resetOverlays()
    },
    dashFence(val, oldVal) {
      this.resetOverlays()
    },
    positioning(val, oldVal) {
      this.resetOverlays()
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 子组件给父组件传值(确认按钮)
    sendLngLat() {
      // console.log(this.lngLat,this.path4,this.overlaysArray)
      if (this.lngLat === undefined) {
        this.lngLat = this.path4
      }
      // console.log(this.polygon.path.elems)
      return this.polygon.path.elems.length === 0 ? this.lngLat : this.polygon.path.elems
    },
    // 地图初始化
    init() {
      this.map = new qq.maps.Map(document.getElementById('mapFencecontainer'), {
        center: new qq.maps.LatLng(this.positioning[0], this.positioning[1]),
        // center: new qq.maps.LatLng(39.871481, 116.384836), // 暂时默认
        zoom: this.zoom
      })

      // 标注的生成与回显
      // this.addMarker(new qq.maps.LatLng(30.925788712587014, 103.8922119140625)); // 初始化回显标注
      // this.markerOnly();
      // 多边形绘制及回显
      // 设置多边形路径以便回显
      // path4 = [];

      this.arr.forEach((item) => {
        this.path4.push(new qq.maps.LatLng(item.lat, item.lng))
      })

      this.showpolygon(this.path4)
      // 绘制
      this.addpolygon()
      if (this.redundantFence.length > 0) {
        this.redundantFence.map(item => {
          this.addPolyline(item.map(dataItem => new qq.maps.LatLng(dataItem.lat, dataItem.lng)))
        })
      }
      if (this.dashFence.length > 0) {
        this.dashFence.map(item => {
          this.addDashline(item.concat([item[0]]).map(dataItem => new qq.maps.LatLng(dataItem.lat, dataItem.lng)))
        })
      }
      if (this.expansion && this.data.length > 0 && this.path4.length > 0) {
        virtualHasShelves({ hasShelves: JSON.stringify(this.data) }).then(res => {
          if (JSON.parse(res.data.virtualHasShelves).length > 0) {
            this.addExpansionDashline(JSON.parse(res.data.virtualHasShelves).concat(JSON.parse(res.data.virtualHasShelves)[0]).map(item => {
              return new qq.maps.LatLng(item.lat, item.lng)
            }))
          }
        })
      }
    },
    // 添加监听事件 获取鼠标单击事件（仅留一个标注点）
    markerOnly() {
      qq.maps.event.addListener(this.map, 'click', function(event) {
        this.addMarker(event.latLng)
        qq.maps.event.addListener(this.map, 'click', function(event) {
          this.deleteOverlays() // 删除原有标注仅留下一个
          this.marker = new qq.maps.Marker({
            position: event.latLng,
            map: this.map
          })
        })
        var gps = event.latLng.getLat() + ',' + event.latLng.getLng() // 解析出来的点方便给后端
      })
    },
    addPolyline(path) {
      new qq.maps.Polyline({
        path: path,
        strokeColor: '#000000',
        strokeWeight: 2,
        map: this.map
      })
    },
    // 绘制虚线
    addDashline(path) {
      console.log(path)
      new qq.maps.Polyline({
        path: path,
        strokeDashStyle: 'dash',
        strokeColor: '#000000',
        strokeWeight: 2,
        map: this.map
      })
    },
    // 绘制虚线
    addExpansionDashline(path) {
      this.expansionDashline = new qq.maps.Polyline({
        path: path,
        strokeDashStyle: 'dash',
        strokeColor: '#f75656',
        strokeWeight: 2,
        map: this.map
      })
    },
    // 添加标记
    addMarker(location) {
      this.deleteOverlays()
      var marker = new qq.maps.Marker({
        position: location,
        map: this.map
      })
      markersArray.push(marker)
    },
    // 删除标记
    deleteOverlays() {
      if (this.markersArray) {
        // for (i in markersArray) {
        for (var i = 0; i < this.markersArray.length; i++) {
          this.markersArray[i].setMap(null)
        }
        this.markersArray.length = 0
      }
      if (this.marker !== undefined) {
        this.marker.setMap(null)
      }
    },
    /**
     * 多边形绘制
     */
    // 绘制
    addpolygon() {
      this.drawingManager = new qq.maps.drawing.DrawingManager({
        drawingMode: null, // 默认选中多边形绘制
        drawingControl: true,
        selectMode: true,
        snapMode: true,
        drawingControlOptions: {
          position: qq.maps.ControlPosition.TOP_CENTER,
          //   drawingModes: [
          //     qq.maps.drawing.OverlayType.POLYGON
          //   ]
          // 表头显示区域
          drawingModes: [qq.maps.drawing.OverlayType.POLYGON]
        },
        markerOptions: {
          visible: false
        },
        // 多边形样式
        polygonOptions: {
          editable: true,
          strokeColor: new qq.maps.Color(202, 67, 58, 0.8),
          fillColor: new qq.maps.Color(202, 67, 58, 0.1),
          clickable: false
        },
        // 圆形样式
        circleOptions: {
          fillColor: new qq.maps.Color(255, 208, 70, 0.3),
          strokeColor: new qq.maps.Color(88, 88, 88, 1),
          strokeWeight: 3,
          clickable: false
        }
      })

      const _this = this
      this.drawingManager.setMap(this.map)

      qq.maps.event.addListener(
        this.drawingManager,
        'overlaycomplete',
        function(event) {
          if (_this.overlaysArray.length > 0) {
            _this.overlaysArray.map(item => item.setPath([]))
            _this.overlaysArray = []
          }
          // clearOverlays(overlaysArray)
          _this.lngLat = []
          _this.overlaysArray.push(event.overlay)
          for (const item of event.overlay.getPath().elems) {
            const lng = item.getLng()
            const lat = item.getLat()
            _this.lngLat.push({
              lat: lat,
              lng: lng
            })
          }
        }
      )
    },
    // 初始化回显
    showpolygon(path3) {
      this.polygon = new qq.maps.Polygon({
        map: this.map,
        editable: true,
        strokeColor: new qq.maps.Color(202, 67, 58, 0.8),
        fillColor: new qq.maps.Color(202, 67, 58, 0.1)
      })
      this.polygon.setPath(path3)
    },
    // 删除初始化多边形
    delpolygon() {
      const a = []
      this.polygon.setPath(a)
    },
    // 删除绘制的多边形
    clearOverlays(newArr) {
      this.arr = [] // 清除假数据
      this.path4 = newArr || []
      this.polygon.setPath(this.path4)
      if (this.overlaysArray) {
        // 这个if判断在vue中会报错，不知道是里面的for in 被重写还是咋的，原因还不知道，如果报错可以不要这个if判断，删除标注那个地方跟这个原理是一样的，报错的话也不要，把长度重置为0
        // for (i in overlaysArray) {
        for (var i = 0; i < this.overlaysArray.length; i++) {
          this.overlaysArray[i].setMap(null)
        }
      }
      this.expansionDashline.setPath(null)
      this.overlaysArray = [] // 需要重置为空，否则之前的数据还在这个数组里面
      this.lngLat = []
      this.init()
    },
    /**
     * 重置多边形
     */
    resetOverlays() {
      this.arr = this.data.concat([]) // 清除假数据
      this.path4 = []
      this.init()
    }
  }
}
</script>
<style scoped lang="scss">
.mapBox {
  position: relative;
  .mapBtn {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 999;
  }
}
</style>
