<template>
  <div style="padding: 20px" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
          @change="getGoods"
        />
        <div style="color: red">
          总后台添加默认全部市场，经销商添加默认为本市场
        </div>
      </el-form-item>
      <el-form-item label="产品" v-loading="goodsLoading">
        <div style="width: 700px; border: 1px solid #e2e2e2">
          <div style="display: flex; text-align: center; background: #e2e2e2">
            <div style="width: 40%">产品</div>
            <div style="width: 30%">零售价（元）</div>
            <div style="width: 30%">结算价（元）</div>
          </div>
          <div
            style="
              display: flex;
              text-align: center;
              border-top: 1px solid #e2e2e2;
            "
            v-for="goods in goodsOptions"
            :key="goods.goodsId"
          >
            <div style="width: 40%; padding: 5px 0; display: flex">
              <img style="width: 40px; height: 40px; margin: 0 10px" :src="goods.thumbnail" />
              <div>{{ goods.goodsName }}</div>
            </div>
            <div
              style="width: 30%; border-left: 1px solid #e2e2e2; padding: 5px 0"
            >
              {{ goods.price && toDecimal2(goods.price / 100) }}
            </div>
            <div
              style="width: 30%; border-left: 1px solid #e2e2e2; padding: 5px 0"
            >
              <el-input-number style="width: 180px;" v-model="goods.settlementPrice" @change="(e) => goods.settlementPrice = Math.round(e * 100) / 100" :min="0" @blur="onSbumit(goods)" />
            </div>
          </div>
        </div>
        <div style="width: 700px;">
          <pagination
            v-show="goodsTotle > 0"
            :total="goodsTotle"
            :page.sync="goodsQuery.pageNum"
            :limit.sync="goodsQuery.pageSize"
            @pagination="getGoods"
          />
        </div>
         
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  addSettlementPriceRule,
  getSettlementPriceRule,
  goodsList,
} from "@/api/finance/settlementPriceRule";
import { getOrgTree } from "@/api/utils";
import { Cascader } from "ant-design-vue";
import { flatten, searchSuperior } from "@/utils/array";
import Decimal from 'decimal.js'

export default {
  components: {
    Cascader
  },
  data() {
    return {
      loading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 组织
      orgOptions: [],
      // 商品
      goodsOptions: [],
      // 选中商品
      selectGoods: [],
      // 表单参数
      form: {
        settlementPriceRuleGoodsList: []
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: "组织不能为空", trigger: "blur" },
        ],
      },
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      goodsQuery: {
        pageNum: 1,
        pageSize: 10,
        settlementPriceId: this.$route.query.settlementPriceId
      },
      goodsTotle: 0,
      goodsLoading: false
    };
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
      if (this.$route.query.type === "update") {
        this.handleInfo(this.$route.query.settlementPriceId);
      }
    });
  },
  methods: {
    // 查询详情
    handleInfo(settlementPriceId) {
      this.loading = true
      getSettlementPriceRule(settlementPriceId).then(res => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          orgId: orgId,
          settlementPriceId: res.data.settlementPriceId
        }
        this.getGoods()
        this.loading = false
      })
    },
    /** 查询商品信息 */
    getGoods() {
      this.goodsLoading = true
      goodsList({ ...this.goodsQuery, orgId: this.form.orgId }).then((res) => {
        this.goodsOptions = res.rows.map(item => {
          return {
            ...item,
            thumbnail: this.prefix + item.thumbnail,
            settlementPrice: item.settlementPrice ? item.settlementPrice / 100 : 0
          }
        });
        this.goodsTotle = res.total;
        this.goodsLoading = false;
      });
    },
    /** 修改结算价 */
    onSbumit(value) {
      const params = {
        orgId: typeof this.form.orgId === 'object' ? 
            this.form.orgId.slice(-1)[0] 
            : this.form.orgId,
        settlementPriceId: this.form.settlementPriceId,
        settlementPriceRuleGoodsList: [
          {
            settlementPrice: new Decimal(value.settlementPrice).mul(100).toNumber(),
            goodsId: value.goodsId
          }
        ]
      }
      addSettlementPriceRule(params).then(res => {
        this.form.settlementPriceId = res.data
      })
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null,
      };
      this.resetForm("form");
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

/deep/ .el-input-number {
  width: 100px !important;
  .el-input__inner {
    padding: 0px;
    border-style: none;
    border-bottom: 1px solid;
    border-radius: 0px;
  }
}
/deep/ .el-input-number__decrease {
  display: none;
}
/deep/ .el-input-number__increase {
  display: none;
}
</style>
