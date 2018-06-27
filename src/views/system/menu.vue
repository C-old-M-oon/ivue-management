<template>
  <div class="menu">
    <Tree :data="data" :render="renderContent" show-checkbox multiple :load-data="loadData"></Tree ref="tree">

    <Modal v-model="modalAdd" width="500" height='400'>
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>添加菜单</span>
      </p>
      <div style="text-align:center">
        <Form :model="formItem" :label-width="80">
          <FormItem label="名称">
            <Input v-model="formItem.name" placeholder="名称"></Input>
          </FormItem>
          <FormItem label="排序">
            <InputNumber :max="10" :min="1" v-model="formItem.sort" style="width: 100%"></InputNumber>
          </FormItem>
          <FormItem label="链接">
            <Input v-model="formItem.href" placeholder="链接"></Input>
          </FormItem>
          <FormItem label="图标">
            <Input v-model="formItem.icon" placeholder="图标" style="width: 80%"></Input>
            <a href="http://ionicons.com/" title="" target="blank">图标库</a>
          </FormItem>
          <FormItem label="类型" placeholder="类型">
            <Select v-model="formItem.type">
              <Option value="menu">菜单</Option>
              <Option value="button">按钮</Option>
              <Option value="view">视图</Option>
            </Select>
          </FormItem>
          <FormItem label="权限">
            <Input v-model="formItem.permission" placeholder="权限"></Input>
          </FormItem>
          <FormItem label="备注">
            <Input v-model="formItem.remarks" placeholder="备注"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="append">确认添加</Button>
      </div>
    </Modal>
  </div>
  
</template>

<script>
  import util from '@/libs/util';
  import {ERR_OK} from '@/config/config'
  export default {
    data () {
      return {
        modalAdd: false,
        modal_loading: false,
        formItem: {
          parentId: '',
          name: '',
          permission: '',
          href: '',
          type: '',
          sort: 0,
          icon: '',
          remarks: ''
        },
        data: [
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
                  }, [h('span', this.newTree.name)]),
                  h('Col', {
                    props: {
                      span: '4'
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'information-circled'
                      },
                      style: {
                        marginRight: '10px'
                      }
                    }),
                    h("span", this.newTree.permission)
                  ]),
                  h('Col', {
                    props: {
                      span: '4'
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'ios-keypad'
                      },
                      style: {
                        marginRight: '10px',
                        marginLeft: '10px'
                      }
                    }),
                    h("span", this.newTree.type)
                  ]),
                  h('Button', {
                    props: Object.assign({}, this.buttonProps, {
                      icon: 'ios-plus-empty',
                      type: 'primary'
                    }),
                    style: {
                      width: '52px'
                    },
                    on: {
                      click: () => { this.append(this.newTree.id) }
                    }
                  })
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
      getTrees () {
        var _that = this
        this.$Spin.show();
        util.ajax.get(util.baseUrl + '/system/menu/list')
        .then(function(res){
          _that.$Spin.hide();
          if(res.data.status == ERR_OK) {
            _that.trees = res.data.data
            _that.initTrees()
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
          children: []
        })
        this.appendTree(this.newTree)
        // this.data.expand = true
      },
      appendTree(obj) {
        this.trees.map(item => {
          if(item.parentId === obj.id) {
            item = Object.assign({}, item, {
              children: []
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
          }, [h('span', data.name)]),
          h('Col', {
            props: {
              span: '4'
            }
          }, [
            h('Icon', {
              props: {
                type: 'information-circled'
              },
              style: {
                marginRight: '10px'
              }
            }),
            h("span", data.permission)
          ]),
          h('Col', {
            props: {
              span: '4'
            }
          }, [
            h('Icon', {
              props: {
                type: 'ios-keypad'
              },
              style: {
                marginRight: '10px',
                marginLeft: '10px'
              }
            }),
            h("span", data.type)
          ]),
          h('Button', {
            props: Object.assign({}, this.buttonProps, {
              icon: 'ios-plus-empty',
              type: 'success'
            }),
            style: {
              marginRight: '8px'
            },
            on: {
              click: () => { this.append(data.id) }
            }
          })
        ]);
      },
      // 异步加载子菜单数据
      loadData(item, callback) {
        callback(this.newTree.children)
      },
      append (id) {
        var _that = this
        if(!this.modalAdd) {
          this.modalAdd = true
          this.formItem.parentId = id
        } else {
          _that.modal_loading = true
          util.ajax.get(util.baseUrl + '/system/menu/add', {
            params: _that.formItem
          })
          .then(function(res){
            if(res.data.status == ERR_OK) {
              _that.$Message.success('添加成功！');
              _that.modal_loading = false
              _that.modalAdd = false
              window.location.reload()
              // _that.getTrees()
              // _that.loadData(_that.$refs['tree'], _that.newTree.children)
            }else {
              _that.$Message.error(res.data.msg);
              _that.modal_loading = false
            }
          })
          .catch(function(err){
            console.log(err);
          });
          // children.push(_item);
          // this.$set(this.addData, 'children', children);
          // this.modalAdd = false
        }
      }
    },
    mounted() {
      this.getTrees()
    }
  }
</script>

<style lang="less">
  
</style>