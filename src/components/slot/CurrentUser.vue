<template>
    <span>
        <slot v-bind:user="user">{{user.lastname}}</slot>
    </span>
</template>

<script>
    export default {
        name: "CurrentUser",
        props: {

        },
        data: ()=>{
            return {
                user: {
                    firstname: "Murmur",
                    lastname: "Empty"
                }
            }
        }
    }
</script>

<style scoped>

</style>