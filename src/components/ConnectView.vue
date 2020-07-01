<template>
    <v-main>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex sm8 md4>
                    <v-card class="elevation-12"
                            v-bind:disabled="is_connecting"
                            v-bind:loading="is_connecting">
                        <v-card-title center>Connect to Hbase Rest Server</v-card-title>
                        <v-card-text>
                            <v-form>
                                <v-text-field
                                        v-model="connection.host"
                                        prepend-inner-icon="cloud"
                                              name="hostname"
                                              label="Hostname">

                                </v-text-field>
                                <v-text-field
                                        v-model="connection.port"
                                        prepend-inner-icon="device_hub"
                                              name="port"
                                              label="Port Number">

                                </v-text-field>
                            </v-form>
                            <span>Connection: {{connection}}</span>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="danger" v-on:click="on_reset">Reset</v-btn>
                            <v-btn color="primary" v-on:click="on_connect">Connect</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </v-main>
</template>

<script>
    import { bus } from '@/main'
    import { Hbase } from '@/module/hbase'
    import {Store} from '@/module/store'
    export default {
        name: "ConnectView",
        data () {
            return {
                connection: {
                    host: "localhost",
                    port: "8086"
                },
                connecting: false,
            }
        },
        computed: {
            is_connecting() {
                return this.connecting
            }
        },
        created () {
            let connection = Store.get_connection()
            if (connection == null) {
                return
            }
            this.connection.port = connection.port
            this.connection.host = connection.host
            let hbase = new Hbase(this.connection.host, this.connection.port)
            hbase.count((response)=> {
                console.log("count response", response)
                Store.put_connection(this.connection)
                Store.put_record_count(response.data["Row"].length)
                bus.$emit("navigation-event", this.connection.toString())
            }, (error) => {
                console.log("count error", error)
            })
        },
        methods: {
            on_connect () {
                let hbase = new Hbase(this.connection.host, this.connection.port)
                this.connecting = true
                hbase.count((response)=> {
                    console.log("count response", response)
                    Store.put_connection(this.connection)
                    Store.put_record_count(response.data["Row"].length)
                    bus.$emit("navigation-event", this.connection.toString())
                    this.connecting = false
                }, (error) => {
                    console.log("count error", error)
                    this.connecting = false
                })
            },
            on_reset () {
                this.connection.host = "localhost"
                this.connection.port = "8086"
            },
        }
    }
</script>

<style scoped>

</style>