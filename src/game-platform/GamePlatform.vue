<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DeckBuilder from './views/DeckBuilder.vue'
import CardData from './views/CardData.vue'
import GameTable from './views/GameTable.vue'
import { useCardStore } from './stores/cards'
import { useDeckStore } from './stores/decks'
import useUserStore from '@/store/modules/user'
import './style.css'
import './rules-table.css'
import './effect-resolution.css'
import './erosion-fix.css'
import './deck-style-fix.css'
import './mulligan.css'

const cards = useCardStore()
const decks = useDeckStore()
const userStore = useUserStore()
const router = useRouter()
const page = ref('deck')

onMounted(async () => { await cards.initialise(); await decks.fetchSaved() })
async function logout() { await userStore.logOut(); await router.replace('/login') }
</script>

<template>
  <div class="game-platform">
    <el-container class="app-shell">
      <el-header class="app-header">
        <div class="brand"><span class="brand-mark">PGR</span><div><h1>战双 TCG</h1><small>联机对战平台</small></div></div>
        <el-menu :default-active="page" mode="horizontal" :ellipsis="false" @select="(value: string) => page = value">
          <el-menu-item index="deck">牌组编辑</el-menu-item><el-menu-item index="game">对战桌面</el-menu-item><el-menu-item index="data">数值纠错</el-menu-item>
        </el-menu>
        <el-tag v-if="cards.cards.length" type="success">已载入 {{ cards.cards.length }} 个卡号</el-tag>
        <span class="game-user">{{ userStore.nickName || userStore.name }}</span>
        <el-button link type="primary" @click="logout">退出登录</el-button>
      </el-header>
      <el-main v-loading="cards.loading">
        <el-alert v-if="cards.error" :title="cards.error" type="error" show-icon />
        <DeckBuilder v-else-if="page === 'deck'" /><GameTable v-else-if="page === 'game'" /><CardData v-else />
      </el-main>
    </el-container>
  </div>
</template>
