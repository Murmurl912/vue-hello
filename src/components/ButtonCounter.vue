<template>
    <button v-on:click="count++">You clicked me {{count}} times total.</button>
</template>

<script>
    export default {
        name: "ButtonCounter",
        props: {

        },
        data: ()=>{
            return {
                count: 0
            }
        }
    }
</script>

<style scoped>

</style>