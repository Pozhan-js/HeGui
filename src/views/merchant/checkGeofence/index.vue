<template>
  <div class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电子围栏名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入围栏名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
            >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <div style="height: 700px;margin-top: 30px;">
      <div
        id="mapFencecontainer"
        class="mapBox"
        style="width: 100%; height: 100%; "
      ></div>
    </div>
  </div>
</template>

<script>
import { getOrgTree } from "@/api/utils";
import { Cascader } from "ant-design-vue";

export default {
  name: "CheckGeofence",
  components: {
    Cascader,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织数据
      orgOptions: [],
      map: null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        orgId: null,
      },
    };
  },
  created() {
    this.getList();

    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
  },
  mounted() {
    this.init()
  },
  methods: {
    /** 查询电子围栏列表 */
    getList() {
      
    },
    init() {
      this.map = new qq.maps.Map(document.getElementById("mapFencecontainer"), {
        center: new qq.maps.LatLng(28.23529, 112.93134), 
        // center: new qq.maps.LatLng(39.871481, 116.384836), // 暂时默认
        zoom: 14,
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
  },
};
</script>