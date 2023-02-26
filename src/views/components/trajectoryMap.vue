<template>
  <div :style="{ height: `${height}px`, width: `${width}px` }">
    <div
      id="mapFencecontainer"
      class="mapBox"
      style="width: 100%; height: 100%;"
    >
      <div class="mapBtn">
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
        >恢复</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrajectoryMap',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    trackchecked: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 700
    },
    width: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      map: null,
      marker: [],
      startMarker: null,
      endMarker: null,
      bicycleMarker: null,
      clearIs: false,
      label: null,
      distancePolyline: null
    }
  },
  watch: {
    data(val, oldVal) {
      this.init()
    },
    trackchecked(val, oldVal) {
      this.drawMarker()
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    // 地图初始化
    init() {
      this.clearIs = false
      this.$emit('getClearIs', false)
      const reverseData = this.data.concat([]).reverse()
      if (!this.data.length) return
      const map = new qq.maps.Map(document.getElementById('mapFencecontainer'), {
        center: new qq.maps.LatLng(this.data[Math.ceil(this.data.length / 2)].locationPoint.lat, this.data[Math.ceil(this.data.length / 2)].locationPoint.lng),
        zoom: 24
      })
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

      const p = []
      reverseData.map((e) => {
        p.push(new qq.maps.LatLng(e.locationPoint.lat, e.locationPoint.lng))
      })

      this.startMarker = new qq.maps.Marker({
        position: new qq.maps.LatLng(this.data[this.data.length - 1].locationPoint.lat, this.data[this.data.length - 1].locationPoint.lng),
        map: this.map,
        autoRotation: true,
        icon: new qq.maps.MarkerImage(
          'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png'
        )
      })

      this.endMarker = new qq.maps.Marker({
        position: new qq.maps.LatLng(this.data[0].locationPoint.lat, this.data[0].locationPoint.lng),
        map: this.map,
        autoRotation: true,
        icon: new qq.maps.MarkerImage(
          'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png'
        )
      })
      // 设置图标
      this.bicycleMarker = new qq.maps.Marker({
        position: p[0],
        map: this.map,
        autoRotation: true
        // icon: new qq.maps.MarkerImage("https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/bicycle.png")
      })
      // 画出轨迹
      this.polyline = new qq.maps.Polyline({
        path: p,
        strokeColor: '#28F',
        strokeWeight: 6,
        editable: false,
        map: this.map
      })
      // 图标沿着轨迹移动
      this.bicycleMarker.moveAlong(p, 80)
    },
    // 绘制标点
    drawMarker() {
      this.marker.map(item => {
        item.setMap(null)
      })
      this.marker = this.trackchecked.map(item => {
        return new qq.maps.Marker({
          position: new qq.maps.LatLng(item.locationPoint.lat, item.locationPoint.lng),
          map: this.map
        })
      })
    },
    // 清除点位
    clearOverlays() {
      this.polyline.setMap(null)
      this.startMarker.setMap(null)
      this.endMarker.setMap(null)
      this.bicycleMarker.setMap(null)
      this.clearIs = true
      if (this.distancePolyline) {
        this.distancePolyline.setVisible(false)
      }
      if (this.label) {
        this.label.setVisible(false)
      }
      this.$emit('getClearIs', true)
    },
    // 恢复轨迹
    resetOverlays() {
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
