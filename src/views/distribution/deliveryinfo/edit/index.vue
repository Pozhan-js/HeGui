<template>
  <div style="padding: 20px" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="姓名" prop="deliveryName">
        <el-input
          v-model="form.deliveryName"
          style="width: 300px"
          placeholder="请输入姓名"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="telephone">
        <el-input
          clearable
          :disabled="routerType === 'update'"
          v-model="form.telephone"
          style="width: 300px"
          placeholder="请输入送货人手机号"
          @change="inputChange"
        />
        <el-button
          v-if="routerType !== 'update'"
          size="small"
          style="margin-left: 20px"
          :disabled="!sendAuthCode"
          @click="handleCode"
          >{{ auth_time ? auth_time : null }}验证码</el-button
        >
      </el-form-item>
      <el-form-item v-if="routerType !== 'update'" label="验证码" prop="telephoneCode">
        <el-input
          v-model="form.telephoneCode"
          style="width: 300px"
          placeholder="请输入验证码"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          :disabled="routerType === 'update'"
          v-model="form.orgId"
          :options="orgOptions"
          style="width: 300px"
          placeholder="请选择组织"
          :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item v-if="routerType !== 'update'" label="密码" prop="password">
        <el-input
          v-model="form.password"
          style="width: 300px"
          placeholder="请输入密码"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        type="primary"
        @click="submitForm"
        :loading="this.$store.state.isLoading"
        >确 定</el-button
      >
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
import {
  addDeliveryinfo,
  getDeliveryinfo,
  updateDeliveryinfo,
} from "@/api/distribution/deliveryinfo";
import { getOrgTree, telephoneDirect } from "@/api/utils";
import { Cascader } from "ant-design-vue";
import { flatten, searchSuperior } from "@/utils/array";
import { encrypt, deliveryEncrypt } from "@/utils/jsencrypt";


export default {
  components: {
    Cascader,
  },
  data() {
    return {
      loading: false,
      // 界面类型
      routerType: this.$route.query.type,
      // 组织
      orgOptions: [],
      // 供应商列表
      orgList: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deliveryName: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
          // { max: 15, message: "名称不能超过15个字符", trigger: "blur" },
        ],
        orgId: [
          { required: true, message: "组织不能为空", trigger: "blur" },
        ],
        telephone: [
          { validator: this.checkPhone, required: true, trigger: "blur" },
        ],
        distributionFeeType: [
          { required: true, message: "配送费类型不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
        ],
        telephoneCode: [
          { required: true, message: "验证码不能为空", trigger: "blur" },
        ],
      },
      sendAuthCode: true,
      auth_time: 0,
    };
  },
  mounted() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data;
      }
      if (this.$route.query.type !== "add") {
        this.handleInfo(this.$route.query.deliveryId);
      }
    });
    this.getDicts("finance_distribution_fee_type").then((response) => {
      this.distributionFeeTypeOptions = response.data;
    });
  },
  methods: {
    // 输入框值改变
    inputChange() {
      this.form.telephone = this.form.telephone.replace(/[^\d]/g, "");
    },
    //手机号验证
    checkPhone(rule, value, callback) {
      if (!value) {
        return callback(new Error("手机号不能为空"));
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/;
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error("请输入正确的手机号"));
        }
      }
    },
    // 查询详情
    handleInfo(deliveryId) {
      getDeliveryinfo(deliveryId).then((res) => {
        const orgArr = flatten(this.orgOptions, "children");
        const orgId = searchSuperior(res.data.orgId, "id", orgArr, "parentId");
        this.form = {
          deliveryId: res.data.deliveryId,
          deliveryName: res.data.deliveryName,
          orgId,
          telephone: res.data.telephone
        }
      });
    },
    // 表单重置
    reset() {
      this.form = {
        orgId: null,
      };
      this.resetForm("form");
    },
    /** 获取验证码 */
    handleCode() {
      this.$refs["form"].validateField("telephone", (valid) => {
        if (!valid) {
          telephoneDirect({
            telephone: this.form.telephone,
            type: "SMS_USER_REGISTER",
          }).then((res) => {
            this.form.password = this.form.telephone;
            this.getAuthCode();
          });
        }
      });
    },
    /** 短信倒计时 */
    getAuthCode() {
      this.sendAuthCode = false;
      this.auth_time = 60;
      let auth_timetimer = setInterval(() => {
        this.auth_time--;
        if (this.auth_time <= 0) {
          this.sendAuthCode = true;
          clearInterval(auth_timetimer);
        }
      }, 1000);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${
              this.form.deliveryId != null ? "修改" : "新增"
            }送货员信息?`,
            "警告",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              const params = {
                ...this.form,
                password: this.form.deliveryId != null ? this.form.password : encrypt(this.form.password),
                orgId:
                  this.form.orgId.length > 0
                    ? this.form.orgId.slice(-1)[0]
                    : this.form.orgId,
              };
              return this.form.deliveryId != null
                ? updateDeliveryinfo(params)
                : addDeliveryinfo(params);
            })
            .then(() => {
              this.msgSuccess(`${this.form.deliveryId != null ? "修改" : "新增"}送货员信息成功`);
              this.cancel();
            });
        }
      });
    },
    /**
     * 返回界面
     */
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style scoped lang="scss">
.dialog-footer {
  padding-bottom: 40px;
  text-align: center;
}

/deep/ .el-input-number {
  width: 100px !important;
  .el-input__inner {
    padding: 0px;
    border-style: none;
    border-bottom: 1px solid;
    border-radius: 0px;
  }
}
/deep/ .el-input-number__decrease {
  display: none;
}
/deep/ .el-input-number__increase {
  display: none;
}
</style>
