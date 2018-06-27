<template>
  <div class="main">
    <Row>
      <i-col span="3">
        <i-input icon="ios-telephone-outline" placeholder="号码" style="width: 90%"></i-input>
      </i-col>
      <i-col span="3">
        <i-select style="width: 90%" placeholder="状态">
          <i-option value="0">成功</i-option>
          <i-option value="1">失败</i-option>
        </i-select>
      </i-col>
      <i-col span="3">
        <i-select style="width: 90%" placeholder="赠送名称">
          <i-option value="0">赠送1</i-option>
          <i-option value="1">赠送2</i-option>
        </i-select>
      </i-col>
      <i-col span="3">
        <i-input icon="ios-person-outline" placeholder="录入人" style="width: 90%"></i-input>
      </i-col>
      <i-col span="5">
        <date-picker :value="initTime" type="datetimerange" placement="bottom-end" placeholder="起止时间" style="width: 90%" @on-change="changeTime"></date-picker>
      </i-col>
      <i-col span="7">
        <i-button type="primary" icon="ios-upload-outline">导入</i-button>
        <i-button type="success" icon="ios-download-outline">导出</i-button>
        <i-button type="error" icon="ios-search">查找</i-button>
        <i-button type="error" icon="ios-trash-outline">删除</i-button>
      </i-col>
    </Row>
    <br>

    <i-table :columns="columns" :data="datas" @on-expand='expand'></i-table>
    <br>

  </div>
</template>

<script>
  export default {
    data () {
      return {
        userName: '',
        initTime: [`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} 00:00:00`, `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()} 23:59:59`],
        filter: {},
        detailColumns: [
          {
            title: '订单号',
            key: 'orderNumber'
          },
          {
            title: '兑换码',
            key: 'chargeCode'
          },
          {
            title: '短信内容',
            key: 'message'
          },
          {
            title: '兑换状态',
            key: 'chargeStatus'
          },
          {
            title: '兑换时间',
            key: 'chargeTime'
          },
          {
            title: '生效时间',
            key: 'effectiveTime'
          }
        ],
        detailData: [
          {
            orderNumber: '12121212',
            chargeCode: 'XJDIEKQ12434',
            message: '给你送了100MB',
            chargeStatus: 1,
            chargeTime: '2018-4-10',
            effectiveTime: '2018-4-10'
          }
        ],
        columns: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h('div', {
                slot: 'content',
                on: {
                  click: () => {
                    console.log(params.row.batchNumber)
                  }
                }
              }, [
                h('i-table', {
                  props: {
                    columns: this.detailColumns,
                    data: this.detailData
                  }
                })
              ])
            }
          },
          {
            title: '批次号',
            key: 'batchNumber'
          },
          {
            title: '电话号码',
            key: 'phoneNumber'
          },
          {
            title: '赠送名称',
            key: 'sendName'
          },
          {
            title: '赠送数量',
            key: 'sendNumber'
          },
          {
            title: '状态',
            key: 'status'
          },
          {
            title: '录入人',
            key: 'enterPeople'
          },
          {
            title: '录入时间',
            key: 'enterTime'
          },
          {
            title: '操作',
            key: 'action',
            width: 150,
            render: (h, params) => {
              return h('div', [
                h(params.row.status == -1 ? 'Tooltip' : '', {
                  props: {
                    content: '生效'
                  }
                } , [
                  h('Button', {
                    props: {
                      type: 'success',
                      size: 'small',
                      icon: 'checkmark'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        console.log('生效了')
                      }
                    }
                  }, '')
                ]),

                h(params.row.status == -1 ? 'Tooltip' : '', {
                  props: {
                    content: '修改'
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small',
                      icon: 'edit'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        console.log('修改了')
                      }
                    }
                  }, ''),
                ]),
                
                h(params.row.status == -1 ? 'Tooltip' : '', {
                  props: {
                    content: '删除'
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small',
                      icon: 'close-round'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        console.log('删除了')
                      }
                    }
                  }, '')
                ])
                
              ])
            }
          }
        ],
        datas: [
          {
            batchNumber: '332013',
            phoneNumber: '13438380098',
            sendName: '名称1',
            sendNumber: 3,
            status: -1,
            enterPeople: 'lee',
            enterTime: '1991-05-14'
          }
        ]
      };
    },
    methods: {
      // 展开
      expand (row, status) {
        if(status) {
          // console.log(row.batchNumber)
        }
      },
      changeTime(time) {
        if(time.length) {
          this.filter.startTime = time[0]
          this.filter.endTime = time[1]
        }else {
          this.filter.startTime = ''
          this.filter.endTime = ''
        }
      },
      init () {
        // this.userName = Cookies.get('user');
      },
      handleClickUserDropdown (name) {
        this.$router.push({
            name: 'login'
        });
      }
    },
    mounted: function() {
      
    }
  }
</script>

<style type="text/css">
  
</style>