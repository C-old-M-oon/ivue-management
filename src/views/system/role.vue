<template>
  <div class="role">
    <Row type="flex" justify="end">
      <Button type="success" icon="plus" @click='addShow'>新增角色</Button>
    </Row>

    <br>

    <Table border :columns="columns" :data="data" :loading="dataLoading"></Table>

    <Modal v-model="modalEdit" width="500">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>{{msgTitle}}</span>
      </p>
      <div style="text-align:center">
        <Input v-model="editInfo.name">
          <span slot="prepend">角色名:</span>
        </Input>
        <Tree :data="treeData" :render="renderContent" show-checkbox multiple :load-data="loadData" ref="tree"></Tree ref="tree">
      </div>
      <div slot="footer">
        <Button :type="editType" size="large" long :loading="modal_loading" @click="edit">{{msgEdit}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import util from '@/libs/util';
  import {ERR_OK} from '@/config/config'
  import {editMixin} from '@/base/mixin'
  export default {
    mixins: [editMixin],
    data () {
      return {
        dataLoading: false,
        columns: [
          {
            title: 'id',
            key: 'id'
          },
          {
            title: '角色名',
            key: 'name'
          },
          {
            title: '操作',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  icon: 'edit'
                },
                on: {
                  click: () => {
                    this.editInfo.id = params.row.id
                    this.editInfo.name = params.row.name
                    this.modalEdit = true
                    this.if_add = false
                    this.getTrees(params.row.id)
                  }
                }
              }, '编辑')
            }
          }
        ],
        data: [],
        editInfo: {
          id: '',
          name: '',
          menuIds: []
        },
        treeData: [
          {
            title: '主菜单',
            loading: false,
            // expand: false,
            render: (h, { root, node, data }) => {
              return h('Row', {
                style: {
                  display: 'inline-block',
                  width: '100%'
                }
              }, [
                  h('Col',{
                    props: {
                      span: '4'
                    }
                  }, [h('span', this.newTree.name)])
              ]);
            },
            children: []
          }
        ],
        buttonProps: {
          type: 'ghost',
          size: 'small',
        },
        trees: [],
        newTree: {}
      }
    },
    methods: {
      getTrees (id) {
        this.treeData = []
        // this.trees = []
        // this.newTree = {}
        // this.treeData.children = []
        var _that = this
        util.ajax.get(util.baseUrl + '/system/role/menu/list', {
          params: {
            roleId: id
          }
        })
        .then(function(res){
          if(res.data.status == ERR_OK) {
            _that.trees = res.data.data
            _that.initTrees()
            _that.treeData = [
              {
                title: '主菜单',
                loading: false,
                render: (h, { root, node, data }) => {
                  return h('Row', {
                    style: {
                      display: 'inline-block',
                      width: '100%'
                    }
                  }, [
                      h('Col',{
                        props: {
                          span: '4'
                        }
                      }, [h('span', _that.newTree.name)])
                  ]);
                },
                children: []
              }
            ]
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      initTrees () {
        var _index = this.trees.findIndex(item => {
          return item.parentId === -1
        })
        this.newTree = Object.assign({}, this.trees[_index], {
          children: [],
          expand: true
        })
        this.appendTree(this.newTree)
        // this.data.expand = true
      },
      appendTree(obj) {
        this.trees.map(item => {
          if(item.parentId === obj.id) {
            item = Object.assign({}, item, {
              children: [],
              expand: true,
              checked: item.flage == 1 ? true : false
            })
            obj.children.push(item)
            this.appendTree(item)
          }
        })
      },
      renderContent (h, { root, node, data }) {
        return h('Row', {
          style: {
            display: 'inline-block',
            width: '100%'
          }
        }, [
          h('Col', {
            props: {
              span: '4'
            }
          }, [h('span', data.name)])
        ]);
      },
      // 异步加载子菜单数据
      loadData(item, callback) {
        callback(this.newTree.children)
      },
      getDatas () {
        var _that = this
        this.dataLoading = true
        util.ajax.get(util.baseUrl + '/system/role/list')
        .then(function(res){
          _that.dataLoading = false
          if(res.data.status == ERR_OK) {
            _that.data = res.data.data
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      addShow() {
        this.modalEdit = true
        this.if_add = true
        this.editInfo = {
          name: '',
          menuIds: []
        }
        this.getTrees(0)
      },
      edit () {
        var _that = this
        this.editInfo.menuIds = []
        var _trees = this.$refs.tree.getCheckedNodes()
        _trees.forEach(item => {
          this.editInfo.menuIds.push(item.id)
        })
        var _url = this.if_add ? '/system/role/add' : '/system/role/edit'
        // console.log(this.editInfo)
        this.modal_loading = true
        let jsonData = new URLSearchParams();
        jsonData.append('id', this.editInfo.id || '');
        jsonData.append('name', this.editInfo.name);
        jsonData.append('menuIds', this.editInfo.menuIds);
        util.ajax.post(util.baseUrl + _url, jsonData)
        .then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.$Message.success('操作成功!')
            _that.modalEdit = false
            _that.getDatas()
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      }
    },
    mounted() {
      this.getDatas()
    }
  }
</script>

<style lang="less">
  .ivu-tree-children{
    .ivu-row{
      vertical-align: middle;
    }
  }
</style>