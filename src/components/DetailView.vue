<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="6" :loading="progress" :disabled="progress">
                <v-card-title>Profile</v-card-title>
                <v-card-text>
                    <v-form ref="item_form"
                            v-model="valid">
                        <v-row>
                            <v-col cols="6">
                                <v-text-field readonly v-model="item.number" label="Number">
                                    {{item.number}}
                                </v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field :readonly="read_mode" v-model="item.name" label="Name">
                                </v-text-field>
                            </v-col>
                            <v-col  cols="6">
                                <v-text-field :readonly="read_mode" v-model="item.age" type="number" label="Age"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-select :readonly="read_mode" v-model="item.gender" :items="['male', 'female', 'none']" label="Gender"></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-title>Grades</v-card-title>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <v-col cols="4">
                                <v-text-field :readonly="read_mode" v-model="item.math" label="Math">
                                </v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field :readonly="read_mode" v-model="item.english" label="English">
                                </v-text-field>
                            </v-col>
                            <v-col  cols="4">
                                <v-text-field :readonly="read_mode" v-model="item.chinese" label="Chinese"></v-text-field>
                            </v-col>

                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-btn depressed color="red" v-on:click="confirm_text = 'delete'; confirm_dialog = true">Delete</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn v-show="!read_mode" v-on:click="on_reset">Reset</v-btn>
                    <v-btn depressed color="orange" v-on:click="on_action">{{read_mode ? "Modify" : "Save"}}</v-btn>
                    <v-btn depressed color="primary" v-on:click="on_cancel">{{read_mode ? "Return" : "Cancel"}}</v-btn>
                </v-card-actions>

                <v-dialog v-model="confirm_dialog">
                    <v-card>
                        <v-card-title>
                            Are you sure?<br/>This operation cannot be canceled.
                        </v-card-title>
                        <v-card-actions>
                            <v-btn color="red" text v-on:click="on_confirm">
                                Confirm
                            </v-btn>
                            <v-btn color="primary" text v-on:click="confirm_dialog = false">
                                Cancel
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-card>
            <v-snackbar
                    top
                    right
                    v-model="snackbar"
                    :color="snackbar_color"
                    :timeout="3000">
                <span>{{snackbar_text}}</span>
            </v-snackbar>
        </v-col>
    </v-row>
</template>

<script>
    import {Store} from "@/module/store";
    import {Hbase} from "@/module/hbase";

    export default {
        name: "DetailView",
        props: {
            student: {},
            refresh: Boolean
        },
        created () {
            let connection = Store.get_connection()
            if (connection == null) {
                console.log("connection is empty")
                return
            }
            this.connection.port = connection.port
            this.connection.host = connection.host
        },
        data () {
            return {
                snackbar: false,
                snackbar_color: "",
                snackbar_text: "",
                item: JSON.parse(JSON.stringify(this.student)),
                item_clone:  JSON.parse(JSON.stringify(this.student)),
                connection: {
                    port: "",
                    host: "",
                },
                hbase: null,
                valid: false,
                read_mode: true,
                progress: false,
                confirm_dialog: false,
                confirm_text: "delete"
            }
        },
        methods: {
            on_refresh() {
                this.progress = true
                if(this.hbase == null) {
                    this.hbase = new Hbase(this.connection.host, this.connection.port)
                }
                this.hbase.get(this.item_clone.number, (res) => {
                    console.log("refresh item: ", this.item_clone, res)
                    this.item_clone = res
                    this.item = JSON.parse(JSON.stringify(res))
                    this.progress = false
                }, error => {
                    console.log("failed to refresh item: ", this.item_clone, error)
                    this.$emit("table", this.item_clone)
                    this.progress = false
                    this.snackbar_text = "failed to refresh student!"
                    this.snackbar_color = "error"
                    this.snackbar = true
                })
            },
            on_delete() {
                this.progress = true
                if(this.hbase == null) {
                    this.hbase = new Hbase(this.connection.host, this.connection.port)
                }
                this.hbase.delete(this.item["number"],
                    (response)=> {
                        console.log("delete success: ", response, this.item)
                        this.snackbar_text = "student deleted!"
                        this.snackbar_color = "success"
                        this.snackbar = true
                        this.progress = false
                        this.$emit("table", this.item_clone)
                    }, (error) => {
                        console.log("delete error: ", error, this.item)
                        this.snackbar_text = "delete student failed!"
                        this.snackbar_color = "error"
                        this.snackbar = true
                        this.progress = false
                        this.$emit("table", this.item_clone)
                    })
            },
            on_confirm() {
                if(this.confirm_text === "delete") {
                    this.on_delete()
                } else if(this.confirm_text === "update"){
                    this.on_save()
                }
                this.confirm_dialog = false
            },
            on_cancel() {
                if(this.read_mode) {
                    this.$emit("table", this.item_clone)
                } else {
                    this.read_mode = true
                    this.on_reset()
                }
            },
            on_action() {
                if(this.read_mode) {
                    this.read_mode = false
                } else {
                    this.confirm_text = "update"
                    this.confirm_dialog = true
                }
            },
            on_reset() {
                this.item = JSON.parse(JSON.stringify(this.item_clone))
            },
            on_save() {
                this.progress = true
                if(this.hbase == null) {
                    this.hbase = new Hbase(this.connection.host, this.connection.port)
                }

                let detail = {
                    "number": this.item.number
                }

                if(this.item["age"] !== this.item_clone["age"]) {
                    if(this.item["age"] == null || this.item["age"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["age"] = this.item_clone["age"]
                    } else {
                        detail["age"] = this.item["age"]
                    }
                }
                if(this.item["name"] !== this.item_clone["name"]) {
                    if(this.item["name"] == null || this.item["name"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["name"] = this.item_clone["name"]
                    } else {
                        detail["name"] = this.item["name"]
                    }
                }
                if(this.item["gender"] !== this.item_clone["gender"]) {
                    if(this.item["gender"] == null || this.item["gender"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["gender"] = this.item_clone["gender"]
                    } else {
                        detail["gender"] = this.item["gender"]
                    }
                }
                if(this.item["math"] !== this.item_clone["math"]) {
                    if(this.item["math"] == null || this.item["math"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["math"] = this.item_clone["math"]
                    } else {
                        detail["math"] = this.item["math"]
                    }
                }
                if(this.item["chinese"] !== this.item_clone["chinese"]) {
                    if(this.item["chinese"] == null || this.item["chinese"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["chinese"] = this.item_clone["chinese"]
                    } else {
                        detail["chinese"] = this.item["chinese"]
                    }
                }
                if(this.item["english"] !== this.item_clone["english"]) {
                    if(this.item["english"] == null || this.item["english"].replace(/^\s+|\s+$/g, "") === "") {
                        this.item["english"] = this.item_clone["english"]
                    } else {
                        detail["english"] = this.item["english"]
                    }
                }

                if(JSON.stringify(this.item) === JSON.stringify(this.item_clone)) {
                    console.log("save report: ", "empty")
                    this.progress = false
                    return
                }
                console.log("save report: ", detail)
                this.hbase.insert([detail],
                    (response)=>{
                        console.log("save response: ", response)
                        this.item_clone = JSON.parse(JSON.stringify(this.item))
                        this.read_mode = true
                        this.progress = false
                        this.snackbar_text = "student modified!"
                        this.snackbar_color = "success"
                        this.snackbar = true
                    }, (error)=>{
                        console.log("save error: ", error)
                        this.progress = false
                        this.snackbar_text = "failed to modify student!"
                        this.snackbar_color = "error"
                        this.snackbar = true
                })
            },
        },
        watched: {
            refresh: function (value) {
                console.log("refresh: ", value)
                if(value) {
                    this.on_refresh()
                }
            }
        }
    }
</script>

<style scoped>

</style>