<template>
    <v-main>
        <v-container fluid>
            <v-row>
                <v-col cols="12">
                    <v-toolbar class="elevation-6">
                        <v-btn icon color="black" v-on:click="on_nav">
                            <v-icon>
                                {{nav_icon}}
                            </v-icon>
                        </v-btn>
                        <v-menu :absolute="true"
                                :top="true"
                                :offset-y="true"
                                v-model="menu">
                            <v-card>
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-avatar>
                                            <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John">
                                        </v-list-item-avatar>

                                        <v-list-item-content>
                                            <v-list-item-title>John Leider</v-list-item-title>
                                            <v-list-item-subtitle>Founder of Vuetify.js</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>

                                        </v-list-item-action>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-avatar>
                                            <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John">
                                        </v-list-item-avatar>

                                        <v-list-item-content>
                                            <v-list-item-title>John Leider</v-list-item-title>
                                            <v-list-item-subtitle>Founder of Vuetify.js</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>

                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-menu>
                        <v-toolbar-title>{{title}}</v-toolbar-title>

                        <v-spacer></v-spacer>
                        <v-btn icon color="dark" v-on:click="on_refresh">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
            <component v-bind:student="detail_item"
                       v-bind:is="current_tab"
                       v-on:detail="detail"
                       v-bind:refresh="need_refresh"
                       v-on:table="table"></component>
        </v-container>
    </v-main>
</template>

<script>

    import TableView from "@/components/TableView";
    import DetailView from "@/components/DetailView";
    export default {
        name: "MainPage",
        data() {
            return {
                menu: false,
                title: "Students",
                current_tab: TableView,
                detail_item: null,
                nav_icon: "mdi-menu",
                need_refresh: false,
                tabs: [
                    {
                        tab: TableView,
                        name: "Students"
                    },
                    {
                        tab: DetailView,
                        name: "Detail"
                    }
                ]
            }
        },
        created () {

        },
        methods: {
            on_nav() {
                if(this.nav_icon === "mdi-menu") {
                    console.log("show menu: ", this.nav_icon)
                    this.menu = true
                } else {
                    this.nav_icon = "mdi-menu"
                    this.current_tab = this.tabs[0].tab
                }
            },
            detail(item) {
                console.log("show item detail: ", item)
                this.nav_icon = "mdi-arrow-left"
                this.detail_item = item
                this.current_tab = this.tabs[1].tab
            },
            table(item) {
                console.log("show table: ", item)
                this.nav_icon = "mdi-menu"
                this.current_tab = this.tabs[0].tab
            },
            on_refresh() {
                console.log("send refresh: ", this.need_refresh)
                this.need_refresh = true
                setTimeout(()=>{
                    this.need_refresh = false
                }, 100)
            }
        },
        watch: {

        }

    }
</script>

<style scoped>

</style>
