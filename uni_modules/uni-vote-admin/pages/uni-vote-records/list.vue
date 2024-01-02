<template>
	<view class="container">
		<view class="uni-header">
			<view class="uni-group">
				<uni-icons type="back" size="26" @click="navigateBack"></uni-icons>
				<view class="uni-title">【问卷结果统计】{{vote_title}}</view>
				<view class="uni-sub-title"></view>
			</view>
			<button class="btn-box" type="primary" size="mini" @click="refresh">刷新</button>
		</view>
		<view class="stat-box">
			<view class="stat-item">
				<view class="stat-tip">投票次数：</view>
				<view class="stat-count">{{voteCount}}</view>
			</view>
			<view class="stat-item">
				<view class="stat-tip">问题项总数：</view>
				<view class="stat-count">{{questionsCount}}</view>
			</view>
		</view>
		<unicloud-db ref="udb" :collection="collectionList" :where="where"
			v-slot:default="{data,pagination,loading,error,options,hasMore}" @load="onqueryload">
			<view v-if="error" class="error">{{error.errMsg}}</view>
			<view v-else class="list">
				<view v-for="(questionItem, questionIndex) in data" :key="questionIndex" class="list-item">
					<view class="question-title">
						<view>Q{{questionIndex+1}}.</view>
						<view style="color: #2979ff;"> 【{{questionItem.type=='checkbox'?'多选':'单选'}}】</view>
						<view>{{ questionItem.title }}</view>
					</view>
					<view class="question-options">
						<view>
							<uni-table stripe border emptyText="暂无更多数据">
								<uni-tr>
									<uni-th align="center">选项</uni-th>
									<uni-th align="center">选择次数</uni-th>
									<uni-th align="center">百分比</uni-th>
								</uni-tr>
								<uni-tr v-for="(item, index) in questionItem.vote_items" :key="index">
									<template v-if="item.input_able">
										<uni-td align="center">
											<view>{{item.title}}</view>
											<view class="input-detail" @click="inputValueDetail(item,questionItem.title)">【查看详情】
											</view>
										</uni-td>
									</template>
									<template v-else>
										<uni-td align="center">{{item.title}}</uni-td>
									</template>
									<uni-td align="center">{{item.count? item.count:0}}</uni-td>
									<uni-td
										align="center">{{item.count? countPercentage(item.count,questionItem.vote_items) : 0}}</uni-td>
								</uni-tr>
							</uni-table>
						</view>
						<view class="charts-box">
							<qiun-data-charts type="pie" :opts="opts" :chartData="chartData(questionItem)" />
						</view>
					</view>
				</view>
			</view>
			<uni-load-more :status="loading?'loading':(hasMore ? 'more' : 'noMore')"></uni-load-more>
		</unicloud-db>

	</view>
</template>

<script>
	const db = uniCloud.database();
	let seriesObj = {
		series: []
	}
	export default {
		data() {
			return {
				//您可以通过修改 config-ucharts.js 文件中下标为 ['pie'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts 。实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
				opts: {
					color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
						"#ea7ccc"
					],
					padding: [5, 5, 5, 5],
					enableScroll: false,
					extra: {
						pie: {
							activeOpacity: 0.5,
							activeRadius: 10,
							offsetAngle: 0,
							labelWidth: 15,
							border: false,
							borderWidth: 3,
							borderColor: "#FFFFFF"
						}
					}
				},
				exportExcelData: [],
				where: '',
				vote_id: "",
				vote_title: "",
				voteCount: 0,
				questionsCount:0
			};
		},
		onLoad(e) {
			this.vote_id = e.id
			this.vote_title = e.title
			this.where = `"vote_id" == "${this.vote_id}" && "is_delete" != true`
			this.getVoteCount()
		},
		computed: {
			collectionList() {
				if (this.vote_id) {
					return [
						db.collection('uni-vote-questions').where(`"status" == 1 && "vote_id" == "${this.vote_id}" && "is_delete" != true`)
						.getTemp(),
						db.collection('uni-vote-questions-options').where(`"status" == 1 && "is_delete" != true`).getTemp()
					]
				}
			}
		},
		methods: {
			async getVoteCount() {
				const voteCountRes = await db.collection('uni-vote-records').where({
					vote_id: this.vote_id
				}).get()
				this.voteCount =  voteCountRes.result.data.reduce((per,cur)=>per + cur.count,0)
			},
			refresh() {
				this.$refs.udb.refresh()
			},
			// 百分比
			countPercentage(count, vote_items) {
				const arr = vote_items.filter(i => i.count)
				const total = arr.reduce((sum, option) => sum + option.count, 0);
				const percentage = (count / total * 100).toFixed(2);
				return `${percentage}%`;
			},
			navigateBack() {
				uni.navigateBack()
			},
			onqueryload(data) {
				data.map(item => {
					item.vote_items = item._id['uni-vote-questions-options']
					item._id = item._id._value
				})
				this.questionsCount = data.length?data.length:0
			},
			// 【其他】选项回复内容详情
			inputValueDetail(item, question_title) {
				let info = {
					question_title,
					item,
					vote_title: this.vote_title
				}
				uni.navigateTo({
					url: "/uni_modules/uni-vote-admin/pages/uni-vote-records/detail?info=" + encodeURIComponent(JSON
						.stringify(info))
				})
			},
			// 图表
			chartData(item) {
				let dataOptions = item.vote_items.map(item => ({
					name: item.title,
					value: item.count ? item.count : 0
				}));
				let seriesData = [];
				seriesData.push({
					data: dataOptions
				});
				seriesObj.series = seriesData
				return JSON.parse(JSON.stringify(seriesObj))
			}
		}
	};
</script>

<style scoped>
	.uni-header {
		min-height: 100px;
		flex-wrap: nowrap;
		margin: 0 25px;
	}

	.stat-box {
		display: flex;
		align-items: center;
		justify-content: space-around;
		margin: 0 40px;
		padding: 20px;
		border-radius: 7px;
		border: #eee solid 1px;
	}
	.stat-item{
		display: flex;
		align-items: center;
		flex-direction: row;
		margin: 0 50px;
	}

	.stat-tip {
		color: #999;
	}

	.stat-count {
		font-size: 28px;
		font-weight: 700;
		color: #333;
	}

	.uni-title {
		margin-left: 15px;
	}

	.btn-box {
		display: flex;
		margin-right: 30px;
	}

	.list-item {
		padding: 20px;
		margin: 20px 40px 40px 40px;
		border: #eee solid 1px;
		border-radius: 15rpx;
		display: flex;
		flex-direction: column;
	}

	.uni-table-scroll {
		min-height: 50%;
	}

	.question-title {
		margin-bottom: 20px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.question-options {
		align-items: center;
		display: flex;
		flex-direction: row;
	}

	.input-detail {
		color: #2979ff;
		cursor: pointer;
	}

	/* 请根据实际需求修改父元素尺寸，组件自动识别宽高 */
	.charts-box {
		width: 100%;
		height: 300px;
		/* border: blue solid 1px; */
	}
</style>