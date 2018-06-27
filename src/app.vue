<template>
    <div id="main" class="app-main">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                theme: this.$store.state.app.themeColor
            };
        },
        mounted () {

        },
        beforeDestroy () {

        },
        methods: {

        }
    };
</script>

<style>
body{
    font-family: Microsoft YaHei,Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,\\5FAE\8F6F\96C5\9ED1,Arial,sans-serif;
}
.app-main{
    width: 100%;
    height: 100%;
}
</style>
