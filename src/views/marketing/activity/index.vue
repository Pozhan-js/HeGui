<template>
  <div class="activity">
    <div class="activity__item">
      <img src="~@/assets/images/prize-wheel.png">
      <div class="activity__item-mask">
        <el-button v-hasPermi="['marketing:lotteryActivity:add']" type="primary" icon="el-icon-plus" @click="$router.push({ path: './edit' })">创建活动</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss">
.activity {
  padding: 30px;
  display: flex;
  &__item {
    position: relative;
    font-size: 0;
    border-radius: 3px;
    overflow: hidden;
    img {
      width: 240px;
      height: 400px;
    }
    &-mask {
      position: absolute;
      font-size: initial;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1;
      opacity: 0;
      transition: all .3s ease-in;
      background-color: rgba(7, 17, 27, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
