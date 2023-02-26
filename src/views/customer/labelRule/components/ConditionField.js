/* eslint-disable vue/one-component-per-file */
import DictSelect from '@/components/DictSelect.vue'
import Vue from 'vue'
import request from '@/utils/request'

const ApiSelect = Vue.extend({
  name: 'ApiSelect',
  props: {
    path: String,
    condition: String,
    disabled: Boolean,
    multiple: Boolean,
    value: [Number, String, Array]
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      request({
        url: this.path,
        method: 'get'
      }).then((res) => {
        this.list = res.data
      })
    }
  },
  render(h) {
    return (
      <el-select
        style={{ width: '100%' }}
        value={this.value}
        filterable
        disabled={this.disabled}
        onChange={(e) => this.$emit('input', e)}
        multiple={this.multiple}
      >
        {this.list.map((item) => (
          <el-option
            key={item.levelId}
            value={item.levelId}
            label={item.levelName}
          />
        ))}
      </el-select>
    )
  }
})

export default Vue.extend({
  components: { DictSelect, ApiSelect },
  props: {
    condition: String,
    property: Object,
    disabled: Boolean,
    value: [String, Number]
  },

  computed: {
    mulValue() {
      return this.value?.split(',') ?? []
    }
  },

  watch: {
    property(current, prev) {
      if (current.propertyId !== prev?.propertyId) {
        this.$emit('input', void 0)
      }
    },
    condition(current, prev) {
      if (current !== prev) {
        this.$emit('input', void 0)
      }
    }
  },

  methods: {
    changeValue(value) {
      this.$emit('input', Array.isArray(value) ? (value.join(',') || void 0) : value)
    },
    changeValueWithIndex(value, index) {
      const values = this.mulValue.slice()
      values[index] = value
      this.$emit('input', values.join(',') || void 0)
    },
    renderEmpty() {
      return <div class='empty'>/</div>
    },

    renderSelect() {
      switch (this.property.callType) {
        case 'dict': {
          const multiple = ['IN', 'NOT_IN'].includes(this.condition)
          return (
            <DictSelect
              disabled={this.disabled}
              style={{ width: '100%' }}
              multiple={multiple}
              filterable
              key={this.condition}
              dict={this.property.callRoute}
              value={multiple ? this.mulValue : this.value}
              onInput={this.changeValue}
            />
          )
        }
        case 'interface': {
          const multiple = ['IN', 'NOT_IN'].includes(this.condition)
          return (
            <ApiSelect
              disabled={this.disabled}
              style={{ width: '100%' }}
              multiple={multiple}
              key={this.condition}
              path={this.property.callRoute}
              condition={this.condition}
              value={multiple ? this.mulValue : this.value}
              onInput={this.changeValue}
            />
          )
        }
      }
    },

    renderDate() {
      if (this.condition === 'BETWEEN') {
        if (this.property.callType === 'date') {
          return (
            <el-date-picker
              disabled={this.disabled}
              style={{ width: '100%' }}
              type='monthrange'
              valueFormat='yyyy-MM-01'
              value={this.mulValue}
              onInput={this.changeValue}
              rangeSeparator='至'
              startPlaceholder='开始月份'
              endPlaceholder='结束月份'
            />
          )
        }
        return (
          <el-date-picker
            disabled={this.disabled}
            style={{ width: '100%' }}
            type='datetimerange'
            valueFormat='yyyy-MM-dd HH:mm:ss'
            format='yyyy-MM-dd HH:mm:ss'
            value={this.mulValue}
            onInput={this.changeValue}
            default-time={['00:00:00', '23:59:59']}
            rangeSeparator='至'
            startPlaceholder='开始日期'
            endPlaceholder='结束日期'
          />
        )
      } else {
        return this.renderEmpty()
      }
    },

    renderNumberInput() {
      switch (this.condition) {
        case 'BETWEEN':
          return (
            <el-row gutter={24}>
              <el-col span={11}>
                <el-input-number
                  disabled={this.disabled}
                  style={{ width: '100%' }}
                  value={this.mulValue[0]}
                  onInput={value => this.changeValueWithIndex(value, 0)}
                />
              </el-col>
              <el-col span={2} style={{ textAlign: 'center' }}>-</el-col>
              <el-col span={11}>
                <el-input-number
                  disabled={this.disabled}
                  style={{ width: '100%' }}
                  value={this.mulValue[1]}
                  onInput={value => this.changeValueWithIndex(value, 1)}
                />
              </el-col>
            </el-row>
          )
        default:
          return (
            <el-input-number disabled={this.disabled} style={{ width: '100%' }} value={this.value} onInput={this.changeValue} />
          )
      }
    },

    renderInput() {
      switch (this.condition) {
        // case 'BETWEEN':
        //   return (
        //     <div class='input-group'>
        //       <el-input
        //         value={this.mulValue[0]}
        //         onInput={value => this.changeValueWithIndex(value, 0)}
        //       />
        //       <div>-</div>
        //       <el-input
        //         value={this.mulValue[1]}
        //         onInput={value => this.changeValueWithIndex(value, 1)}
        //       />
        //     </div>
        //   )
        case 'NOT_NULL':
        case 'IS_NULL':
          return this.renderEmpty()
        default:
          return <el-input disabled={this.disabled} value={this.value} onInput={this.changeValue} />
      }
    }
  },

  // eslint-disable-next-line vue/require-render-return
  render(h) {
    if (!this.property) return <div>/</div>
    switch (this.property.propertyType) {
      case 'int':
        return this.renderNumberInput()
      case 'string':
        return this.property.callType === 'interface'
          ? this.renderSelect()
          : this.renderInput()
      case 'date':
        return this.renderDate()
      case 'enum':
        return this.renderSelect()
    }
  }
})
