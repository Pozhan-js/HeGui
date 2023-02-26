import { encrypt } from '@/utils/jsencrypt';
import { Message, MessageBox } from 'element-ui';

export const remit = ({ onSuccess, onInputComplete, message }) => {
  return MessageBox.prompt(message, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[.\s\S]{0,20}$/,
    inputErrorMessage: "请输入打款备注, 最多20个字符",
    inputPlaceholder: "请输入打款备注",
    inputType: 'textarea',
    type: "warning",
  })
    .then(({ value: reason }) => {
      return MessageBox.prompt('验证账号密码', {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[.\s\S]+$/,
        inputErrorMessage: "请验证登录账号密码",
        inputPlaceholder: "请验证登录账号密码",
        inputType: 'password',
        type: "warning",
      }).then(({value}) => {
        return onInputComplete({
          password: encrypt(value),
          reason
        })
      })
        .then(() => {
          Message({
            message: '打款成功~',
            type: "success"
          })
        })
        .finally(() => {
          onSuccess();
        });
    })
}

export const audit = ({message, onInputComplete, onSuccess}) => {
  return MessageBox.prompt(message, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[.\s\S]{0,20}$/,
    inputErrorMessage: "请输入审核备注, 最多20个字符",
    inputPlaceholder: "请输入审核备注",
    inputType: 'textarea',
    type: "warning",
  })
    .then(({ value }) => {
      return onInputComplete({
        reason: value,
      });
    })
    .then(() => {
      Message({
        message: '审核成功~',
        type: "success"
      })
    }).finally(() => {
      onSuccess();
    });
}
