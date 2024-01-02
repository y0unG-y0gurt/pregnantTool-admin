<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<uni-icons type="back" @click="navigateBack" size="26"></uni-icons>
				<view class="uni-title">【问卷】{{vote_title}}【问题】{{question_title}}【其他项内容】</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view>
			<uni-table stripe border emptyText="暂无更多数据">
				<uni-tr>
					<uni-th align="center">序号</uni-th>
					<uni-th align="center">其他回复内容</uni-th>
				</uni-tr>
				<uni-tr v-for="(item,index) in dataList" :key="index">
					<uni-td align="center">{{index+1}}</uni-td>
					<uni-td align="center">{{item.input_value}}</uni-td>
				</uni-tr>
			</uni-table>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	export default {
		data() {
			return {
				dataList: [],
				question_title: '',
				vote_title:''
			}
		},
		onLoad(e) {
			const optionsInfo = JSON.parse(decodeURIComponent(e.info));
			this.question_title = optionsInfo.question_title
			this.vote_title = optionsInfo.vote_title
			// 查出问题回答记录
			db.collection("uni-vote-questions-records").where({
				vote_id: optionsInfo.item.vote_id,
				vote_question_id: optionsInfo.item.vote_question_id
			}).get().then(res => {
				let data = res.result.data
				data.forEach(item => {
					if(Array.isArray(item.option_ids)){
						const arr = item.option_ids.filter(item => item.input_value)
						if (arr.length > 0) {
							this.dataList.push(arr[0])
						}
					}else{
						this.dataList.push(item.option_ids)
					}
				})
			})
		},
		methods: {
			navigateBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	.uni-header {
		min-height: 100px;
		flex-wrap: nowrap;
	}
</style>