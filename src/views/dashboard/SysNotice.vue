<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>系统通知</span>
    </div>
    <div class="notice-list">
      <el-row :gutter="16" class="notice-list-item" v-for="item in list" :key="item.noticeId">
        <el-col :span="17" class="notice-list-title">
           <el-tooltip class="item" effect="dark" :content="item.noticeContent" placement="top-start">
              <span class="ellipsis">{{item.noticeTitle}}</span>
           </el-tooltip>
        </el-col>
        <el-col :span="7" class="notice-list-time">{{item.createTime}}</el-col>
      </el-row>
    </div >
  </el-card>
</template> 

<script>
  import { getNoticeList } from '@/api/home'
  export default {
    name: 'SysNotice',
    components: {},
    data() {
      return {
        list: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.loading = true;
        getNoticeList().then((response) => {
          this.list = response.rows
          this.list.map(item=>{
            item.createTime = item.createTime.trim().split(' ')[0]
            return item
          })
          this.loading = false;
        });
      },
    }
  }
</script>

<style lang="scss" scoped>
.notice-list {
   margin: -15px -10px;
   &-item {
     padding: 0 24px;
     line-height: 28px;
     border-bottom: 1px solid rgba($color: #000, $alpha: 0.2);
   }
   &-title{
     display: flex;
     align-items: center;
     padding: 0 20px 0 10px;
     &::before{
        content: '';
        flex: 0 0 5px;
        width: 5px;
        height: 5px;
        margin-right: 10px;
        border-radius: 50%;
        opacity: 1;
        background: rgba(255,138,0,1);
     }
   }
   &-time{
     
     text-align: right;
     font-size: 12px;
     color: rgba($color: #000, $alpha: 0.2)
   }
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: inherit;
  cursor: pointer;
}
</style>