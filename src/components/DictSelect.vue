<template>
  <el-select :value="value" :disabled="disabled" v-bind="$attrs" v-on="$listeners" @change="v => $emit('input', v)">
    <el-option
      v-for="i in dicts"
      :key="i[valueKey]"
      :value="i[valueKey]"
      :label="i[labelKey]"
    />
  </el-select>
</template>

<script>
export default {
  props: {
    dict: String,
    value: [String, Number, Array],
    labelKey: {
      type: String,
      default: 'dictLabel'
    },
    valueKey: {
      type: String,
      default: 'dictValue'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dicts: []
    }
  },
  created() {
    this.getDicts(this.dict).then(res => {
      this.dicts = res.data
      this.$emit('update:outDicts', this.dicts)
      this.$emit('get-dict-done', this.dicts)
    })
  }
}
</script>

<style>
</style>
