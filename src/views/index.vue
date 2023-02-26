<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="18">
      <el-col :span="18">
        <!-- 核心指示数据 -->
        <core-indicators />
        <!-- 数据概况 -->
        <overview class="mt10" />
        <!-- 待办事项 -->
        <todo-list class="mt10" />
        <!-- 服务分析 -->
        <serve-analysis class="mt10" />
      </el-col>
      <el-col :span="6">
        <!-- 销售排名 -->
        <ranking-list />
        <!-- 快捷菜单 -->
        <shutcut-menu class="mt10" />
        <!-- 系统通知 -->
        <sys-notice class="mt10" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CoreIndicators from './dashboard/CoreIndicators'
import Overview from './dashboard/Overview'
import TodoList from './dashboard/TodoList'
import ServeAnalysis from './dashboard/ServeAnalysis'
import SysNotice from './dashboard/SysNotice'
import ShutcutMenu from './dashboard/ShutcutMenu'
import RankingList from './dashboard/RankingList'
import { getOrgTree } from "@/api/utils"

export default {
  name: 'Index',
  components: {
    CoreIndicators,
    Overview,
    TodoList,
    ServeAnalysis,
    SysNotice,
    ShutcutMenu,
    RankingList,
  },
  data() {
    return {
      obj: {
        orgOptions: null,
        periodTimeTypeOptions: null
      }
    }
  },
  provide() {
    return {
      obj: this.obj
    }
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.obj.orgOptions = res.data
      }
    })

    this.getDicts("data_period_time_type").then((res) => {
      this.obj.periodTimeTypeOptions = res.data;
    })
  },
}
 
</script>

<style lang="scss">
.dashboard-editor-container {
  padding: 20px;
  background-color: #F5F5F5;
  position: relative;
  font-family: 'Source Han Sans CN';
  .isLink {
    color: inherit;
  }
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
 
  .el-card__header {
    background: #EAEAF0;
    padding: 8px 24px;
    .el-form-item{
      margin-bottom: 0;
      &:last-child{
        margin-right: 0;
      }
    }
    .el-input--medium .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
    .el-form-item__label{
      font-weight: 400;
    }
  }
  .el-card__body {
    padding: 15px 10px;
    line-height: 1.6;
    color: rgba($color: #000000, $alpha: 0.6);
  }
  .flex-between-center{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .panel-group {
    .card-panel {
      display: flex;
      align-items: center;
      .card-panel-icon {
        width: 57px;
        height: 57px;
      }
      .card-panel-description {
        line-height: 1.2;
        .card-panel-text {
          margin-bottom: 6px;
        }
        .card-panel-num {
          font-size: 22px;
          font-weight: 500;
          color: #000;
        }
      }
    }
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

</style>
