import Vue from 'vue'
import ExportModal from '@/components/FunctionDialog/ExportModal.vue'


export function showExportModal(options) {

  return new Promise((resolve, reject) => {
    const Export = Vue.extend(ExportModal)
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
    const instance = new Export({
      propsData: { options }
    })
    instance.$mount(wrapper)

    instance.$once('complete', resolve)
    instance.$once('cancel', reject)
    instance.$once('closed', () => {
      instance.$destroy()
      document.body.removeChild(instance.$el)
    })
  })

}
