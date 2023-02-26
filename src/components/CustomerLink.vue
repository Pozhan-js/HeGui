<template>
  <jump :path="path" :query="{ customerId: row.customerId}">
    <img
      :src="row.avatar ? row.avatar : '/avatar.png'"
      style="width: 40px; height: 40px; border-radius: 50%"
    >
    <div class="outer-link--text">{{ row.nickname }}</div>
  </jump>
</template>

<script>
export default {
  name: 'CustomerLink',
  props: {
    row: Object,
    path: {
      type: String,
      default: '/customer/customerInfo'
    }
  }
}
</script>
