<template>
  <router-view v-if="routerView"></router-view>
  <div v-else class="app-container">
    <el-form
      class="search-form"
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="星级评价" prop="goodsScore">
        <el-select
          v-model="queryParams.goodsScore"
          placeholder="请选择星级评价"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in scoreStarOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="评价方式" prop="resouce">
        <el-select
          v-model="queryParams.resouce"
          placeholder="请选择评价方式"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in scoreResouceOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品" prop="goodsId">
        <el-select
          filterable
          v-model="queryParams.goodsId"
          placeholder="请选择商品"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in goodsOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="置顶状态" prop="stickTop">
        <el-select
          filterable
          v-model="queryParams.stickTop"
          placeholder="请选择置顶状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in topStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
      <el-form-item label="评价时间" prop="evaluateTime">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.evaluateTime"
          :picker-options="pickerOptions"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      </el-row>
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['order:orderInfo:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <div style="margin-top: 20px" v-loading="loading">
      <div class="order_title">
        <div style="width: 20%">评价内容</div>
        <div style="width: 20%">星级评定</div>
        <div style="width: 20%">服务评定</div>
        <div style="width: 20%">评价时间</div>
        <div style="width: 20%">配送员</div>
      </div>
      <div>
        <div
          class="table_div"
          v-for="(row, index) in purchaseList"
          :key="index"
        >
          <div class="order">
            <div style="width: 600px;display: flex;justify-content: flex-start;">
              <div>商品名称：</div>
              <img style="width: 40px;height: 40px;" :src="prefix + row.thumbnail" >
              <div style="margin: 0 10px;">{{ row.goodsName }}</div>
              <div>{{ row.price && toDecimal2(row.price / 100) }}元/{{ row.num }}包</div>
            </div>
            <div style="width: 250px">
              订单编号：{{ row.orderId }}
            </div>
          </div>
          <div class="table">
            <div class="totalPrice">
              {{ row.comments }}
            </div>
            <div class="totalPrice">
              <el-rate
              :value="row.goodsScore"
              disabled
              text-color="#ff9900"
              />
            </div>
            <div class="totalPrice">
              <div>
                商品描述
                <el-rate
                  :value="row.goodsScore"
                  disabled
                  text-color="#ff9900"
                />
              </div>
              <div>
                物流评价
                <el-rate
                  :value="row.logisticsScore"
                  disabled
                  text-color="#ff9900"
                />
              </div>
              <div>
                服务评价
                <el-rate
                  :value="row.serviceScore"
                  disabled
                  text-color="#ff9900"
                />
              </div>
            </div>
            <div class="totalPrice">{{ row.createTime }}</div>
            <div class="but">{{ row.distributionName }}</div>
          </div>
        </div>
      </div>
    </div>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getPurchaseList } from "@/api/order/evaluation";
import { getOrgTree } from "@/api/utils";
import { getDropDown } from "@/api/selectUtils";
import moment from 'moment';

import { Cascader } from "ant-design-vue";

export default {
  name: "Purchase",
  components: {
    Cascader
  },
  data() {
    return {
      routerView:
        window.location.hash.split("?")[0].split("/").length === 5
          ? true
          : false,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      // 主订单表格数据
      purchaseList: [],
      // 组织
      orgOptions: [],
      // 星级评价
      scoreStarOptions: [],
      // 商家-评价方式
      scoreResouceOptions: [],
      //商品
      goodsOptions: [],
      // 商家-置顶状态
      topStatusOptions: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'));
              const end = new Date(moment(new Date()).endOf('day'));
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(start).endOf('day'))]);
            },
          },
          {
            text: "近七天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [new Date(moment(start).startOf('day')), new Date(moment(end).endOf('day'))]);
            },
          },
        ],
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        orderId: null,
        goodsScore: null,
        resouce: null,
        goodsId: null,
        stickTop: null,
        evaluateTime: null,
      },
      
    };
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
    // 商家-星级评价
    this.getDicts("merchant_goods_score_star").then((response) => {
      this.scoreStarOptions = response.data;
    });
    // 商家-评价方式
    this.getDicts("merchant_goods_score_resouce").then((response) => {
      this.scoreResouceOptions = response.data;
    });
    // 商家-置顶状态
    this.getDicts("merchant_stick_top_status").then((response) => {
      this.topStatusOptions = response.data;
    });
    // 商品
    getDropDown('goodsList').then(res => {
      this.goodsOptions = res.data.map(item => { 
        return {
          dictValue: item.goodsId,
          dictLabel: item.goodsName
        }
       })
    })
    this.getList();
  },
  methods: {
    /** 查询主订单列表 */
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
      };
      if (this.queryParams.evaluateTime && this.queryParams.evaluateTime.length === 2) {
        params.beginTime = this.queryParams.evaluateTime[0];
        params.endTime = this.queryParams.evaluateTime[1];
      }
      delete params.evaluateTime;
      getPurchaseList(params).then((response) => {
        this.purchaseList = response.rows;
        this.total = response.total; 
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.orderKey = "buyerNickname";
      this.queryParams.timeKey = "orderTime";
      this.resetForm("queryForm");
      this.queryParams.orgId = null;
      this.handleQuery();
    },
    /** 订单详情 */
    handleDetails(purchaseOrderId) {
      this.$router.push({
        path: "/order/purchase/allorder/details",
        query: {
          purchaseOrderId,
        },
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "ordercenter/purchase/order/export",
        {
          ...this.queryParams,
        },
        `order_orderInfo.xlsx`
      );
    },
  },
};
</script>
<style scoped lang="scss">
.table_div:hover {
  background-color: #f5f7fa;
}
.table_div {
  color: #606266;
  border-bottom: 1px solid #e2e2e2;
}
.order {
  margin-top: 5px;
  display: flex;
  background-color: #e3e3e3;
  color: #333;
  font-size: 14px;
  padding: 10px;
  line-height: 40px;
}

.order_title {
  display: flex;
  text-align: center;
  background-color: #f8f8f9;
  color: #515a6e;
  font-size: 14px;
  font-weight: 600;
  padding: 15px 10px;
  border-bottom: 1px solid #e2e2e2;
}

.table {
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  flex-direction: row;
  padding: 10px;
  font-size: 14px;
  .goods {
    width: 22%;
    .img {
      width: 40px;
      height: 40px;
      vertical-align: middle;
    }
    .goodsName {
      width: 45%;
      margin: auto;
      text-align: center;
    }
    .price {
      width: 40%;
      margin: auto;
      text-align: center;
    }
  }
  .user_img {
    width: 40px;
    height: 40px;
    border-radius: 50px;
  }
  .totalPrice {
    width: 20%;
    margin: auto 0px;
    text-align: center;
  }
  .but {
    width: 20%;
    margin: auto 0px;
    text-align: center;
  }
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
</style>