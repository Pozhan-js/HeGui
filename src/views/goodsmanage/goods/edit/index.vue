<template>
  <div style="padding: 20px">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="商品信息" name="info" v-if="back">
        <div>
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-form-item label="商品编码" prop="goodsCode">
              <el-input
                style="width: 30%"
                v-model="form.goodsCode"
                placeholder="请输入商品编码"
              />
            </el-form-item>

            <el-form-item label="商品排序" prop="hotSaleSort">
              <el-input-number
                style="width: 30%"
                v-model="form.hotSaleSort"
                :min="0"
                placeholder="请输入商品排序"
              />
            </el-form-item>
            <el-form-item label="商品名称" prop="goodsName">
              <el-input
                style="width: 30%"
                v-model="form.goodsName"
                placeholder="请输入商品名称"
              />
            </el-form-item>
            <el-form-item label="商品分组" prop="groupId">
              <el-select
                multiple
                v-model="form.groupId"
                style="width: 30%"
                placeholder="请选择商品分组"
                @change="changeGroup"
              >
                <el-option
                  v-for="group in groupOptions"
                  :key="group.groupId"
                  :label="group.groupName"
                  :value="group.groupId"
                  :disabled="groupType && group.disabled"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="商品主图"
              prop="thumbnail"
              class="uploader-form-item"
            >
              <ResourcePicker
                v-model="form.thumbnail"
                size-hint="建议：280*280px, 最多上传1张"
              />
            </el-form-item>
            <el-form-item label="商品滚动图" prop="bannerImgs">
              <ResourcePicker
                v-model="form.bannerImgs"
                :limit="15"
                size-hint="建议：750*600px, 最多上传15张"
              />
            </el-form-item>
            <el-form-item label="商品库存" prop="totalStock">
              <el-input-number
                v-model="form.totalStock"
                @change="
                  (value) => {
                    if (value) {
                      this.form.totalStock = Math.floor(value * 100) / 100;
                    }
                  }
                "
                :min="0"
                label="请输入商品库存"
              />
            </el-form-item>
            <el-form-item label="商品价格" prop="price">
              <el-input-number
                v-model="form.price"
                @change="
                  (value) => {
                    if (value) {
                      this.form.price = Math.floor(value * 100) / 100;
                    }
                  }
                "
                :min="0"
                label="请输入商品价格"
              /><span style="margin-left: 10px">元</span>
            </el-form-item>
            <el-form-item label="商品质量" prop="weight">
              <el-input-number
                v-model="form.weight"
                :min="0"
                label="请输入商品质量"
              /><span style="margin-left: 10px">g</span>
            </el-form-item>
            <el-form-item label="商品描述" prop="goodsDescription">
              <el-input
                type="textarea"
                :rows="2"
                style="width: 30%;"
                placeholder="请输入商品描述"
                v-model="form.goodsDescription"
                maxlength="36"
                show-word-limit
              />
              <el-tooltip class="item" effect="dark" placement="right">
                <div slot="content">
                    <div style="font-size: 20px;margin-bottom: 10px;width: 400px;">将商品在微信分享给朋友时，该处填写的内容会展示在商品名称下面</div>
                    <div><img src="../../../../assets/images/describe.png" /></div>
                  </div>
                <el-button style="margin-left: 40px;" type="text">查看示例</el-button>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="商品卖点" prop="goodsFeature">
              <el-input
                type="textarea"
                :rows="2"
                style="width: 30%;"
                placeholder="请输入商品卖点"
                v-model="form.goodsFeature"
                maxlength="60"
                show-word-limit
              />
              <el-tooltip class="item" effect="dark" placement="right">
                <div slot="content">
                  <div style="font-size: 20px;margin-bottom: 10px;width: 400px;">填写的商品买点，会在商品详情页面的商品名称下面展示，最多展示2行</div>
                  <div><img src="../../../../assets/images/feature.jpg" style="height: 600px;" /></div>
                </div>
                <el-button style="margin-left: 40px;" type="text">查看示例</el-button>
              </el-tooltip>
              
            </el-form-item>
            <el-form-item label="是否上架" prop="isShelves">
              <el-radio-group v-model="form.isShelves" @change="changeShelves">
                <el-radio
                  v-for="dict in shelvesOptions"
                  :key="dict.dictValue"
                  :label="parseInt(dict.dictValue)"
                  >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="商品状态" prop="goodsStatus">
              <el-radio-group disabled v-model="form.goodsStatus">
                <el-radio
                  v-for="dict in goodsStatusOptions"
                  :key="dict.dictValue"
                  :label="parseInt(dict.dictValue)"
                  >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="会员折扣">
              <el-radio-group v-model="form.discount">
                <el-radio
                  v-for="dict in discountOptions"
                  :key="dict.dictValue"
                  :label="parseInt(dict.dictValue)"
                  >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="物流信息">
              <el-radio-group v-model="form.logisticsType">
                <el-radio
                  v-for="dict in logisticsTypeOptions"
                  :key="dict.dictValue"
                  :label="parseInt(dict.dictValue)"
                  >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button
              type="primary"
              @click="submitForm"
              :loading="this.$store.state.isLoading"
              >{{ $route.query.type !== "update" ? '保存并，下一步': '确定' }}</el-button
            >
            <el-button @click="cancel">取 消</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="form.goodsId" label="详情" name="details">
        <div v-if="dUpdate">
          <ResourcePicker
            v-model="form.detailsDescr"
            :limit="10"
            size-hint="建议图片大小540*338px, 最多10张"
          />
          <div slot="footer" class="dialog-footer" style="text-align: center">
            <el-button type="primary" @click="handleUpdateDecs"
              >确 定</el-button
            >
            <el-button @click="() => {
              dUpdate = false
            }">取 消</el-button>
          </div>
        </div>
        <div v-else style="display: flex;justify-content: space-around;">
          <div>
            <div style="border: 1px solid;width: 420px;height: 700px;overflow: auto;">
              <div v-for="(item,index) in form.detailsDescr" :key="index" style="margin: 10px;">
                <img style="width: 400px;height: 200px;" :src="prefix + item" >
              </div>
            </div>
            <el-button type="primary" style="width: 420px;margin-top:10px;" @click="() => {
              dUpdate = true
              form.detailsDescr = form.detailsDescr.toString()
            }">编 辑</el-button>
          </div>
        </div>
        <div class="dialog-footer" style="text-align: center">
          <el-button @click="cancel" type="danger" style="width: 420px;margin-top:10px;" v-if="!dUpdate">完 成</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { addGoods, getGoods, updateGoods, updateDetail } from "@/api/goodsmanage/goods";
import ResourcePicker from "@/components/ResourcePicker";
import { getDropDown } from "@/api/selectUtils";
import Decimal from "decimal.js";

export default {
  components: { ResourcePicker },
  data() {
    return {
      // 商品分组数据
      groupOptions: [],
      // 上下架
      shelvesOptions: [],
      // 物流信息字典
      logisticsTypeOptions: [],
      // 销售状态(销售中，仓库中，已售罄)字典
      salesStatusOptions: [],
      // 商品状态(草稿，已提交)字典
      goodsStatusOptions: [],
      // 会员折扣
      discountOptions: [],
      // 界面类型
      activeName: this.$route.query.activeName,
      // 修改详情
      dUpdate: false,
      // 表单参数
      form: {
        isShelves: 2,
        goodsStatus: 0,
      },
      // 是否是赠品
      groupType: null,
      dialogImageUrl: "",
      // 图片前缀
      prefix: sessionStorage.getItem("prefix"),
      dialogVisible: false,
      // 是否可以放回商品信息
      back: true,
      // 表单校验
      rules: {
        hotSaleSort: [
          { required: true, message: "商品排序不能为空", trigger: "blur" },
        ],
        goodsName: [
          { required: true, message: "商品名称不能为空", trigger: "blur" },
        ],
        groupId: [
          { required: true, message: "商品分组不能为空", trigger: "blur" },
        ],
        thumbnail: [
          { required: true, message: "商品缩略图不能为空", trigger: "blur" },
        ],
        totalStock: [
          { required: true, message: "商品库存不能为空", trigger: "blur" },
        ],
        price: [
          { required: true, message: "商品价格不能为空", trigger: "blur" },
        ],
        weight: [
          { required: true, message: "商品质量不能为空", trigger: "blur" },
        ],
        isShelves: [
          { required: true, message: "商品上下架不能为空", trigger: "blur" },
        ],
        goodsStatus: [
          { required: true, message: "商品状态不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    if (this.$route.query.type === "update") {
      this.handleUpdate(this.$route.query.goodsId);
    }
    getDropDown("goodsGroup").then((res) => {
      this.groupOptions = res.data;
    });
    this.getDicts("merchant_logistics_type").then((response) => {
      this.logisticsTypeOptions = response.data;
    });
    this.getDicts("merchant_sales_status").then((response) => {
      this.salesStatusOptions = response.data;
    });
    this.getDicts("merchant_goods_status").then((response) => {
      this.goodsStatusOptions = response.data;
    });
    this.getDicts("merchant_discount").then((response) => {
      this.discountOptions = response.data;
    });
    this.getDicts("merchant_is_shelves").then((response) => {
      this.shelvesOptions = response.data;
    });
  },
  methods: {
    /**
     * 图片上传成功
     */
    onSuccessFile(fileList, key) {
      const newFile = fileList.map((item) => {
        if (item.response) {
          return {
            name: item.name,
            uid: item.uid,
            url: item.response.data.remark + item.response.data.fileKey,
            urls: item.response.data.fileKey,
          };
        } else {
          return item;
        }
      });
      this.form[key] = newFile;
    },
    // 上下架状态改变
    changeShelves(value) {
      if (this.$route.query.type === "update") {
        if (value === 1) {
          this.form.goodsStatus = 1;
        }
      } else {
        this.form.goodsStatus = value === 1 ? 1 : 0;
      }
    },
    /**
     * 删除图片
     */
    handleRemove(fileList, key) {
      const newFile = fileList.map((item) => {
        if (item.response) {
          return {
            name: item.name,
            uid: item.uid,
            url: item.response.data.remark + item.response.data.fileKey,
            urls: item.response.data.fileKey,
          };
        } else {
          return item;
        }
      });
      this.form[key] = newFile;
    },
    /**
     * 打开图片查看
     */
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 选择分组
    changeGroup(val) {
      if (val.length > 1) {
        return;
      } else if (val.length === 0) {
        this.groupType = null;
        return;
      }
      const groupType = this.groupOptions.filter(
        (item) => item.groupId === val[0]
      )[0]?.groupType;
      this.groupType = groupType;
      this.groupOptions = this.groupOptions.map((item) => {
        return {
          ...item,
          disabled: item.groupType !== groupType,
        };
      });
      this.rules.totalStock[0].required = groupType === 2;
    },

    // 表单重置
    reset() {
      this.form = {
        goodsId: null,
        goodsCode: null,
        hotSaleSort: null,
        goodsName: null,
        groupId: null,
        thumbnail: null,
        bannerImgs: null,
        discount: null,
        isShelves: null,
        logisticsType: null,
        goodsStatus: 0,
      };
      this.resetForm("form");
    },
    // 编辑商品详情
    handleUpdateDecs() {
      this.$confirm(`是否确认修改商品详情`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const params = {
            goodsId: this.form.goodsId,
            detailsDescr: this.form.detailsDescr,
          };
          return updateDetail(params);
        })
        .then(() => {
          this.cancel();
          this.msgSuccess(`编辑商品详情成功~`);
        });
    },
    /** 修改按钮操作 */
    handleUpdate(goodsId) {
      getGoods(goodsId).then((response) => {
        this.changeGroup(response.data.groupId?.split(","));
        this.form = {
          ...response.data,
          detailsDescr: response.data.detailsDescr ? response.data.detailsDescr.split(',') : [],
          groupId: response.data.groupId?.split(","),
          price: Math.floor(response.data.price) / 100,
        };
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const params = {
            ...this.form,
            groupId: this.form.groupId.toString(),
            price: new Decimal(this.form.price).mul(100).toNumber(),
            salesStatus: this.form.isShelves == 1 ? 1 : 2,
            detailsDescr: this.form.detailsDescr ? this.form.detailsDescr.toString() : null
          };
          this.$confirm(
            `是否确认${this.form.goodsId ? "修改" : "新增"}商品信息?`,
            "警告",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              return this.form.goodsId ? updateGoods(params) : addGoods(params);
            })
            .then((res) => {
              this.msgSuccess(`${this.form.goodsId ? "修改" : "新增"}成功`);
              if (!this.form.goodsId) {
                this.handleUpdate(res.data)
                this.activeName = 'details'
                this.back = false
              } else {
                this.cancel();
              }
              this.reset();
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
.hint-text {
  color: #b1b1b1;
}
</style>
