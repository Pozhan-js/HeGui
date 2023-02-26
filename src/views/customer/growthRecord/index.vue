<template>
  <div>
    <router-view v-if="routerView"></router-view>
    <div v-else class="app-container" v-loading="loading" style="color: #333;">
      <div class="title">成长值计算规则</div>
      <div class="hint" style="line-height: 50px;">成长值是根据不同成长值策略计算的分值和其对应的分值比例计算出的分综合分值，成长值等于各策略分值乘以分值比例的总和。</div>
      <div class="hint">
        当前成长值为：成长值 = 
        <span v-if="queryParams.rfm.switch">RFM值 *（成长值系数 {{toDecimal2(queryParams.rfm.number)}}）</span>
        <span v-if="queryParams.rfm.switch && (queryParams.consume.switch || queryParams.member.switch)">+  </span>
        <span v-if="queryParams.consume.switch">消费激励值 *（成长值系数 {{toDecimal2(queryParams.consume.number)}}） </span>
        <span v-if="queryParams.consume.switch && queryParams.member.switch">+  </span>
        <span v-if="queryParams.member.switch">会员活跃值 *（成长值系数 {{toDecimal2(queryParams.member.number)}}）</span>
      </div>
      <div class="border">
        <div class="title">成长值策略设置</div>
        <div class="switch">是否开启</div>
        <div class="growth">成长值系数</div>
        <div class="item">
          <div class="item_title">RFM模型策略</div>
          <div class="item_content">
            <div>
              <div>策略介绍：</div>
              <div>{{ queryParams.rfm.desc }}</div>
            </div>
          </div>
          <div class="item_table">
            <el-switch v-model="queryParams.rfm.switch" @change="(e) => updateConfigure('rfm')" />
          </div>
          <div class="item_table">
            <el-input-number placeholder="请输入比例系数" v-model="queryParams.rfm.number" :min="0" :precision="2" @change="(e) => updateConfigure('rfm')" />
          </div>
          <div class="item_table">
            <el-button type="text" v-hasPermi="['customer:growthRule:query']">设置</el-button>
          </div>
        </div>
        <div class="item"  style="margin: 40px 0;">
          <div class="item_title">消费激励策略</div>
          <div class="item_content">
            <div>
              <div>策略介绍：</div>
              <div>{{ queryParams.consume.desc }}</div>
            </div>
          </div>
          <div class="item_table">
            <el-switch v-model="queryParams.consume.switch" @change="(e) => updateConfigure('consume')" />
          </div>
          <div class="item_table">
            <el-input-number placeholder="请输入比例系数" v-model="queryParams.consume.number" :min="0" :precision="2" @change="(e) => updateConfigure('consume')" />
          </div>
          <div class="item_table">
            <el-button type="text" v-hasPermi="['customer:growthRule:query']" @click="handleUpdate('consume', queryParams.consume.id, queryParams.consume.number)">设置</el-button>
          </div>
        </div>
        <div class="item">
          <div class="item_title">会员活跃策略</div>
          <div class="item_content">
            <div>
              <div>策略介绍：</div>
              <div>{{ queryParams.member.desc }}</div>
            </div>
          </div>
          <div class="item_table">
            <el-switch v-model="queryParams.member.switch" @change="(e) => updateConfigure('member')" />
          </div>
          <div class="item_table">
            <el-input-number placeholder="请输入比例系数" v-model="queryParams.member.number" :min="0" :precision="2" @change="(e) => updateConfigure('member')" />
          </div>
          <div class="item_table">
            <el-button type="text" v-hasPermi="['customer:growthRule:query']" @click="handleUpdate('member', queryParams.member.id, queryParams.consume.number)">设置</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { list, update } from "@/api/customer/growthRecord";

export default {
  name: "GrowthRecord",
  components: {},
  data() {
    return {
      routerView:
        window.location.hash.split("?")[0].split("/").length > 3 ? true : false,
      // 遮罩层
      loading: true,
      // 查询参数
      queryParams: {
        rfm: {
          switch: false,
          number: 0,
          desc: ''
        },
        consume: {
          switch: false,
          number: 0,
          desc: ''
        },
        member: {
          switch: false,
          number: 0,
          desc: ''
        }
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询客户等级列表 */
    getList() {
      this.loading = true
      list().then(res => {
        this.loading = false
        const rfm = {
          id: res.rows.filter(item => item.growthStrategyType === 'rfm')[0].growthStrategyId,
          switch: res.rows.filter(item => item.growthStrategyType === 'rfm')[0].growthStrategyFlag,
          number: res.rows.filter(item => item.growthStrategyType === 'rfm')[0].growthRatio / 100,
          desc: res.rows.filter(item => item.growthStrategyType === 'rfm')[0].growthStrategyDescription
        }
        const consume = {
          id: res.rows.filter(item => item.growthStrategyType === 'consume')[0].growthStrategyId,
          switch: res.rows.filter(item => item.growthStrategyType === 'consume')[0].growthStrategyFlag,
          number: res.rows.filter(item => item.growthStrategyType === 'consume')[0].growthRatio / 100,
          desc: res.rows.filter(item => item.growthStrategyType === 'consume')[0].growthStrategyDescription
        }
        const member = {
          id: res.rows.filter(item => item.growthStrategyType === 'member')[0].growthStrategyId,
          switch: res.rows.filter(item => item.growthStrategyType === 'member')[0].growthStrategyFlag,
          number: res.rows.filter(item => item.growthStrategyType === 'member')[0].growthRatio / 100,
          desc: res.rows.filter(item => item.growthStrategyType === 'member')[0].growthStrategyDescription
        }
        this.queryParams = {
          rfm,
          consume,
          member
        }
      })
    },
    /**
     * 修改配置
     */
    updateConfigure(val) {
      const params = {
        growthStrategyId: this.queryParams[val].id,
        growthStrategyFlag: this.queryParams[val].switch,
        growthRatio: this.queryParams[val].number * 100
      }
      update(params).then(res => {
        this.getList()
      }).catch(() => {
        this.getList()
      })
    },
    /** 修改按钮操作 */
    handleUpdate(type, id, growthRatio) {
      const path = `/customer/growthRecord/edit`
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          type,
          growthRatio,
          growthStrategyId: id
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.title {
  font-size: 22px;
  font-weight: 600;
}
.hint {
  font-size: 18px;
  font-weight: 600;
}
.border{
  width: 100%;
  padding-bottom: 50px;
  margin-top: 40px;
  border: 1px solid #333;
  .title{
    width: 160px;
    position: relative;
    left: 23px;
    top: -15px;
    background: #fff;
    text-align: center;
  }
  .switch{
    position: relative;
    left: 55%;
    width: 15%;
    text-align: center;
    font-weight: 600;
  }
  .growth {
    position: relative;
    top: -21px;
    left: 70%;
    width: 15%;
    text-align: center;
    font-weight: 600;
  }
}
.item {
  display: flex;
  .item_title {
    width: 15%;
    margin: auto 0;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }
  .item_content{
    width: 40%;
    font-size: 16px;
    font-weight: 600;
  }
  .item_table {
    width: 15%;
    margin: auto 0;
    text-align: center;
  }

  /deep/ .item_table .el-input-number__decrease {
    display: none;
  }
  /deep/ .item_table .el-input-number__increase {
    display: none;
  }
}
</style>