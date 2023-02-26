<template>
  <div class="empty">
    <img src="@/assets/images/empty.png" class="image"/>
    <span class="text">暂无数据</span>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
  .empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .image {
    width: 130px;
  }
  .text {
    color: #666;
    font-size: 14px;
  }
</style>
