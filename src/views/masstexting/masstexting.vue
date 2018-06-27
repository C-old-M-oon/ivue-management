<template>
  <div class="massstexting">
    <Tabs v-model="panelName" @on-click="changePanel">
      <Select style="width:150px;" placeholder="选择省份" v-model="filter.proCode" slot="extra">
        <Option v-for="item in provinceList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <TabPane label="群发数据列表" name="name1">
        <Row>
          <Select style="width:200px" placeholder="活动列表" v-model="filter.activity" :clearable='true'>
            <Option v-for="item in activityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Button type="primary" icon="search" @click="search(1)">查询</Button>
        </Row>
        <br>
        <Table :columns="dataColumns" :data="dataList" :loading="dataLoading"></Table>
      </TabPane>
      <TabPane label="待群发任务列表" name="name2">
        <Row>
          <Select style="width:200px" placeholder="活动列表" v-model="filter.activity">
            <Option v-for="item in activityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Select style="width:200px" placeholder="城市列表" v-model="filter.city">
            <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <Button type="primary" icon="search" @click="search(1)">查询</Button>
        </Row>
        <br>
        <Table :columns="taskColumns" :data="taskList" :loading="dataLoading"></Table>
      </TabPane>
      <TabPane label="群发日志列表" name="name3" style="min-height: 300px">
        <Row>
          <DatePicker type="daterange" placement="bottom-end" placeholder="起止时间" style="width: 200px" @on-change='dateChange' :clearable="true"></DatePicker>
          <Select style="width:200px" placeholder="活动列表" v-model="filter.activity">
            <Option v-for="item in activityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          </Select>
          <Button type="primary" icon="search" @click="search(1)">查询</Button>
        </Row>
        <br>
        <Table :columns="logColumns" :data="logList" :loading="dataLoading"></Table>
      </TabPane>
      <TabPane label="群发配置列表" name="name4">
        <Table :columns="configColumns" :data="configList" :loading="dataLoading"></Table>
      </TabPane>
    </Tabs>
    <br>
    <Page :total="TotalRecords" :current="filter.pageNo" @on-change='changePage' :page-size="filter.pageSize" show-elevator show-sizer placement="top" :page-size-opts="pageConfig" @on-page-size-change="changePageSize"></Page>

    <!-- 重置 -->
    <Modal v-model="modalReset" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>重置活动</span>
        </p>
        <div style="text-align:center">
            <p>此操作会重置活动数据</p>
            <p>确定重置么？</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" long :loading="modal_loading" @click="reset">重置</Button>
        </div>
    </Modal>
    <!-- 添加 -->
    <Modal v-model="modalAdd" width="500">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>添加群发任务</span>
        </p>
        <div>
          <Row style="margin-bottom: 10px">
            <Col span="11">
              <Input v-model="addInfo.activity" placeholder="活动名称" disabled></Input>
            </Col>
            <Col span="11" push="2">
              <Input v-model="addInfo.proCode" placeholder="省份编码" disabled></Input>
            </Col>
          </Row>
          <Row style="margin-bottom: 10px">
            <Col span="11">
              <Select placeholder="地州" v-model="addInfo.city">
                <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
              <!-- <Input v-model="addInfo.city" placeholder="地州"></Input> -->
            </Col>
            <Col span="11" push="2">
              <Input v-model="addInfo.startTime" placeholder="开始时间"></Input>
            </Col>
          </Row>
          <Row style="margin-bottom: 10px">
            <Col span="11">
              <Input v-model="addInfo.sentCount" placeholder="单次发送量"></Input>
            </Col>
            <Col span="11" push="2">
              <Input v-model="addInfo.sentNum" placeholder="循环次数"></Input>
            </Col>
          </Row>
        </div>
        <div slot="footer">
            <Button type="success" size="large" long :loading="modal_loading" @click="add">添加</Button>
        </div>
    </Modal>
    <!-- 取消任务 -->
    <Modal v-model="modalCancel" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>取消任务</span>
        </p>
        <div style="text-align:center">
            <p>此操作会取消该任务</p>
            <p>确定取消么？</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" long :loading="modal_loading" @click="cancel">取消</Button>
        </div>
    </Modal>
    <!-- 编辑 -->
    <Modal v-model="modalEdit" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>编辑活动</span>
      </p>
      <div>
        <Input type="textarea" v-model="editInfo.content" placeholder="活动内容" style="margin-bottom: 10px" :autosize="true"></Input>
        <Select v-model="editInfo.status">
          <Option :value="1" :key="1">打开</Option>
          <Option :value="0" :key="0">关闭</Option>
        </Select>
      </div>
      <div slot="footer">
          <Button type="success" size="large" long :loading="modal_loading" @click="edit">修改</Button>
      </div>
  </Modal>
  </div>
</template>

<script>
  import util from '@/libs/util';
  import {ERR_OK,pageSize} from '@/config/config'

  export default {
    computed: {
      url() {
        if(this.panelName === 'name1') {
          return '/mass/data/select'
        } else if(this.panelName === 'name2') {
          return '/mass/task/select'
        } else if(this.panelName === 'name3') {
          return '/mass/log/select'
        } else {
          return '/mass/config/select'
        }
      }
    },
    data() {
      return {
        panelName: 'name1',
        currentName: 'name1',
        dataLoading: false,
        modalReset: false,
        modalAdd: false,
        modalCancel: false,
        modalEdit: false,
        modal_loading: false,
        activityList: [],
        cityList: [],
        provinceList: [],
        TotalRecords: 0,
        pageConfig: [8, 10, 15, 20, 100],
        filter: {
          pageNo: 1,
          pageSize: pageSize,
          activity: '',
          city: '',
          startDate: '',
          endDate: ''
        },
        dataColumns: [
          {
            title: '活动名',
            key: 'activity'
          },{
            title: '地州',
            key: 'city'
          },{
            title: '目标用户数',
            key: 'total'
          },{
            title: '已群发',
            key: 'used'
          },{
            title: '更新时间',
            key: 'updateTime'
          },{
            title: '重置状态',
            key: 'status',
            render: (h, params) => {
              var _status = params.row.status === 0 ? '待处理' : params.row.status === 1 ? '已处理' : '处理中'
              return h('Button', {
                props: {
                  type:  params.row.status === 0 ? 'primary' : params.row.status === 1 ? 'success' : 'warning'
                }
              }, _status)
            }
          },{
            title: '重置时间',
            key: 'resetTime'
          },{
            title: '排序',
            key: 'sort'
          },{
            title: '操作',
            width: 150,
            render: (h, params) => {
              return h('ButtonGroup',[
                h('Button', {
                  props: {
                    type: 'primary',
                    icon: 'refresh',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.modalReset = true
                      this.resetId = params.row.id
                    }
                  }
                }, '重置'),
                h('Button', {
                  props: {
                    type: 'success',
                    icon: 'plus',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.addInfo = {}
                      this.modalAdd = true
                      this.addInfo.tableId = params.row.id
                      this.addInfo.proCode = params.row.proCode
                      this.addInfo.activity = params.row.activity
                      this.addInfo.city = params.row.city
                    }
                  }
                }, '新增')
              ])
            }
          },
        ],
        dataList: [],
        resetId: '',
        addInfo: {},
        taskColumns: [
          {
            title: '活动名',
            key: 'activity'
          },{
            title: '地州',
            key: 'city'
          },{
            title: '开始时间',
            key: 'startTime'
          },{
            title: '间隔天数',
            key: 'days'
          },{
            title: '单次发送量',
            key: 'sentCount'
          },{
            title: '循环次数',
            key: 'sentNum'
          },{
            title: '任务状态',
            key: 'status'
          },{
            title: '操作',
            key: '',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'error',
                  icon: 'close'
                },
                on: {
                  click: () => {
                    this.modalCancel = true
                    this.cancelId = params.row.id
                  }
                }
              }, '取消任务')
            }
          }
        ],
        taskList: [],
        cancelId: '',
        logColumns: [
          {
            title: '执行时间',
            key: 'createTime'
          },{
            title: '活动名称',
            key: 'activity'
          },{
            title: '地州',
            key: 'city'
          },{
            title: '开始时间',
            key: 'startTime'
          },{
            title: '计划发送量',
            key: 'planSentCount'
          },{
            title: '实际发送量',
            key: 'lastSentCount'
          }
        ],
        logList: [],
        configColumns: [
          {
            title: '活动表',
            key: 'tableId'
          },{
            title: '活动名称',
            key: 'activity'
          },{
            title: '活动状态',
            key: 'status',
            render: (h, params) => {
              return h('div',[
                h('span', {
                  style: {
                    color: params.row.status === 1 ? '#4caf50' : 'red'
                  }
                }, params.row.status === 1 ? '打开' : '关闭')
              ])
            }
          },{
            title: '顺序',
            key: 'sort'
          },
          {
            title: '操作',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'edit'
                },
                on: {
                  click: () => {
                    this.modalEdit = true
                    this.editInfo = Object.assign(params.row)
                  }
                }
              }, '修改')
            }
          }
        ],
        configList: [],
        editInfo: {}
      }
    },
    methods: {
      // 面板切换
      changePanel(name) {
        if(name === this.currentName) {
          return
        }
        this.panelName = name
        this.currentName = name
        this.filter = Object.assign(this.filter, {
          activity: '',
          city: '',
          startDate: '',
          endDate: ''
        })
        if(name === 'name4') {
          this.search(1)
        }
      },
      // 获取基本列表
      getActivityList() {
        var _that = this
        util.ajax.get(util.baseUrl + '/mass/data/getActList').then(function(res){
          if(res.data.status == ERR_OK) {
            var _arr = []
            res.data.data.map(item => {
              _arr.push({
                label: item,
                value: item
              })
            })
            _that.activityList = _arr
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      getCityList() {
        var _that = this
        util.ajax.get(util.baseUrl + '/mass/data/getCitys').then(function(res){
          if(res.data.status == ERR_OK) {
            var _arr = []
            res.data.data.map(item => {
              _arr.push({
                label: item,
                value: item
              })
            })
            _that.cityList = _arr
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      getProvinceList() {
        var _that = this
        util.ajax.get(util.baseUrl + '/mass/config/getProList').then(function(res){
          if(res.data.status == ERR_OK) {
            var _arr = []
            res.data.data.map(item => {
              _arr.push({
                label: item,
                value: item
              })
            })
            _that.provinceList = _arr
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 时间变换
      dateChange(date) {
        if(date) {
          this.filter.startTime = date[0]
          this.filter.endTime = date[1]
        }else {
          this.filter.startTime = ''
          this.filter.endTime = ''
        }
      },
      // 获取信息列表
      search(no) {
        var _that = this
        this.dataLoading = true
        util.ajax.get(util.baseUrl + this.url, {
          params: _that.filter
        }).then(function(res){
          _that.dataLoading = false
          if(res.data.status == ERR_OK) {
            let list = res.data.data.list
            _that.TotalRecords = res.data.data.total
            if(_that.panelName === 'name1') {
              _that.dataList = list
            } else if(_that.panelName === 'name2') {
              _that.taskList = list
            } else if(_that.panelName === 'name3') {
              _that.logList = list
            } else {
              _that.configList = list
            }
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 换页
      changePage(page) {
        this.filter.pageNo = page
        this.search(page)
      },
      changePageSize(size) {
        this.filter.pageSize = size
        this.search(this.filter.pageNo)
      },
      // 重置
      reset() {
        var _that = this
        if(!this.resetId) {
          return
        }
        _that.modal_loading = true
        util.ajax.get(util.baseUrl + '/mass/data/resetStatus', {
          params: {id: _that.resetId}
        }).then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.modalReset = false
            _that.$Message.success('操作成功！')
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 添加
      add() {
        var _that = this
        _that.modal_loading = true
        util.ajax.get(util.baseUrl + '/mass/task/addTask', {
          params: _that.addInfo
        }).then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.modalAdd = false
            _that.$Message.success('操作成功！')
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 取消
      cancel() {
        var _that = this
        if(!this.cancelId) {
          return
        }
        _that.modal_loading = true
        util.ajax.get(util.baseUrl + '/mass/task/cancelTask', {
          params: {id: _that.cancelId}
        }).then(function(res){
          _that.modal_loading = false
          if(res.data.status == ERR_OK) {
            _that.modalCancel = false
            _that.$Message.success('操作成功！')
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 修改
      edit() {
        var _that = this
        _that.modal_loading = true
        util.ajax.get(util.baseUrl + '/mass/config/edit', {
          params: _that.editInfo
        }).then(function(res){
          if(res.data.status == ERR_OK) {
            _that.modal_loading = false
            _that.modalEdit = false
            _that.$Message.success('操作成功！')
            _that.search(_that.filter.pageNo)
          }else {
            _that.$Message.error(res.data.msg)
          }
        })
        .catch(function(err){
          console.log(err)
        });
      },
      // 状态切换
      changeStatus() {
        
      }
    },
    mounted() {
      this.getActivityList()
      this.getCityList()
      this.getProvinceList()
    }
  }
</script>

<style lang="less" scoped>

</style>