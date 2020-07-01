<template>
    <v-app id="app">
        <keep-alive>
            <component v-bind:is="current_page"></component>
        </keep-alive>
    </v-app>
</template>

<script>

    import ConnectView from "@/components/ConnectView";
    import MainView from "@/components/MainView";
    import { bus } from '@/main'

    export default {
        name: 'App',
        components: {
            ConnectView,
            MainView
        },
        data () {
            return {
                current_page: ConnectView,
                pages: [
                    {page: ConnectView, },
                    {page: MainView, }
                ]
            }
        },
        created () {
            bus.$on("navigation-event", (data)=>{
                console.log("received navigation event")
                console.log(data)
                this.current_page = this.pages[1].page
            })
        },
        methods: {

        }
    }
</script>

<style>

</style>
