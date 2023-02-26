<template>
  <div style="padding: 20px" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="ruleName">
        <el-input style="width: 30%" :disabled="disabled || nextStep" v-model="form.ruleName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          :disabled="disabled || nextStep"
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 30%"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="时间" prop="time">
        <el-date-picker
          :disabled="disabled || nextStep"
          style="width: 30%"
          clearable
          size="small"
          v-model="form.time"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item v-if="!nextStep && form.orgId">
        <el-button type="primary" style="width: 30%;" @click="handleNextStep">保存，并下一步</el-button>
      </el-form-item>
      <el-form-item v-if="nextStep">
        <div style="width: 600px; border: 1px solid #e2e2e2;" v-loading="goodsLoading || this.$store.state.isLoading">
          <div style="display: flex; text-align: center;">
            <div style="width: 40%; border-right: 1px solid #e2e2e2;line-height: 53px;">产品名称</div>
            <div style="width: 30%;border-right: 1px solid #e2e2e2;line-height: 53px;">价格（元）</div>
            <div style="width: 30%;line-height: 53px;">分销推广提成（元）</div>
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
            <div style="width: 40%; padding: 5px 0; display: flex; border-right: 1px solid #e2e2e2;">
              <img style="width: 40px; height: 30px; margin: 0 10px" :src="goods.thumbnail" />
              <div>{{ goods.goodsName }}</div>
            </div>
            <div
              style="width: 30%; border-right: 1px solid #e2e2e2; padding: 5px 0"
            >
              {{ goods.price && toDecimal2(goods.price / 100) }}
            </div>
            <div style="width: 30%;padding: 5px 0;">
              <el-input-number v-if="updateGoods[goods.goodsId + 'customer']" style="width: 180px;" v-model="goods.customerCommision" :min="0" :max="goods.price / 100" @change="(e) => goods.customerCommision = Math.round(e * 100) / 100" @blur="onSbumit(goods)" />
              <div v-else>
                <span >{{ goods.customerCommision }}</span>
                <i class="el-icon-edit" v-if="!disabled" style="color: #409eff;font-size: 18px;margin: 0 5px;cursor: pointer;" @click="openPrice(goods.goodsId + 'customer')"></i>
              </div>
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
    <div class="dialog-footer" >
      <el-button @click="cancel">返 回</el-button>
    </div>
  </div>
</template>

<script>
import {
  updateCommisionRule,
  addCommisionRule,
  getCommisionRule,
  goodsList
} from "@/api/finance/commisionRule";
import { getOrgTree } from "@/api/utils";
import moment from "moment";
import { Cascader } from "ant-design-vue";
import { flatten, searchSuperior } from "@/utils/array";
import Decimal from 'decimal.js'

export default {
  components: {
    Cascader,
  },
  data() {
    return {
      loading: false,
      // 商品列表loding
      goodsLoading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 是否禁用
      disabled: this.$route.query.type === 'check',
      // 组织
      orgOptions: [],
      // 表单参数
      form: {
        commisionRuleId: this.$route.query.commisionRuleId
      },
      // 表单校验
      rules: {
        orgId: [
          { required: true, message: "组织不能为空", trigger: "blur" },
        ],
        ruleName: [
          { required: true, message: "推广佣金规则名称不能为空", trigger: "blur" },
          { max: 15, message: "名称不能超过15个字符", trigger: "blur" },
        ],
        time: [{ required: true, message: "时间不能为空", trigger: "blur" }],
      },
      // 修改商品组长提成
      updateGoods: {},
      nextStep: false,
      // 商品信息
      goodsOptions: [],
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      goodsQuery: {
        pageNum: 1,
        pageSize: 10,
      },
      goodsTotle: 0,
    };
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
      if (this.$route.query.type !== "add") {
        this.handleInfo(this.$route.query.commisionRuleId);
      }
    });
  },
  methods: {
    // 查询详情
    handleInfo(commisionRuleId) {
      getCommisionRule(commisionRuleId).then((res) => {
        const orgArr = flatten(this.orgOptions, 'children')
        const orgId = searchSuperior(res.data.orgId, 'id', orgArr, 'parentId')
        this.form = {
          commisionRuleId,
          ruleName: res.data.ruleName,
          orgId: orgId,
          time: [ res.data.beginTime, res.data.endTime ],
        }
        if (this.disabled) {
          setTimeout(() => {
            this.getGoods()
          }, 500)
        }
      });
    },
    /** 下一步 */
    handleNextStep() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const params = {
            commisionRuleId: this.form.commisionRuleId,
            orgId:  typeof this.form.orgId === "object"
            ? this.form.orgId.slice(-1)[0]
            : this.form.orgId,
            ruleName: this.form.ruleName,
            beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
            endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
          }
          switch (this.routerType) {
            case 'update':
            case 'add':
              return addCommisionRule(params).then(res => {
                if (res.code !== 200) return 
                this.form.commisionRuleId = res.data
                this.getGoods()
              });
            case 'check':
              return this.getGoods()
          }
          
        }
      })
    },
    /** 查询商品 */
    getGoods() {
      this.nextStep = true
      this.goodsLoading = true
      goodsList({ ...this.goodsQuery, orgId: this.form.orgId, commisionRuleId: this.form.commisionRuleId }).then((res) => {
        this.goodsOptions = res.rows.map((item) => {
          return {
            ...item,
            thumbnail: this.prefix + item.thumbnail,
            customerCommision: item.customerCommision ? item.customerCommision / 100 : 0
          };
        });
        this.goodsTotle = res.total;
        this.goodsLoading = false
      });
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null,
      };
      this.resetForm("form");
    },
    // 修改组长提成
    openPrice(goodsId) {
      this.updateGoods = {
        [goodsId]: true
      }
    },
    /** 修改商品提成 */
    onSbumit(data) {
      const params = {
        commisionRuleId: this.form.commisionRuleId,
        orgId:  typeof this.form.orgId === "object"
        ? this.form.orgId.slice(-1)[0]
        : this.form.orgId,
        ruleName: this.form.ruleName,
        beginTime: moment(this.form.time[0]).format('yyyy-MM-DD HH:mm:ss'),
        endTime: moment(this.form.time[1]).format('yyyy-MM-DD HH:mm:ss'),
        commisionRuleGoodsList: [
          {
            goodsId: data.goodsId,
            commisionRuleId: this.form.commisionRuleId,
            customerCommision: new Decimal(data.customerCommision).mul(100).toNumber()
          }
        ]
      }
      addCommisionRule(params).then(res => {
        this.updateGoods = {}
        this.form.commisionRuleId = res.data
      })
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
