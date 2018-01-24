import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '../components/recommend/recommend'
import Rank from '../components/rank/rank'
import Search from '../components/search/search'
import Singer from '../components/singer/singer'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/recommend'
        },
        {
            path: '/recommend',
            name: 'Recommend',
            component: Recommend
        },
        {
            path: '/rank',
            name: 'Rank',
            component: Rank
        },
        {
            path: '/search',
            name: 'Search',
            component: Search
        },
        {
            path: '/singer',
            name: 'Singer',
            component: Singer
        }
    ]
})
