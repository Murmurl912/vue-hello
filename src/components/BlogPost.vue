<template>
    <div v-bind:id="post.id" class="blog-post">
        <h3>{{post.title}}</h3>
        <button v-on:click="$emit('enlarge-text', 0.1)">Enlarge Text</button>
        <div v-html="post.content"></div>
    </div>
</template>

<script>
    export default {
        name: "BlogPost",
        props: {
            post: {
                id: Number,
                title: String,
                content: String
            }
        },
        data: ()=>{
            return {
                font_size: 1
            }
        },
        methods: {
            on_enlarge_text: (size)=>{
                this.font_size += size
            }
        }
    }
</script>

<style scoped>

</style>