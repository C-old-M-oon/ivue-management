<template>
  <div class="quickFilter">
    <ul class="listContent">
      <li v-for='(item, index) in taglist' class="listItem" key="index" @click='checkTag(index)' :class="{active : checkedIndex == index}">{{item}}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: {
      taglist: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        checkedIndex: 0
      }
    },
    methods: {
      checkTag(index) {
        if(this.checkedIndex == index){
          this.checkedIndex = 0
        }else {
          this.checkedIndex = index
        }
        this.$emit('gettagIndex', this.checkedIndex)
      }
    }
  }
</script>

<style lang="less">
  .quickFilter{
    width: 100%;
    box-sizing: border-box;
    .listContent{
      box-sizing: border-box;
      width: 100%;
      display: flex;
      .listItem{
        width: 10%;
        text-align: center;
        cursor: pointer;
        box-sizing: border-box;
      }
      .active{
        box-sizing: border-box;
        background: #2196f3;
        color: #fff;
        border-radius: 0 solid #2196f3
      }
    }
  }
</style>