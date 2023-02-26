<template>
  <div class="demo-image__preview">
    <el-dialog
      title="推广二维码"
      :visible.sync="open"
      width="400px"
      append-to-body
      @close="onClose"
    >
      <div style="display: flex;" v-if="type !== 'base64'">
        <div style="width: 150px;">推广链接：</div>
        <div>{{ link }}</div>
        <div style="">
          <el-button style="padding: 4px 15px;" type="text" size="small"  @click="copyText">复 制</el-button>
        </div>
        <input
          id="copy_content"
          type="text"
          value=""
          style="position: absolute; top: 0; left: 0; opacity: 0; z-index: -10"
        />
      </div>
      <div style="text-align: center;">
        <img style="height: 200px;width: 200px;" :src="promoteImg" />
      </div>
      <el-button style="margin-left: 40%;" type="text" size="small" @click="downloadImg"
        >下载二维码</el-button
      >
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcode";

export default {
  name: "Promote",
  props: { },
  data() {
    return {
      open: false,
      link: null,
      type: null,
      promoteImg: null,
    };
  },
  methods: {
    // 设置数据
    setData({ link, open, type }) {
      this.link = link
      this.open = open
      this.type = type
    },
    // 推广链接
    generate() {
      if (this.type === 'base64') {
        this.promoteImg = 'data:image/png;base64,' + this.link;
        this.open = true;
      } else {
        QRCode.toDataURL(this.link).then((res) => {
          this.promoteImg = res;
          this.open = true;
        });
      }
    },
    // 下载二维码
    downloadImg() {
      const a = document.createElement("a");
      const event = new MouseEvent("click");
      // 自定义下载后图片的名称
      a.download = "二维码";
      a.href = this.promoteImg;
      a.dispatchEvent(event);
    },
    // 复制文字
    copyText() {
      //获取要赋值的input的元素
      const inputElement = document.getElementById("copy_content");
      //给input框赋值
      inputElement.value = this.link;
      //选中input框的内容
      inputElement.select();
      // 执行浏览器复制命令
      document.execCommand("Copy");
      this.msgSuccess("复制成功");
    },
    // 关闭删除
    onClose() {
      this.open = false;
      this.link = null;
    },
  },
};
</script>
<style scoped lang="scss">
</style>