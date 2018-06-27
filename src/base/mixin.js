/* 
* @Author: leeZ
* @Date:   2018-05-14 14:04:22
* @Last Modified by:   leeZ
* @Last Modified time: 2018-05-14 14:10:52
*/

export const editMixin = {
  computed: {
    msgTitle() {
      return this.if_add ? '新增' : '编辑'
    },
    msgEdit() {
      return this.if_add ? '确认添加' : '确认修改'
    },
    editType() {
      return this.if_add ? 'success' : 'primary'
    }
  },
  data() {
    return {
      if_add: true,
      modalEdit: false,
      modal_loading: false
    }
  }
}