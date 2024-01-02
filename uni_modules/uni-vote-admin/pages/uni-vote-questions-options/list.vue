<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<uni-icons type="back" @click="navigateBack" size="26"></uni-icons>
				<view class="uni-title">【问题】{{vote_question_title}}</view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<button class="uni-button" type="primary" size="mini" @click="navigateTo('./add?vote_id='+ vote_id + '&vote_question_id=' + vote_question_id, false)">新增问题选项</button>
				<button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">批量删除</button>
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
					:type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="default" size="mini">导出 Excel</button>
				</download-excel>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="udb" :collection="collectionList"
				field="vote_id,vote_question_id,title,count,sort,status,create_date,input_able,is_delete" :where="where"
				page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options" loadtime="manual" @load="onqueryload">
				<uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe
					type="selection" @selection-change="selectionChange">
					<uni-tr>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')" sortable
							@sort-change="sortChange($event, 'title')">问题选项</uni-th>
						<uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'count')" sortable
							@sort-change="sortChange($event, 'count')">投票数</uni-th>
						<!-- <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'sort')" sortable
							@sort-change="sortChange($event, 'sort')">排序</uni-th> -->
						<uni-th align="center" filter-type="select" :filter-data="options.filterData.status_localdata"
							@filter-change="filterChange($event, 'status')">状态</uni-th>
						<uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')"
							sortable @sort-change="sortChange($event, 'create_date')">创建时间</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">

						<uni-td align="center">{{item.title}}</uni-td>
						<uni-td align="center">{{item.count?item.count:0}}</uni-td>
						<!-- <uni-td align="center">{{item.sort}}</uni-td> -->
						<uni-td align="center" :class="{'green':options.status_valuetotext[item.status] == '启用'}">{{options.status_valuetotext[item.status]}}</uni-td>
						<uni-td align="center">
							<uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
						</uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button v-if="!item.input_able" @click="navigateTo('./edit?item='+ encodeURIComponent(JSON.stringify(item)), false)"
									class="uni-button" size="mini" type="primary">修改</button>
								<button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
						:total="pagination.count" @change="onPageChanged" />
				</view>
			</unicloud-db>
		</view>
	</view>
</template>

<script>
	// 导入相关依赖
	import {
		enumConverter,
		filterToWhere
	} from '../../js_sdk/validator/uni-vote-questions-options.js';

	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = 'sort' // 排序字段
	const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1

	const orderByMapping = {
		"ascending": "asc",
		"descending": "desc"
	}

	export default {
		data() {
			return {
				collectionList: "uni-vote-questions-options",
				query: '',
				where: '',
				orderby: dbOrderBy,
				orderByFieldName: "",
				selectedIndexs: [],
				options: {
					pageSize,
					pageCurrent,
					filterData: {
						"status_localdata": [{
								"value": 0,
								"text": "关闭"
							},
							{
								"value": 1,
								"text": "启用"
							}
						]
					},
					...enumConverter
				},
				imageStyles: {
					width: 64,
					height: 64
				},
				exportExcel: {
					"filename": "uni-vote-questions-options.xls",
					"type": "xls",
					"fields": {
						"vote_id": "vote_id",
						"vote_question_id": "vote_question_id",
						"问题选项": "title",
						"投票数": "count",
						"排序": "sort",
						"状态": "status",
						"创建时间": "create_date"
					}
				},
				exportExcelData: [],
				vote_id:'',
				vote_question_id: '',
				vote_question_title: ''
			}
		},
		onLoad(e) {
			this.vote_id = e.vote_id
			this.vote_question_id = e.question_id
			this.vote_question_title = e.title
			if(this.vote_question_id){
				this.where = `"vote_question_id" == "${this.vote_question_id}" && "is_delete" != true`
			}
			this._filter = {}
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		methods: {
			// 返回上一页
			navigateBack() {
				uni.navigateBack()
			},
			// 查询数据加载
			onqueryload(data) {
				this.exportExcelData = data
			},
			// 获取查询条件
			getWhere() {
				const query = this.query.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			// 搜索功能
			search() {
				const newWhere = this.getWhere()
				this.where = newWhere
				this.$nextTick(() => {
					this.loadData()
				})
			},
			// 加载数据
			loadData(clear = true) {
				this.$refs.udb.loadData({
					clear
				})
			},
			// 分页改变
			onPageChanged(e) {
				this.selectedIndexs.length = 0
				this.$refs.table.clearSelection()
				this.$refs.udb.loadData({
					current: e.current
				})
			},
			// 导航到指定页面
			navigateTo(url, clear) {
				// clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			// 获取多选项
			selectedItems() {
				var dataList = this.$refs.udb.dataList
				return this.selectedIndexs.map(i => dataList[i]._id)
			},
			// 多选改变时触发
			selectionChange(e) {
				this.selectedIndexs = e.detail.index
			},
			// 批量删除
			delTable() {
				let ids = this.selectedItems()
				this.deteleVote(ids)
				// this.$refs.udb.remove(this.selectedItems(), {
				// 	success: (res) => {
				// 		this.$refs.table.clearSelection()
				// 	}
				// })
			},
			// 确认删除
			confirmDelete(id) {
				this.deteleVote(id)
			},
			deteleVote(ids){
				uni.showModal({
					title: '确认要删除吗？',
					content: '删除后不可恢复，请谨慎操作！',
					success: async res => {
						if(res.confirm){
							const vote = uniCloud.importObject('uni-vote-co')
							await vote.handleRemove({
								removeIds:ids,
								dbName:'uni-vote-questions-options'
							}).then((e) => {
								this.$refs.table.clearSelection()
								this.$refs.udb.loadData()
							})
						}
					},
					fail: () => {},
					complete: () => {}
				});
			},
			// 排序改变
			sortChange(e, name) {
				this.orderByFieldName = name;
				if (e.order) {
					this.orderby = name + ' ' + orderByMapping[e.order]
				} else {
					this.orderby = ''
				}
				this.$refs.table.clearSelection()
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			},
			// 筛选改变
			filterChange(e, name) {
				this._filter[name] = {
					type: e.filterType,
					value: e.filter
				}
				let newWhere = filterToWhere(this._filter, db.command)
				if (Object.keys(newWhere).length) {
					this.where = newWhere
				} else {
					this.where = ''
				}
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			}
		}
	}
</script>

<style>
	.uni-header {
		min-height: 100px;
		flex-wrap: nowrap;
	}
	.uni-title{
		margin: 20px;
	}
	.green{
		color:#00aa00;
	}
</style>