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


