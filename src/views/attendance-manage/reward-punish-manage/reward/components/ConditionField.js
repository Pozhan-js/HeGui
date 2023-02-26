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
        this.list = res.rows || res.data
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
            key={item.code}
            value={item.code}
            label={item.name}
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
    multiple: Boolean,
    value: [String, Number]
  },

  computed: {
    mulValue() {
      return this.value?.split(',') ?? []
    }
  },

  watch: {
    property(current, prev) {
      if (current.code !== prev?.code) {
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
      return <div class='empty'>——</div>
    },

    renderSelect() {
      const path = `/attendanceAwardRule/dict/list/${this.property.code}`
      return (
        <ApiSelect
          disabled={this.disabled}
          style={{ width: '100%' }}
          key={this.condition}
          path={path}
          condition={this.condition}
          value={this.value}
          onInput={this.changeValue}
        />
      )
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
  },

  // eslint-disable-next-line vue/require-render-return
  render(h) {
    if (!this.property) return <div>——</div>
    switch (this.property.type) {
      case 'string':
        return this.renderNumberInput()
      case 'enum':
        return this.renderSelect()
    }
  }
})
