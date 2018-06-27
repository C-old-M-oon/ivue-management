<template>
  <div class="platform">
    <Row>
      <Col span="3">
        <Input v-model="filter.tenant" icon="person" placeholder="租户" style="width: 100%"></Input>
      </Col>
      <Col span="3">
        <Input v-model="filter.type" icon="ios-copy" placeholder="类型" style="width: 100%"></Input>
      </Col>
      <Col span="4">
        <Input v-model="filter.includeProductNo" icon="code" placeholder="产品编码,多个以逗号隔开" style="width: 100%"></Input>
      </Col>
      <Col span="3">
        <Input v-model="filter.keyWord" icon="key" placeholder="关键字" style="width: 100%"></Input>
      </Col>
      <Col span="3">
        <Input v-model="filter.strategy" icon="ios-gear" placeholder="策略" style="width: 100%"></Input>
      </Col>
      <Col span="2">
        <Select v-model="filter.accurate" style="width:100%" placeholder='查询方式'>
          <Option value="1">模糊查询</Option>
          <Option value="0">精准查询</Option>
        </Select>
      </Col>
      <Col span="2">
        <Select v-model="filter.status" style="width:100%" placeholder='查询状态'>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
      </Col>
      <Col span="4">
        <Button type="primary" icon="ios-search" @click='getData(1)' style='padding: 5px;'>查找</Button>
        <Button type="success" icon="plus" @click='showEdit' style='padding: 5px;'>新增</Button>
        <Button type="info" icon="android-download" @click='exportOut' style='padding: 5px;'>导出</Button>
      </Col>
    </Row>
    <br>

    <Table border :loading="loading" :columns="columns" :data="dataResource" width='100%'></Table>
    <br>

    <Modal v-model="modalDetail" width="80%" :styles="{top: '50px'}">
      <p slot="header" style="color:#2d8cf0;text-align:center">
        <Icon type="eye"></Icon>
        <span v-text='detailName'></span>
      </p>
      <div style="text-align:center">
        <Table border :loading="detailLoading" :columns="detailColumns" :data="detailData" width='100%' height="400"></Table>
      </div>
      <div slot="footer">
      </div>
    </Modal>

    <Modal v-model="modalEdit" width="50%" :styles="{top: '50px'}">
      <p slot="header" style="color:#2d8cf0;text-align:center">
        <Icon type="eye"></Icon>
        <span v-show="if_add">新增策略分配</span>
        <span v-show="!if_add">更新策略分配</span>
      </p>
      <div style="text-align:center">
        <Input v-model="editInfo.tenant" icon="person" placeholder="租户" style="width: 40%;margin-bottom:10px;"></Input>
        <Input v-model="editInfo.type" icon="social-buffer" placeholder="分类" style="width: 40%;margin-bottom:10px;"></Input>
        <Input v-model="editInfo.category" icon="social-buffer" placeholder="类型" style="width: 40%;margin-bottom:10px;"></Input>
        <Input v-model="editInfo.keyword" icon="key" placeholder="关键字" style="width: 40%;margin-bottom:10px;"></Input>
        <Input v-model="editInfo.strategy" icon="social-buffer" placeholder="策略" style="width: 40%;margin-bottom:10px;"></Input>
        <Input v-model="editInfo.sort" :number='true' icon="social-buffer" placeholder="排序" style="width: 40%;margin-bottom:10px;"></Input>
        <Select v-model="editInfo.status" style="width:40%;margin-bottom: 10px;" placeholder='运行状态'>
          <Option value="1">启用</Option>
          <Option value="0">停用</Option>
        </Select>
        <DatePicker v-model="editInfo.updateTime" type="datetime" placeholder="创建时间" style="width: 40%;margin-bottom:10px;vertical-align: bottom;" @on-change='changeTime' :editable='false'></DatePicker>
        <Col span="24" style='text-align: left;'>
          <p>包含的产品 <Button type="primary" size="small" @click="getProducts('include')">刷新</Button></p>
          <CheckboxGroup v-model="includeProductNos">
            <Col span='8' v-for='item in IncludeProductNos' :key='item.productNo'>
              <Checkbox :label="item.productNo" :indeterminate='false'>
                <span>{{item.productName}}</span>
              </Checkbox>
            </Col>
          </CheckboxGroup>
        </Col>

        <Col span="24" style='text-align: left;'>
          <p>排除的产品 <Button type="error" size="small" @click="getProducts('exclude')">刷新</Button></p>
          <CheckboxGroup v-model="excludeProductNos">
            <Col span='8' v-for='item in ExcludeProductNos' :key='item.productNo'>
              <Checkbox :label="item.productNo" :indeterminate='false'>
                <span>{{item.productName}}</span>
              </Checkbox>
            </Col>
          </CheckboxGroup>
        </Col>
        
        <Input type='textarea' v-model="editInfo.inclueDnseg" icon="social-buffer" placeholder="包含的号段,多个以逗号分隔" style="width: 100%;margin-bottom:10px;"></Input>
        <Input type='textarea' v-model="editInfo.excludeDnseg" icon="social-buffer" placeholder="排除的号段,多个以逗号分隔" style="width: 100%;margin-bottom:10px;"></Input>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="confirmEdit(0)" v-show='if_add'>确认添加</Button>
        <Button type="primary" size="large" long :loading="modal_loading" @click="confirmEdit(1)" v-show='!if_add'>确认修改</Button>
      </div>
    </Modal>

    <Page :total="totalRecord" :page-size='filter.pageSize' :current='filter.pageNo' size="small" show-elevator @on-change='changeNum'></Page>


  </div>
</template>

<script>
  import util from '@/libs/util';
  import {ERR_OK,pageSize} from '@/config/config'

  export default{
    data() {
      return {
        // 策略信息
        loading:false,
        columns:[
          {
            title: '编辑',
            key: 'action',
            width: 80,
            align: 'center',
            fixed: 'left',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'edit'
                  },
                  on: {
                    click: () => {
                        this.showEdit(params.row)
                    }
                  }
                })
              ]);
            }
          },{
            title:'租户',
            align: 'center',
            key: 'tenant',
            width: 120
          },{
            title:'分类',
            align: 'center',
            key: 'type',
            width: 80
          },{
            title:'策略',
            align: 'center',
            key: 'strategy',
            width: 120
          },{
            title:'类型',
            align: 'center',
            key: 'category',
            width: 80
          },{
            title:'状态',
            align: 'center',
            key: 'status',
            width: 80,
            render: (h, params) => {
              return h('span',{
                style: {
                  color: params.row.status === 1 ? '#19be6b' : '#fa0000'
                }
              }, params.row.status === 1 ? "启用" : "停用")
            }
          },
          {
            title:'查询方式',
            align: 'center',
            key: 'accurate',
            width: 150,
            render: (h, params) => {
              return h('span', params.row.accurate === 1 ? "模糊查询" : "精准查询")
            }
          },{
            title: '包含产品编码',
            align: 'center',
            key: 'includeProductNo',
            width: 150,
            render: (h, params) => {
              return h('div',[
                h('Button',{
                  props: {
                    type: 'info',
                    icon: 'eye',
                    size: 'small',
                    disabled: params.row.includeProductNo.length < 1
                  },
                  on: {
                    click: () =>{
                      this.getProductInfo(params.row.includeProductNo, 1);
                    }
                  }
                },params.row.includeProductNo.length > 0 ? '查看' : '暂无数据')
              ])
            }
          },{
            title:'包含号段',
            align: 'center',
            key: 'inclueDnseg',
            width: 150
          },{
            title: '排除产品编码',
            align: 'center',
            key: 'excludeProductNo',
            width: 150,
            render: (h, params) => {
              return h('div',[
                h('Button',{
                  props: {
                    type: 'primary',
                    icon: 'eye',
                    size: 'small',
                    disabled: params.row.excludeProductNo.length < 1
                  },
                  on: {
                    click: () =>{
                      this.getProductInfo(params.row.excludeProductNo, 0);
                    }
                  }
                },params.row.excludeProductNo.length > 0 ? '查看' : '暂无数据')
              ])
            }
          },{
            title:'排除号段',
            align: 'center',
            key: 'excludeDnseg',
            width: 150
          },{
            title:'关键字',
            align: 'center',
            key: 'keyword',
            width: 120
          },{
            title:'更新时间',
            align: 'center',
            key: 'updateTime',
            width: 150
          },{
            title:'更新日志',
            align: 'center',
            key: 'update_log',
            width: 150
          }
        ],
        totalRecord:0,
        dataResource:[],
        filter:{
          pageNo:1,
          pageSize: pageSize,
          tenant: '',
          type: '',
          includeProductNo:'',
          keyWord: '',
          strategy: '',
          accurate: '1',
          status: '1'
        },
        // 查看详情
        detailName: '',
        modalDetail: false,
        detailLoading: false,
        detailColumns:[
          {
            title: '租户',
            key: 'tenant',
            align: 'center'
          },
          {
            title: '产品名称',
            key: 'productName',
            align: 'center'
          },{
            title: '产品编码',
            key: 'productNo',
            align: 'center'
          },{
            title: '规格',
            key: 'flowSize',
            align: 'center'
          },{
            title: '价格',
            key: 'price',
            align: 'center'
          },{
            title: '渠道产品编码',
            key: 'channelProductNo',
            align: 'center'
          },
          {
            title: '类型',
            key: 'category',
            align: 'center'
          },
          {
            title: '分类',
            key: 'type',
            align: 'center'
          },{
            title: '渠道来源类型',
            key: 'channelSourceType',
            align: 'center'
          },{
            title: '创建时间',
            key: 'createTime',
            align: 'center'
          },{
            title: '是否舍弃',
            key: 'isDiscarded',
            align: 'center',
            render: (h, params) => {
              return h('span', {
                style: {
                  color: params.row.isDiscarded === 0 ? '' : '#fa0000'
                }
              },params.row.isDiscarded === 0 ? '没有' : '舍弃')
            }
          }
        ],
        detailData: [],
        // 编辑策略
        modal_loading: false,
        modalEdit:false,
        if_add: true,
        ExcludeProductNos: [],
        excludeProductNos: [],
        IncludeProductNos: [],
        includeProductNos: [],
        editInfo:{
          tenant:'',
          type: '',
          category: '',
          includeProductNo: '',
          excludeProductNo: '',
          inclueDnseg: '',
          excludeDnseg: '',
          keyword: '',
          sort: '',
          status: '1',
          updateTime: '',
          updateLog: ''
        },
        _createTime: '',
        switchStatus: true
      }
    },
    watch: {
      includeProductNos(newVal, oldVal) {
        if(newVal == oldVal) {
          return;
        }
        for(let i=0;i<this.includeProductNos.length;i++) {
          for(let j=0;j<this.excludeProductNos.length;j++) {
            if(this.includeProductNos[i] == this.excludeProductNos[j]) {
              this.excludeProductNos.splice(j,1)
            }
          }
        }
      },
      excludeProductNos(newVal, oldVal) {
        if(newVal == oldVal) {
          return;
        }
        for(let i=0;i<this.excludeProductNos.length;i++) {
          for(let j=0;j<this.includeProductNos.length;j++) {
            if(this.excludeProductNos[i] == this.includeProductNos[j]) {
              this.includeProductNos.splice(j,1)
            }
          }
        }
      }
    },
    methods: {
      getData(page) {
        if(page){
          this.filter.pageNo = 1;
        }
        this.loading = true;
        util.ajax.get('/im/alloctionconfig/getByPage.do',{
          params: this.filter
        }).then((response)=>{
          if(response.data.status == ERR_OK){
            this.loading = false;
            this.dataResource = response.data.data.data;
            this.totalRecord = response.data.data.totalRecord;
          }
        })
      },
      changeNum(newNum) {
        this.filter.pageNo = newNum;
        this.getData();
      },
      exportOut() {
        const strs = this._sarilizeUrl(this.filter)
        // console.log(strs);
        window.location.href = util.baseUrl + '/im/alloctionconfig/export.do?' + strs;
      },
      // 获取产品信息
      getProductInfo(products, status) {
        if(status === 0) {
          this.detailName = '排除的产品编码详情'
        }else{
          this.detailName = '包含的产品编码详情'
        }
        this.modalDetail = true;
        this.detailLoading = true;
        const jsonData = {
          products: products
        }
        util.ajax.get('/im/alloctionconfig/getProducts.do',{
          params: jsonData
        }).then((response)=>{
          if(response.data.status == ERR_OK){
            this.detailLoading = false;
            this.detailData = response.data.data;
          }
        })
      },
      showEdit(item) {
        // 添加操作
        if(!item.id && item.id != 0) {
          this.if_add = true;
          this.editInfo = {};
        }else {
          // 编辑操作
          this.if_add = false;
          this.editInfo = util.deepCopy(item);
          this._createTime = this.editInfo.updateTime
        }
        this.modalEdit = true;
        this.getProducts('include');
        this.getProducts('exclude');
      },
      changeTime(date) {
        this._createTime = date;
      },
      switchChange(status) {
        if(status) {
          this.editInfo.status = 1;
        }else {
          this.editInfo.status = 0;
        }
      },
      // 获取包含/排除的产品编码
      getProducts(type) {
        if(type == 'include') {
          this.IncludeProductNos = [];
          this.includeProductNos = [];
        }else {
          this.ExcludeProductNos = [];
          this.excludeProductNos = [];
        }
        this.$Loading.start();
        let _configNo = this.if_add ? '' : this.editInfo.id
        const jsonData = {
          configNo: _configNo,
          type: type
        }
        util.ajax.get('im/alloctionconfig/getAllocatinConfigProducts.do',{
          params: jsonData
        }).then((response)=>{
          this.$Loading.finish();
          var _that = this;
          if(response.data.status == ERR_OK){
            if(type == 'include'){
              this.IncludeProductNos = response.data.data;
              this.IncludeProductNos.forEach((item) => {
                if(item.flage) {
                  _that.includeProductNos.push(item.productNo)
                }
              })
            }else {
              this.ExcludeProductNos = response.data.data;
              this.ExcludeProductNos.forEach((item) => {
                if(item.flage) {
                  _that.excludeProductNos.push(item.productNo)
                }
              })
            }
          }
        }).catch((err) =>{
          this.$Message.error('获取出错')
          this.$Loading.error();
        })
      },
      confirmEdit(id) {
        this._arrToStr(this.includeProductNos, 0);
        this._arrToStr(this.excludeProductNos, 1);
        this.editInfo.updateTime = this._createTime
        if(!this.editInfo.tenant) {
          this.$Message.error('租户不能为空!');
          return;
        }
        if(!this.editInfo.type) {
          this.$Message.error('分类不能为空!');
          return;
        }
        if(!this.editInfo.category) {
          this.$Message.error('类型不能为空!');
          return;
        }
        if(!this.editInfo.strategy) {
          this.$Message.error('策略不能为空!');
          return;
        }
        if(!this.editInfo.sort) {
          this.$Message.error('排序不能为空!');
          return;
        }
        if(!this.editInfo.status) {
          this.$Message.error('状态不能为空!');
          return;
        }
        this.modal_loading = true;
        let _url = id === 1 ? '/im/alloctionconfig/update.do' : '/im/alloctionconfig/add.do';
        util.ajax.get(_url,{
          params: this.editInfo
        }).then((response)=>{
          var _that = this;
          if(response.data.status == ERR_OK){
            this.$Message.success({
              content: '操作成功!',
              onClose: function() {
                _that.modal_loading = false;
                _that.modalEdit = false;
                _that.getData();
              }
            });
          }else{
            this.$Message.error(response.data.desc);
            this.modal_loading = false;
          }
        }).catch((err) => {
          this.modal_loading = false;
        })
      },
      _sarilizeUrl(str) {
        const keys = Object.keys(str);
        const values = Object.values(str);
        let strs = ''
        for(let i=0;i<keys.length;i++){
          strs += keys[i] + '=' + values[i] + '&';
        }
        return strs.substring(0,strs.length-1)
      },
      _arrToStr(arr, status) {
        if(status == 0) {
          this.editInfo.includeProductNo = arr.join('@@')
        }else {
          this.editInfo.excludeProductNo = arr.join('@@')
        }
      }
    },
    mounted() {
      
    }
  }
</script>