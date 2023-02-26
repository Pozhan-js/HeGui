<template>
  <div v-html="DTimeHtml"></div>
</template>

<script>
export default {
  name: 'BreakTime',
  props: {
    dateTime: String
  },
  computed: {
    DTimeHtml() {
      const matchDate = this.dateTime && this.dateTime.match(/(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})/)
      return matchDate ? `${matchDate[1]}<br/>${matchDate[2]}` : '-' 
    }
  }
}
</script>

<style>

</style>