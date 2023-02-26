<template>
  <router-view v-if="routerView"></router-view>
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['finance:settlementPriceRule:add']"
          >新增结算价
        </el-button>
      </el-col>
    </el-row>
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
          :options="orgOptions"
          v-model="queryParams.orgId"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="goodsId">
        <el-select
          filterable
          v-model="queryParams.goodsId"
          placeholder="请选择产品"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in goodsOptions"
            :key="dict.goodsId"
            :label="dict.goodsName"
            :value="dict.goodsId"
          />
        </el-select>
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['finance:settlementPriceRule:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>


    <div style="margin-top: 20px" v-loading="loading">
      <div class="order_title">
        <div style="width: 20%">组织</div>
        <div style="width: 20%">产品名称</div>
        <div style="width: 20%">产品零售价（元）</div>
        <div style="width: 20%">结算价（元）</div>
        <div style="width: 10%">状态</div>
        <div style="width: 10%">操作</div>
      </div>
      <div>
        <div
          class="table_div"
          v-for="(row, index) in settlementPriceRuleList"
          :key="index"
        >
          <div class="table">
            <div class="totalPrice">{{ row.orgName }}</div>
            <div class="totalPrice goods_scroll" style="width: 60%">
              <div
                style="display: flex; padding: 5px 0"
                v-for="goods in row.settlementPriceRuleGoodsList"
                :key="goods.id"
              >
                <div style="width: 33.3%;display: flex;justify-content: space-evenly;">
                  <img style="width: 40px;" :src="prefix + goods.thumbnail">
                  <div style="margin: auto 0;">{{ goods.goodsName }}</div>
                </div>
                <div style="width: 33.3%">
                  {{ goods.price && toDecimal2(goods.price / 100) }}
                </div>
                <div style="width: 33.3%">
                  {{
                    goods.settlementPrice &&
                    toDecimal2(goods.settlementPrice / 100)
                  }}
                </div>
              </div>
            </div>
            <div class="but">{{ statusFormat(row.status) }}</div>
            <div class="but">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleStand(row, row.status == 2 ? 1 : 2)"
                v-hasPermi="['finance:settlementPriceRule:enabled']"
                v-if="row.status == 2 || row.status == 1"
                >
                {{ row.status == 2 ? '启用' : '禁用' }}
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleStand(row, 3)"
                v-if="row.status == 2"
                v-hasPermi="['finance:settlementPriceRule:expired']"
                >失效
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(row)"
                v-hasPermi="['finance:settlementPriceRule:edit']"
                >修改
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(row)"
                v-if="row.status == 3"
                v-hasPermi="['finance:settlementPriceRule:remove']"
                >删除
              </el-button>
            </div>
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
import {
  delSettlementPriceRule,
  listSettlementPriceRule,
  enabled, disabled, expired
} from "@/api/finance/settlementPriceRule";
import { getOrgTree } from "@/api/utils";
import { getDropDown } from "@/api/selectUtils";
import { Cascader } from "ant-design-vue";

export default {
  name: "SettlementPriceRule",
  components: {
    Cascader
  },
  data() {
    return {
      routerView:
        window.location.hash.split("?")[0].split("/").length === 4
          ? true
          : false,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 结算价设置表格数据
      settlementPriceRuleList: [],
      // 商品下拉信息
      goodsOptions: [],
      // 状态字典
      ruleSstatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        goodsId: null,
      },
      // 搜索条件
      searchParams: null,
    };
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('SettlementPriceRule')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('SettlementPriceRule'))
      }
    }
    this.getList();
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
    });
    // 商品下拉
    getDropDown('goodsList').then(res => {
      this.goodsOptions = res.data
    })
    this.getDicts("finance_rule_status").then((response) => {
      this.ruleSstatusOptions = response.data;
    });
  },
  methods: {
    /** 查询结算价设置列表 */
    getList() {
      this.loading = true;
      listSettlementPriceRule(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.settlementPriceRuleList = response.rows;
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        goodsName: null,
      }
      localStorage.removeItem('SettlementPriceRule')
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 状态
    statusFormat(status, column) {
      return this.selectDictLabel(this.ruleSstatusOptions, status);
    },
    /** 配送费规则状态修改 */
    handleStand(rows, status) {
      this.$confirm(
        `是否确认${{ 1: "启用", 2: "停用", 3: "失效" }[status]}"${
          rows.orgName
        }"结算价?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          switch (status) {
            case 1:
              return enabled(rows.settlementPriceId);
            case 2:
              return disabled(rows.settlementPriceId);
            case 3:
              return expired(rows.settlementPriceId);
          }
        })
        .then(() => {
          this.getList();
          this.msgSuccess(
            `${{ 1: "启用", 2: "停用", 3: "失效" }[status]}结算价成功~`
          );
        });
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = "/finance/settlementPriceRule/add"
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('SettlementPriceRule', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: "add",
        },
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = "/finance/settlementPriceRule/update"
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('SettlementPriceRule', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: "update",
          settlementPriceId: row.settlementPriceId
        },
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const settlementPriceIds = row.settlementPriceId || this.ids;
      this.$confirm(
        `是否确认${ typeof settlementPriceIds === 'object' ? '批量删除' : '删除"' + row.orgName + '"' }结算价设置?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delSettlementPriceRule(settlementPriceIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "finance/settlementPriceRule/export",
        {
          ...this.queryParams,
        },
        `finance_settlementPriceRule.xlsx`
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
  .totalPrice {
    width: 20%;
    margin: auto 0px;
    text-align: center;
  }
  .goods_scroll {
    max-height: 150px;
    overflow: auto;
  }
  .but {
    width: 10%;
    margin: auto 0px;
    text-align: center;
  }
}
.goods_scroll::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.goods_scroll::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #1890ff;
}
.goods_scroll::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background: #ededed;
}
</style>