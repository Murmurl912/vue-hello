<template>
    <div>
        <div>使用SLOT分发内容</div>
        <div>
            <Child>
<!--                v-slot can only be used in component or template-->
                <template v-slot:weather>
                    <div>
                        暴雨，最低气温1摄氏度，最高气温20摄氏度，强风9-12级
                    </div>
                </template>
            </Child>
            <Child>

            </Child>
        </div>
    </div>
</template>

<script>
    import Child from "@/components/slot/Child";
    export default {
        name: "Parent",
        components: {Child}
    }
</script>

<style scoped>

</style>