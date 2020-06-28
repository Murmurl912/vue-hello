<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png">
        <div :style="{fontSize: font_size + 'em'}">
            <BlogPost v-for="post in posts"
                      v-bind:key="post.id"
                      v-bind:post="post"
                      v-on:enlarge-text="font_size += $event"
            />
        </div>
        <div>
            <Parent></Parent>
        </div>
        <CurrentUser>
           <template v-slot:default="props">
               <h1>{{props.user.lastname}}</h1>
           </template>
        </CurrentUser>
        <CurrentUser v-slot="props">
            <h1>{{props.user.firstname}}</h1>
        </CurrentUser>
        <div>
            <button v-on:click="current_tab = tabs[2]">Home</button>
            <button>Posts</button>
            <button>Archive</button>
            <component v-bind:is="current_tab.component" v-bind:name="current_tab.name"></component>
        </div>
        <ButtonCounter/>
    </div>
</template>

<script>
    import ButtonCounter from "@/components/ButtonCounter";
    import BlogPost from "@/components/BlogPost";
    import Parent from "@/components/slot/Parent"
    import CurrentUser from "@/components/slot/CurrentUser";
    import DynamicComponent from "@/components/DynamicComponent";

    let tabs = [
        {
            name: "Home",
            component: DynamicComponent
        }
        ,
        {
            name: "Archive",
            component: DynamicComponent
        }
        ,
        {
            name: "Post",
            component: DynamicComponent
        }
    ]

    export default {
        name: 'App',
        components: {
            CurrentUser,
            Parent,
            BlogPost,
            ButtonCounter,
            DynamicComponent,
        },
        data: ()=>{
            return {
                font_size: 1,
                posts: [
                    {id: 1, title: "My Journey with vue", content: "Content One"},
                    {id: 2, title: "Blogging with vue", content: "Content Two"},
                    {id: 3, title: "Why vue is so fun", content: "There"}
                ],
                tabs: tabs,
                tab_index: 0,
                current_tab: tabs[0]
            }
        },
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
