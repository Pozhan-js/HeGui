<template>
  <div style="padding: 20px">
    <el-row>
      <el-col :span="2" style="text-align: right; line-height: 36px"
        >地址：</el-col
      >
      <el-col :span="16">
        <el-select
          style="width: 400px"
          v-model="value"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="loading"
          @change="changeArea"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.address"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <div style="margin: 20px 30px; height: 700px; position: relative">
      <Fence
        :data="fenceData"
        :positioning="positioning"
        :height="700"
        :redundantFence="redundantFence"
        :dashFence="dashFence"
        :zoom="11"
        ref="fenceRef"
      />
    </div>
    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="this.$store.state.isLoading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import Fence from "@/views/components/fence";
import { distributionInfo, postFence, shopFence }  from "@/api/distribution/distributioninfo";

export default {
  components: {
    Fence,
  },
  data() {
    return {
      loading: false,
      options: [],
      value: null,
      searchService: null,
      distributionId: this.$route.query.distributionId,
      shopId: this.$route.query.shopId,
      // this.$route.query.orgName
      areaName: null,
      citylocation: null,
      fenceData: [],
      redundantFence: [],
      dashFence: [],
      positioning: [],
    };
  },
  mounted() {
    this.regSearch();
    this.handleInfo()
  },
  methods: {
    // 注册地区搜索 注册ip定位
    regSearch() {
      this.searchService = new qq.maps.SearchService({
        //检索成功的回调函数
        complete: (results) => {
          this.loading = false;
          this.options = results.detail.pois;
        },
      });
     
      //设置搜索页码
      this.searchService.setPageIndex(0);
      //设置每页的结果数
      this.searchService.setPageCapacity(10);
      //根据输入的关键字在搜索范围内检索

      this.citylocation = new qq.maps.CityService();
      //请求成功回调函数
      this.citylocation.setComplete((result) => {
        this.positioning = [result.detail.latLng.lat, result.detail.latLng.lng];
      });
    },
    // 查询详情
    handleInfo() {
      shopFence({shopId: this.shopId, distributionId: this.distributionId}).then(res => {
        this.searchService.setLocation(res.data.shopFence.provinceName + res.data.shopFence.cityName);
        this.redundantFence = [JSON.parse(res.data.shopFence.borderFence)]
        this.dashFence = res.data.othersFences.filter(item => item.borderFence).map(item => JSON.parse(item.borderFence))
        if (res.data.selfFence.borderFence && JSON.parse(res.data.selfFence.borderFence) && JSON.parse(res.data.selfFence.borderFence).length > 0) {
          this.fenceData = JSON.parse(res.data.selfFence.borderFence)
          this.positioning = [JSON.parse(res.data.selfFence.borderFence)[0].lat, JSON.parse(res.data.selfFence.borderFence)[0].lng]
        } else {
          this.citylocation.searchLocalCity();
        }
      })
      // distributionInfo(this.distributionId).then(res => {
        
      // })
    },
    remoteMethod(query) {
      this.loading = true;
      this.searchService.search(query);
    },
    // 选择地区
    changeArea(id) {
      if (!id) return;
      const latLng = this.options.filter((item) => item.id === id)[0].latLng;
      this.positioning = [latLng.lat, latLng.lng];
    },
    /** 提交按钮 */
    submitForm() {
      const hasShelves = this.$refs["fenceRef"].sendLngLat();
       this.$confirm(
        `是否确认添加ID${this.distributionId}的配送员电子围栏?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        return postFence({
          borderFence: hasShelves.length > 0 ? JSON.stringify(hasShelves) : null,
          distributionId: this.distributionId
        })
      }).then(() => {
        this.cancel()
        this.msgSuccess(`配送员电子围栏设置成功~`);
      });
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}
</style>