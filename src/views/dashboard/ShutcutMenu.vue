<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>快捷菜单</span>
    </div>
    <el-row :gutter="40">
      <el-col :xs="24" :md="12" :lg="8"   v-for="item in validList" :key = "item.title">
        <jump :path="item.path" class="shutcut-card">
            <div class="shutcut-card-wrapper">
              <svg-icon :icon-class="item.icon" class-name="shutcut-card-icon" />
            </div>
            <div class="">{{item.name}}</div>
        </jump>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import Jump from '@/components/Jump'  
  const menus = [
    {name: '作战地图', path: '/battleMap', icon: 'battle-map'},
    {name: '配送订单', path: '/order/delivery/allorder', icon: 'delivery-order'},
    {name: '店铺', path: '/merchant/shop', icon: 'shutcut-shop'},
    {name: '商品', path: '/goodsmanage/goods', icon: 'shutcut-goods'},
    {name: '配送员', path: '/org/distribution/distributioninfo', icon: 'shutcut-distribution'},
    {name: '会员列表', path: '/customer/customerInfo', icon: 'shutcut-customer'},
    {name: '对账单', path: '/finance-affairs/reconciliation/detail', icon: 'shutcut-reconciliation'},
    {name: '收益明细', path: '/deliver/detail', icon: 'shutcut-profit'},
    {name: '奖惩审核', path: '/attendance/rewardAudit', icon: 'shutcut-rewardAudit'},
    {name: '优惠券列表', path: '/marketing/coupons/marketing', icon: 'shutcut-coupons'},
    {name: '排班管理', path: '/attendance-manage/workforce', icon: 'shutcut-workforce'},
    {name: '会员标签', path: '/customer/label', icon: 'shutcut-label'},
  ]

  export default {
    name: 'ShutcutMenu',
    components: {
      Jump
    },
    data() {
      return {
        list: menus
      }
    },
    computed: {
      validList() {
        return this.list.filter(route=> {
          const resolver = this.$router.resolve(route.path)
          return resolver.resolved?.path === route.path
        })
      }
    },
  }
</script>

<style lang="scss" scoped>
.shutcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 21px;
  margin: 10px 5px;
  color: rgba($color: #000, $alpha: 0.6)
}
.shutcut-card-wrapper{
  width: 27px;
  height: 27px;
  margin-bottom: 5px;
}
.shutcut-card-icon {
  width: 100%;
  height: 100%;
}
</style>