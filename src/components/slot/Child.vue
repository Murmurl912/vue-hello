<template>
    <div>
        <h1>今天天气状况</h1>
        <slot name="weather">
            天气状况未知
        </slot>
    </div>
</template>

<script>
    export default {
        name: "Child"
    }
</script>

<style scoped>

</style>