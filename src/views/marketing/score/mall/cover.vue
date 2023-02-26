<template>
  <div class="cover">
    <img class="cover-img" v-if="type === 'goods'" :src="domain + cover"/>
    <img class="cover-img" v-else src="@/assets/images/coupon.png"/>
    <span class="cover-name">{{name}}</span>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    type: String,
    cover: String
  },
  data() {
    return {
      domain: sessionStorage.getItem('prefix')
    }
  },
}
</script>

<style scoped>
.cover {
  width: 100%;
  display: flex;
  align-items: center;
}
.cover-img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}
.cover-name {
  flex: 1;
  text-align: left;
  min-width: 80px;
}
</style>