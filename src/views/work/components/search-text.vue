<template>
  <span v-if="text.indexOf(searchValue) > -1">
    {{beforeText}}<span style="color: #f50">{{ searchValue }}</span>{{afterText}}
  </span>
  <span v-else>{{ text }}</span>
</template>

<script>
export default {
  props: {
    text: String,
    searchValue: String
  },
  computed: {
    beforeText() {
      return this.text.substr(0, this.text.indexOf(this.searchValue))
    },
    afterText() {
      return this.text.substr(this.text.indexOf(this.searchValue) + this.searchValue.length)
    },
  },
};
</script>

<style></style>