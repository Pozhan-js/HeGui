<template>
  <div style="display: flex">
    <div class="left_div">
      <div style="margin-bottom: 20px; padding: 10px 0">商品分组</div>
      <div
        :class="
          queryParams.groupId === group.groupId
            ? 'select_div groupDiv'
            : 'groupDiv'
        "
        v-for="group in groupArr"
        :key="group.groupId"
        @click="cutoverGroup(group.groupId)"
      >
        {{ group.groupName }}
      </div>
    </div>
    <div class="app-container" style="width: 80%">
      <div style="text-align: center;padding: 20px;font-size: 20px;font-weight: 600;">{{ this.$route.query.shopName }}</div>
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="queryParams.goodsName"
            placeholder="请输入商品名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
            >搜索</el-button
          >
          <el-button class="gray-btn" size="mini" @click="resetQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>

      <!-- <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            v-hasPermi="['merchant:shopGoods:add']"
            >新增
          </el-button>
        </el-col>
      </el-row> -->

      <el-table v-loading="loading" :data="shopGoodsList">
        <!-- @selection-change="handleSelectionChange" -->
        <!-- <el-table-column type="selection" width="80" align="center" /> -->
        <el-table-column label="商品" align="center" width="300" prop="goodsId">
          <template slot-scope="scope">
            <div style="display: flex; align-items: center">
              <el-image
                style="width: 80px; height: 80px"
                :src="prefix + scope.row.thumbnail"
                :preview-src-list="[prefix + scope.row.thumbnail]"
              />
              <div style="margin: 0 10px">
                {{ scope.row.groupNameList.toString() }}
              </div>
              <div>{{ scope.row.goodsName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" align="center" prop="totalStock" />
        <el-table-column label="销量" align="center" prop="salesStock" />
        <el-table-column label="加入商品" align="center" prop="groupNameList">
          <template slot-scope="scope">
            <el-switch
              v-model="addGoodsData[scope.row.goodsId]"
              :disabled="scope.row.addGoodsStatus === 1"
              :active-value="1"
              :inactive-value="0"
              @change="
                (value) =>
                  handleGoodsStaus({
                    shopId: shopId,
                    goodsId: scope.row.goodsId,
                    groupId: scope.row.groupId,
                    addGoodsStatus: 1,
                  })
              "
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="及时送" align="center" prop="timelySwitch">
          <template slot-scope="scope">
            <el-switch
              v-model="timelyGoods[scope.row.goodsId]"
              :active-value="1"
              :inactive-value="0"
              @change="
                (value) =>
                  handleSendTime({
                    shopId: shopId,
                    goodsId: scope.row.goodsId,
                    groupId: scope.row.groupId,
                    timelySwitch: value,
                  })
              "
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="可采购" align="center" prop="purchaseSwitch">
          <template slot-scope="scope">
            <el-switch
              v-model="purchaseGoods[scope.row.goodsId]"
              :active-value="1"
              :inactive-value="0"
              @change="
                (value) =>
                  handlePurchase({
                    shopId: shopId,
                    goodsId: scope.row.goodsId,
                    groupId: scope.row.groupId,
                    purchaseSwitch: value,
                  })
              "
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="handlePromote(scope.row)"
              v-hasPermi="['merchant:shopGoods:edit']"
              >推广码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
      <Promote ref="promote" />
    </div>
  </div>
</template>

<script>
import {
  listShopGoods,
  addShopGoods,
  addPurchase,
  addGoods,
} from "@/api/merchant/shopGoods";
import { getDropDown } from "@/api/selectUtils";

import Promote from "@/views/components/promote";

export default {
  name: "ShopGoods",
  components: {
    Promote,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 店铺ID
      shopId: this.$route.query.shopId,
      // 店铺商品表格数据
      shopGoodsList: [],
      // 商品分组
      groupArr: [],
      // 加入商品
      addGoodsData: {},
      // 及时送开关对象
      timelyGoods: {},
      // 采购开关对象
      purchaseGoods: {},
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: this.$route.query.shopId,
        goodsName: null,
        groupId: null,
        orderByColumn: 'goods_id',
        isAsc: 'desc',
      },
    };
  },
  created() {
    getDropDown("goodsGroup", { groupType: 1 }).then((res) => {
      this.groupArr = res.data;
      this.queryParams.groupId = res.data[0].groupId;
      this.getList();
    });
  },
  methods: {
    /** 查询店铺商品列表 */
    getList() {
      this.loading = true;
      listShopGoods(this.queryParams).then((response) => {
        this.loading = false;
        this.shopGoodsList = response.rows;
        response.rows?.map((item) => {
          this.timelyGoods[item.goodsId] = item.timelySwitch;
          this.purchaseGoods[item.goodsId] = item.purchaseSwitch;
          this.addGoodsData[item.goodsId] = item.addGoodsStatus;
        });
        this.total = response.total;
      });
    },
    /** 切换分组信息 */
    cutoverGroup(groupId) {
      this.queryParams.groupId = groupId;
      this.getList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.orgId = null;
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.shopGoodsId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    // 推广链接
    handlePromote(row) {
      this.$refs["promote"].link = row.shopGoodsId;
      this.$refs["promote"].open = true;
      this.$refs["promote"].generate();
    },
    // 加入商品
    handleGoodsStaus(params) {
      this.$confirm(`是否确认加入商品?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          return addGoods(params);
        })
        .then(() => {
          this.getList();
          this.msgSuccess(`加入商品成功`);
        });
    },
    // 及时送开关
    handleSendTime(params) {
      this.$confirm(
        `是否确认${{ 0: "关闭", 1: "开启" }[params.timelySwitch]}ID为${
          params.goodsId
        }商品的及时送?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return addShopGoods(params);
        })
        .then((res) => {
          if (res.code === 502) {
            this.$confirm(`${{1: '未设置结算价', 2: '未设置配送费'}[res.subCode]}，是否确定去设置${{1: '结算价', 2: '配送费'}[res.subCode]}?`, "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
            .then(() => {
              const { href } = this.$router.resolve({
                path: {1: "/finance/settlementPriceRule", 2: '/finance/distributionFeeRule' }[res.subCode],
              });
              window.open(href, '_blank');
            })
            return
          }
          this.getList();
          this.msgSuccess(
            `商品及时送${{ 0: "关闭", 1: "开启" }[params.timelySwitch]}成功`
          );
        });
    },
    // 采购开关
    handlePurchase(params) {
      this.$confirm(
        `是否确认${{ 0: "关闭", 1: "开启" }[params.purchaseSwitch]}ID为${
          params.goodsId
        }商品的可采购?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          return addPurchase(params);
        })
        .then(res => {
          if (res.code === 502) {
            this.$confirm(`${{1: '未设置结算价', 2: '未设置配送费'}[res.subCode]}，是否确定去设置${{1: '结算价', 2: '配送费'}[res.subCode]}?`, "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            })
            .then(() => {
              const { href } = this.$router.resolve({
                path: {1: "/finance/settlementPriceRule", 2: '/finance/distributionFeeRule' }[res.subCode],
              });
              window.open(href, '_blank');
            })
            return
          }
          this.getList();
          this.msgSuccess(
            `商品可采购${{ 0: "关闭", 1: "开启" }[params.purchaseSwitch]}成功`
          );
        });
    },
  },
};
</script>
<style>
.left_div {
  width: 20%;
  padding: 10px;
  text-align: center;
  border-right: 1px solid #e2e2e2;
  max-height: 900px;
  overflow: overlay;
}
.groupDiv {
  cursor: pointer;
  margin-top: 10px;
  border: 1px solid #e2e2e2;
  padding: 15px 0;
}
.select_div {
  background: #1890ff;
  color: #fff;
}
.left_div::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.left_div::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  background-color: #1890ff;
  background-image: -webkit-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
}
.left_div::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #ededed;
  border-radius: 10px;
}
</style>
