<template>
    <v-row>
        <v-col cols="12">
            <v-data-table
                    :loading="loading_search"
                    :search="search_key"
                    v-model="selected"
                    :headers="headers"
                    :items="students"
                    item-key="number"
                    show-select
                    class="elevation-8">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-btn :disabled="selected.length === 0"
                               v-on:click="delete_dialog = true"
                               color="deep-orange" depressed small class="mr-2">
                            <v-icon color="white">delete</v-icon>
                            <span class="white--text">Delete</span>
                        </v-btn>

                        <v-dialog persistent v-model="dialog">
                            <template v-slot:activator="{on, attrs}">
                                <v-btn :disabled="selected.length > 0" v-bind="attrs" v-on="on"
                                       v-on:click="on_open_student"
                                       color="primary" depressed small>
                                    <v-icon>add</v-icon>
                                    <span>Add</span>
                                </v-btn>
                            </template>
                            <v-card :disabled="adding_student" :loading="adding_student">
                                <v-card-title>
                                    Add a new student record
                                </v-card-title>
                                <v-card-text>
                                    <v-form v-model="student_valid"
                                            ref="student_form"
                                            :lazy-validation="true">
                                        <v-row>
                                            <v-col cols="6">
                                                <v-text-field
                                                        required
                                                        v-model="student_model.number"
                                                        :rules="[not_empty, number_check]"
                                                        label="Student Number"
                                                        name="student_number">

                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-text-field
                                                        required
                                                        v-model="student_model.name"
                                                        :rules="[not_empty]"
                                                        label="Student Name"
                                                        name="student_name">

                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-select
                                                        v-model="student_model.gender"
                                                        :items="['Male', 'Female', 'None']"
                                                        label="Gender"
                                                        name="student_gender">
                                                </v-select>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-text-field
                                                        v-model="student_model.age"
                                                        label="Age"
                                                        name="student_age"
                                                        :rules="[age_check]"
                                                        type="number">

                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn small
                                           depressed
                                           v-on:click="on_close_student">
                                        Cancel
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn small
                                           depressed
                                           color="red lighten-2"
                                           v-on:click="on_rest_student">
                                        Reset
                                    </v-btn>
                                    <v-btn small
                                           depressed
                                           color="primary"
                                           v-on:click="on_add_student">
                                        Add Student
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-spacer></v-spacer>
                        <v-text-field
                                :disabled="selected.length > 0"
                                v-model="search_key"
                                rounded
                                solo
                                flat
                                clearable
                                dense
                                hide-details
                                background-color="#eeeeee"
                                prepend-inner-icon="search">
                        </v-text-field>
                    </v-toolbar>
                </template>
                <template v-slot:item.detail="{item}">
                    <v-btn text v-on:click="$emit('detail', item)">details</v-btn>
                </template>
            </v-data-table>
        </v-col>
        <v-dialog v-model="delete_dialog">
            <v-card :loading="deleting_student" :disabled="deleting_student">
                <v-card-title>Are you sure?</v-card-title>
                <v-card-text class="text-sm-h6">
                    Selected {{selected.length}} student(s) record will be deleted. This operation cannot be canceled.
                </v-card-text>
                <v-card-actions>
                    <v-btn small depressed
                           color="red" v-on:click="on_delete_student">Confirm Delete</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn left small depressed
                           color="green"
                           v-on:click="delete_dialog = false">
                        Cancel Delete
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
                top
                right
                v-model="snackbar"
                :color="snackbar_color"
                :timeout="3000">
            <span>{{snackbar_text}}</span>
        </v-snackbar>

    </v-row>
</template>

<script>
    import {Store} from "@/module/store";
    import {Hbase} from "@/module/hbase";

    export default {
        name: "TableView",
        props: {
            refresh: Boolean
        },
        data() {
            return {
                snackbar: false,
                snackbar_color: "",
                snackbar_text: "",
                search_key: "",
                delayed_timer: null,
                loading_search: false,
                selected: [],
                headers: [
                    {
                        text: 'Student Number',
                        align: 'start',
                        sortable: false,
                        value: 'number',
                    },
                    { text: 'Name', value: 'name' },
                    { text: 'Gender', value: 'gender' },
                    { text: 'Age', value: 'age' },
                    { text: 'Detail', value: 'detail' },
                ],
                students: [

                ],
                connection: {
                    host: "localhost",
                    port: "8086"
                },
                student_model: {
                    name: null,
                    number: null,
                    gender: null,
                    age: null
                },
                raw_students: [],
                dialog: false,
                hbase: null,
                number_unique: true,
                student_valid: false,
                adding_student: false,
                delete_dialog: false,
                deleting_student: false
            }
        },
        created () {
            let connection = Store.get_connection()
            if (connection == null) {
                console.log("connection is empty")
                return
            }
            this.connection.port = connection.port
            this.connection.host = connection.host
            this.fetch("")
        },
        methods: {
            fetch (search_key) {
                if(this.hbase == null) {
                    this.hbase = new Hbase(this.connection.host, this.connection.port)
                }
                this.loading_search = true
                this.hbase.search(search_key,
                    (keys) =>{
                        console.log("item keys: ", keys)
                        this.hbase.fetch(keys, this.on_update, this.on_error)
                    },
                    this.on_error)
            },
            on_update(items) {
                console.log("decoded items: ", items)
                this.students = []
                items.forEach(item => {
                    this.students.push(item)
                })
                this.loading_search = false
            },
            on_error(error) {
                console.log(error)
                this.loading_search = false
                this.snackbar_text = "failed to fetch student!"
                this.snackbar_color = "error"
                this.snackbar = true
            },
            on_open_student() {
                this.number_unique = true
                this.adding_student = false
            },
            on_add_student() {
                this.adding_student = true
                if(!this.student_valid) {
                    this.adding_student = false
                    return
                }
                this.hbase.unique(this.student_model.number, res => {
                    this.number_unique = res
                    this.$refs.student_form.validate()
                    if(this.hbase == null) {
                        this.hbase = new Hbase(this.connection.host, this.connection.port)
                    }
                    this.hbase.insert([this.student_model], (response)=>{
                        console.log("add student success: ", response, this.student_model)
                        this.adding_student = false
                        this.dialog = false
                        this.snackbar_text = "student added!"
                        this.snackbar_color = "success"
                        this.snackbar = true
                        this.on_rest_student()
                        this.fetch("")
                    }, error => {
                        console.log("add student failed: ", error, this.student_model)
                        this.adding_student = false
                        this.snackbar_text = "add student failed!"
                        this.snackbar_color = "error"
                        this.snackbar = true
                        this.fetch("")
                    })
                })
            },
            on_rest_student() {
                this.$refs.student_form.resetValidation()
                this.$refs.student_form.reset()
                this.number_unique = true
                this.adding_student = false
            },
            on_close_student() {
                this.on_rest_student()
                this.dialog = false
            },
            on_delete_student() {
                this.deleting_student = true
                if(this.hbase == null) {
                    this.hbase = new Hbase(this.connection.host, this.connection.port)
                }
                this.hbase.delete_all(this.selected.map(student => {
                    return student.number
                }), (response) => {
                    console.log("delete success: ", response, this.selected)
                    this.deleting_student = false
                    this.delete_dialog = false

                    this.snackbar_text = "student deleted!"
                    this.snackbar_color = "success"
                    this.snackbar = true
                    this.fetch("")
                }, (error) => {
                    console.log("delete error: ", error, this.selected)

                    this.deleting_student = false
                    this.delete_dialog = false
                    this.selected = []
                    this.snackbar_text = "failed to delete student!"
                    this.snackbar_color = "error"
                    this.snackbar = true
                    this.fetch("")
                })
            },
            not_empty(value) {
                return value != null || "Required"
            },
            age_check(value) {
                if(value == null) {
                    return true
                }
                return (parseInt(value) > 0 && parseInt(value) < 127) || "You are from outer space"
            },
            number_check(value) {
                console.log("number check: ", value)
                return this.number_unique || "Student number must unique"
            },

        },
        watch: {
            search_key: function (value) {
                console.log("search key changed: ", value)
                if(this.delayed_timer != null) {
                    clearTimeout(this.delayed_timer)
                }
                this.delayed_timer = setTimeout(()=>{
                    this.fetch(this.search_key)
                }, 500)
            },
            refresh: function (value) {
                console.log("refresh: ", value)
                if(value) {
                    this.fetch(this.search_key == null ? "" : this.search_key)
                }
            }
        }
    }
</script>

<style scoped>

</style>