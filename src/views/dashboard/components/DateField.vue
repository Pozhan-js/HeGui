<template>
  <el-form-item :label="label" prop="timeValue">
    <el-select
      v-model="queryParams.periodTimeType"
      placeholder="请选择统计时间"
      size="small"
      style="width: 80px"
    >
      <el-option
        v-for="dict in obj.periodTimeTypeOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :value="dict.dictValue"
      />
    </el-select>
    <el-date-picker
      v-model="queryParams.time"
      :type="{1 : 'date', 3: 'week', 2: 'month'}[queryParams.periodTimeType]"
      :clearable="false"
      placeholder="选择日期"
      style="width:140px"/>
  </el-form-item>
</template>

<script>
  export default {
    name: 'DateField',
    props: {
      queryParams: {
        type: Object
      },
      label: {
        type: String,
        default: '统计时间'
      }
    },
    inject: ['obj'],
  }
</script>

<style lang="scss" scoped>

</style>