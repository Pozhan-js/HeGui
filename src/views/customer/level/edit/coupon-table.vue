<template>
  <div class="coupon-table" v-if="value && value.length">
    <div class="coupon-table__header">
      <div>优惠券名称</div>
      <div>优惠内容</div>
      <div class="coupon-table__row--short">类型</div>
      <div>剩余可用券数</div>
      <div>升级赠送数量</div>
      <div class="coupon-table__row--short">操作</div>
    </div>
    <div v-for="item in value" :key="item.couponId" class="coupon-table__content">
      <div>{{ item.couponName }}</div>
      <div>{{ item.couponRule }}</div>
      <div class="coupon-table__row--short">{{ typeFormat(item.type) }}</div>
      <div :class="{warning: item.remainingNum < 200}">{{ item.remainingNum }}</div>
      <div>
        <el-input-number :min="1" :max="item.remainingNum != null ? +item.remainingNum : undefined" :precision="0" style="width: 100%;" @input="input => updateNum(item, input)" :value="item.giftNum" />
        </div>
      <div class="coupon-table__row--short"><el-button type="text" @click="handleRemove(item)">删除</el-button></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Array
  },
  data() {
    return {
      typeOptions: []
    }
  },
  created() {
    this.getDicts("coupon_type").then((response) => {
      this.typeOptions = response.data;
    });
  },
  watch: {
    value: console.log
  },
  methods: {
    // 优惠券类型字典翻译
    typeFormat(type) {
      return this.selectDictLabel(this.typeOptions, type);
    },

    updateNum(target, input) {
      this.$emit('input', this.value.map(item => item === target ? ({ ...item, giftNum: input }) : item))
    },

    /** checkBox 改变事件 */ 
    handleRemove(removeItem) {
      this.$emit('input', this.value.filter(item => item !== removeItem))
    },
  }
}
</script>

<style lang="scss" scoped>
.coupon-table {
  width: 90%;
  border: 1px solid #e2e2e2;
  .coupon-table__header, .coupon-table__content {
    display: flex;
    background: #f8f8f9;
    text-align: center;
    div {
      width: 20%;
      border-right: 1px solid #e2e2e2;
    }
    .coupon-table__row--short {
      width: 10%;
    }
  }
  .coupon-table__content {
    border-top: 1px solid #e2e2e2;
    .warning {
      color: red;
      font-weight: 700;
    }
  }
}
</style>