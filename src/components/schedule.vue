<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <div
          id="mapFencecontainer"
          class="mapBox"
          style="width: 100%;height: 600px;"
        />
      </el-col>
      <el-col :span="16">
        <el-table :data="data" :row-class-name="tableRowClassName">
          <el-table-column prop="distributionName" align="center" label="姓名" />
          <el-table-column prop="telephone" align="center" label="手机号码" />
          <el-table-column prop="orderNum" align="center" label="订单数" />
          <el-table-column prop="goodsAmount" align="center" label="库存总价值" :formatter="(_,text)=> toDecimal2(_.goodsAmount / 100)" />
          <el-table-column prop="distributionStockList" width="150" align="center" label="商品库存">
            <template slot-scope="scope">
              <div class="goods">
                <div
                  v-for="goods in scope.row.distributionStockList"
                  :key="goods.goodsId"
                  style="padding: 5px; display: flex"
                >
                  <div
                    class="goodsName"
                    style="width: 100px;overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;"
                  >{{ goods.goodsName }}</div>
                  <div class="price" style="width: 50px;">{{ goods.stock }}包</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="distance" align="center" label="距离（m）" />
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="handleClick(scope.row.distributionId)">选择</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>

export default {
  name: 'Schedule',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    location: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      map: null,
      markersArray: [],
      selId: null
    }
  },
  watch: {
    data: {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.selId = null
        this.initMap()
      }
    }
  },
  created() {},
  mounted() {
    this.initMap()
  },
  methods: {
    /** 打开model框 */
    initMap() {
      this.map = new qq.maps.Map(document.getElementById('mapFencecontainer'), {
        center: new qq.maps.LatLng(this.location.lat, this.location.lng),
        zoom: 12
      })
      this.setMarker([{
        ...this.location,
        icon: new qq.maps.MarkerImage(`../punctuation/order.png`, new qq.maps.Size(35, 35), new qq.maps.Point(0, 0), new qq.maps.Point(21, 45), new qq.maps.Size(35, 35))
      }])

      this.setMarker(this.data.map(item => {
        return {
          ...item.location,
          distributionId: item.distributionId,
          icon: new qq.maps.MarkerImage(`../punctuation/diamond_green.png`, new qq.maps.Size(35, 35), new qq.maps.Point(0, 0), new qq.maps.Point(21, 45), new qq.maps.Size(35, 35))
        }
      }), true)
    },
    setMarker(markerArr, click = false) {
      if (!markerArr) return
      markerArr?.map((item, index) => {
        const marker = new qq.maps.Marker({
          icon: item.icon,
          position: new qq.maps.LatLng(item.lat, item.lng),
          map: this.map
        })
        this.markersArray = this.markersArray.concat([marker])
        if (click) {
          qq.maps.event.addListener(marker, 'click', (event) => {
            this.selId = item.distributionId
          })
        }
      })
    },
    handleClick(value) {
      this.$emit('checkDis', value)
    },
    tableRowClassName({ row, rowIndex }) {
      return row.distributionId === this.selId ? 'selTable' : ''
    }
  }
}
</script>
<style scoped lang="scss">
/deep/ .el-table .selTable {
  background: #a2a5a2 !important;
}
</style>
