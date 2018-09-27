import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '../components/recommend/recommend'
import Rank from '../components/rank/rank'
import Search from '../components/search/search'
import Singer from '../components/singer/singer'
import SingerDetail from '../components/singer-detail/singer-detail'
import Disc from '../components/disc/disc'
import TopList from '../components/top-list/top-list'
Vue.use(Router)

export default new Router({
    routes: [{
            path: '/',
            redirect: '/recommend'
        },
        {
            path: '/recommend',
            name: 'Recommend',
            component: Recommend,
            children: [{
                path: ':id',
                component: Disc
            }]
        },
        {
            path: '/rank',
            name: 'Rank',
            component: Rank,
            children: [{
                path: ':id',
                component: TopList
            }]
        },
        {
            path: '/search',
            name: 'Search',
            component: Search
        },
        {
            path: '/singer',
            name: 'Singer',
            component: Singer,
            children: [{
                path: ':id',
                component: SingerDetail
            }]
        }
    ]
})