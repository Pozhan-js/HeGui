<template>
  <el-dialog :visible.sync="visible" title="设置奖品获奖概率" width="650px">
    <el-form>
      <el-table :data="dataSource">
        <el-table-column label="奖品名" prop="awardName" />
        <el-table-column label="奖品等级" prop="awardLevel" :formatter="(_, r, v) => selectDictLabel(levelOptions, v)" />
        <el-table-column label="奖品数量" prop="totalNum" />
        <el-table-column label="设置概率" prop="winRate" min-width="120">
          <template slot-scope="scope">
            <div style="display: flex; align-items: center;">
              <el-input-number
                :value="scope.row.winRate != null ? scope.row.winRate / 100 : undefined"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="请输入概率"
                class="input-append"
                @change="value => scope.row.winRate = value * 100"
              >
                <template slot="append">%</template>
              </el-input-number>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-row class="mt10">
      <el-col :span="13">
        <span style="padding: 2px 10px;background-color: #fdf6ec;color: #e6a23c;">
          <i class="el-icon-warning" />
          请将概率合计设置为 100%
        </span>
      </el-col>
      <el-col :span="11">当前概率合计：{{ totalObj.now }}%，需{{ totalObj.disparity >= 0 ? '增加' : '减少' }} {{ totalObj.disparity }}%</el-col>
    </el-row>
    <span slot="footer">
      <el-button :disabled="totalObj.now !== 100" type="primary" size="small" @click="confirmDialog">确 定</el-button>
      <el-button size="small" @click="visible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Decimal from 'decimal.js'

export default {
  props: {
    levelOptions: Array
  },
  data() {
    return {
      visible: false,
      dataSource: []
    }
  },
  computed: {
    totalObj() {
      const num = this.dataSource.reduce((val, item) => {
        if (item.winRate !== undefined && item.winRate !== '') {
          return new Decimal(val || 0).plus(item.winRate || 0).toNumber()
        }
        return val
      }, 0)

      return {
        now: num / 100,
        disparity: new Decimal(100).minus(num / 100).toNumber()
      }
    }
  },
  methods: {
    openDialog(arr) {
      this.dataSource = arr
      this.visible = true
    },
    confirmDialog() {
      this.$emit('confirm', this.dataSource)
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-append {
    /deep/ .el-input__inner {
      padding-right: 0;
    }
  }
</style>
