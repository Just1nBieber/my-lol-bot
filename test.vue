<template>
<div :class="simpleMatchStyle.KDA_Card">
  <TooltipProvider :delay-duration="200">
	<Tooltip>
		<TooltipTrigger as-child>
      <span :class="simpleMatchStyle.kad">
        <span :class="simpleMatchStyle.kadNumber">{{ item.kills }}/{{ item.deaths }}/{{ item.assists }}</span>
       <span> {{ item.kda }}</span> //小字，次要
      </span>
		<TooltipTrigger>
		<TooltipContent>
      //占位，以后拿到全队数据会做图表，展示数据
		</TooltipContent>
	</Tooltip>
	</template>
</TooltipProvider>
</div>
<div :class="simpleMatchStyle.DAMAGE_Card">
  <TooltipProvider :delay-duration="200">
	<Tooltip>
		<TooltipTrigger as-child>
      <span :class="simpleMatchStyle.damage">
        <span :class="simpleMatchStyle.DamageNumber_Per">22% //暂时占位，未拿到全队数据</span>
        <span :class="simpleMatchStyle.DamageNumber">{{ item.SimpleTotalDamageDealtToChampions }}</span>
      </span>
		<TooltipTrigger>
		<TooltipContent>
      //占位，以后拿到全队数据会做图表，展示数据
		</TooltipContent>
	</Tooltip>
	</template>
</TooltipProvider>
</div>
</template>

<template>
<div :class="simpleMatchStyle.CS_Card">
  <TooltipProvider :delay-duration="200">
	<Tooltip>
		<TooltipTrigger as-child>
      <span :class="simpleMatchStyle.damage">
      <span :class="simpleMatchStyle.CSNumber">{{ item.cs }}</span>
        <span :class="simpleMatchStyle.CSNumber_Per">{{ item.csPerMinute }}/分钟</span>
      </span>
		<TooltipTrigger>
		<TooltipContent>
      //占位，以后拿到全队数据会做图表，展示数据
		</TooltipContent>
	</Tooltip>
	</template>
</TooltipProvider>
</div>
</template>


“Codex，我看了目前的战绩卡片 UI 和数据逻辑，我们需要分两步进行核心重构。请严格按照以下要求修改 MatchedCard.vue、style.js (或样式定义处) 以及 lcuState.ts：

第一步：修复卡片垂直方向的“严重挤压”问题 (UI 布局)
目前卡片底部的游戏模式、时间信息被完全挤到了视口外看不到，装备图标也被挤压。请执行以下样式修复：

释放高度：将卡片的最外层容器（simpleMatchStyle.card）的固定高度（如 h-[100px]）修改为最小高度 min-h-[115px] 或适当增加固定高度 h-[120px]，让内容有呼吸空间。

左侧与中间布局优化：

确保 KDA、伤害、补刀的数据块不要过度占用垂直空间。优化一下它们的观赏性，当前它们的字体，字重，大小，太难看。

确保底部的装备栏 (Items) 和 Tag (Badges，如治疗、击杀) 在同一水平线上，且不要越界。

将底部信息（单双排 · 日期 · 长度）稳妥地放置在卡片左下角（可以使用 absolute bottom-2 left-4，并给外层加上 relative 和足够的 pb padding，或者使用 Flex 列布局的 mt-auto）。

第二步：10人详情全栈链路打通与渲染 (核心数据流)
目前右侧的 10 人名单是假数据（Vae、人生如雾等），需要通过 gameId 拉取真实数据并替换。

后端 IPC (Main 进程)：确保存在 get-match-detail 接口，接收 gameId 并调用 LCU /lol-match-history/v1/games/${gameId} 返回拿到的所有数据。并写出相应TS类型接口。

前端缓存引擎 (lcuState.ts)：

引入 shallowRef, markRaw。

创建独立缓存：const detailForage = localforage.createInstance({ name: 'MatchDetailsCache' })（严禁污染静态字典）。

新增状态：matchDetailsDict = shallowRef<Record<number, any>>({})。

新增 Action fetchMatchDetail(gameId)：

拦截1：内存 matchDetailsDict.value[gameId] 存在则 return。

拦截2：读 detailForage，命中则 markRaw 存入内存并解构更新视图。

拦截3：调用 window.api.invoke('get-match-detail', gameId)，拿到后 markRaw 存入内存，异步写入 detailForage，并执行 matchDetailsDict.value = { ...matchDetailsDict.value } 强制更新 UI。

UI 层自动拉取与渲染 (MatchedCard.vue)：

卡片挂载时（或在可视区域内时），自动调用 fetchMatchDetail(item.gameId) 拉取详情数据。

将右侧的 10 人假数据模板，替换为真实的遍历逻辑（从 lcuState.matchDetailsDict[item.gameId]?.participants 中获取）。

渲染出真实的召唤师名字和使用的英雄头像。