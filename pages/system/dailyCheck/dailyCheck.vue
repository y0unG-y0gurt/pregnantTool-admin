<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<button v-if="hasPermission('DELETE_UNI_CMS_ARTICLE')" class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">
					批量删除
				</button>
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
					:type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">导出 Excel</button>
				</download-excel>
			</view>
		</view>
        <view class="uni-container">
                <unicloud-db ref="udb" v-slot:default="{data, loading, error, options}" collection="daily-check,uni-id-users" 
                field="_id,user_id.nickname,user_id._id,sport_type,feeling,sport_duriation,highest_hb,date" @load="onqueryload" :orderby="orderby">
                    <view v-if="error">{{error.message}}</view>
                    <view v-else>
                        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe
                        	type="selection" @selection-change="selectionChange">
                            <uni-tr>
                                <uni-th align="center" @filter-change="filterChange($event, 'date')"
                                	sortable @sort-change="sortChange($event, 'date')">运动日期
                                </uni-th>
                                <uni-th align="center" @filter-change="filterChange($event, 'user_id.nickname')"
                                	sortable @sort-change="sortChange($event, 'user_id.nickname')">用户昵称
                                </uni-th>
                                <uni-th align="center" @filter-change="filterChange($event, 'feeling')"
                                	sortable @sort-change="sortChange($event, 'feeling')">感受
                                </uni-th>
                                <uni-th align="center" @filter-change="filterChange($event, 'sport_duriation')"
                                	sortable @sort-change="sortChange($event, 'sport_duriation')">运动时长
                                </uni-th>
                                <uni-th align="center" @filter-change="filterChange($event, 'sport_type')"
                                	sortable @sort-change="sortChange($event, 'sport_type')">运动类型
                                </uni-th>
                                <uni-th align="center" @filter-change="filterChange($event, 'highest_hb')"
                                	sortable @sort-change="sortChange($event, 'highest_hb')">最高心率
                                </uni-th>
                            </uni-tr>
                            <uni-tr v-for="item in data" :key="" >
                                <uni-td align="center">{{ item.date }}</uni-td>
                                <uni-td align="center">{{ item.user_id }}</uni-td>
                                <uni-td align="center">{{ item.feeling }}</uni-td>
                                <uni-td align="center">{{ item.sport_duriation }}</uni-td>
                                <uni-td align="center">{{ item.sport_type }}</uni-td>
                                <uni-td align="center">{{ item.highest_hb }}</uni-td>
                            </uni-tr>
                        </uni-table>
                    </view>
                </unicloud-db>
        	</view>
	</view>
</template>

<script>
// 引入公共方法
import { enumConverter, filterToWhere } from '@/uni_modules/uni-cms/common/validator/uni-cms-articles.js';
import authMixin from "@/uni_modules/uni-cms/common/auth-mixin";
import {parseImageUrl} from "@/uni_modules/uni-cms/common/parse-image-url";

// 实例化数据库
const db = uniCloud.database()
// 用户表
const userDBName = 'uni-id-users'
// 打卡表
const checkDBName = 'daily-check'

// 表查询配置
const dbOrderBy = '' // 排序字段
const dbSearchFields = ['title', 'excerpt'] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
// 分页配置
const pageSize = 20
const pageCurrent = 1

// 排序方式映射
const orderByMapping = {
	"ascending": "asc",
	"descending": "desc"
}

export default {
  mixins: [authMixin],
	data() {
		return {
			// collectionList 包含了三个对象，每个对象都是一个数据库查询对象，用于联表查询。第一个对象查询文章表，第二个对象查询分类表，第三个对象查询用户表。
			collectionList: [
				db.collection(checkDBName).field('user_id._id,user_id.nickName,sport_type,sport_duriation,highest_hb,feeling').getTemp(),
				db.collection(userDBName).field('nickname, _id').getTemp(),
			],
			// 用于存储搜索关键字，用于模糊搜索文章标题和内容。
			query: '',
			// 用于存储查询条件。其中包含了文章状态、分类、关键字等多个查询条件。
			where: '',
			// 用于指定查询结果的排序方式，可以指定一个或多个字段进行排序，也可以指定排序方式（升序或降序）。
			orderby: dbOrderBy,
			// 用于存储当前排序字段名的变量。
			orderByFieldName: "",
			// 存储当前选中的文章的索引值。
			selectedIndexs: [],
			options: {
				pageSize,
				pageCurrent,
				filterData: {
					"article_status_localdata": [
						{
							"value": 0,
							"text": "草稿箱"
						},
						{
							"value": 1,
							"text": "已发布"
						}
					],
					"comment_status_localdata": [
						{
							"value": 0,
							"text": "关闭"
						},
						{
							"value": 1,
							"text": "开放"
						}
					],
          categories: []
				},
				...enumConverter
			},
			imageStyles: {
				width: 64,
				height: 64
			},
			exportExcel: {
				"filename": "dailycheck.xls",
				"type": "xls",
				"fields": {
                    "运动日期": "date",
					"用户昵称": "user_id",
                    "运动类型": "sport_type",
                    "运动时长": "sport_duriation",
                    "最高心率": "highest_hb",
                    "感受": "feeling"
				}
			},
      tableList: [],
			exportExcelData: []
		}
	},
	onLoad() {
		this._filter = {}
	},
	onReady() {
		this.$refs.udb.loadData()
    // this.loadCategories()
	},
	methods: {
    async loadCategories () {
      const {result} = await db.collection(categoryDBName).get()

      if (result) {
        this.options.filterData.categories = result.data.map(item => {
          return {
            text: item.name,
            value: item._id
          }
        })
      }
    },
		/**
     * 封面预览
     * @param imageList
     */
		previewCover(imageList) {
			uni.previewImage({
				current: imageList[0],
				urls: imageList
			})
		},
		// 查询数据加载完成
		async onqueryload(data) {
			let listData = []

			for (const item of data) {
				if (item.thumbnail && typeof item.thumbnail === 'string') {
					item.thumbnail = [item.thumbnail]
				}

				const parseImages = await parseImageUrl(item.thumbnail)
				item.thumbnail = parseImages.map(image => image.src)

				listData.push(item)
			}
            
            this.tableList = listData
			this.exportExcelData = listData
            for (var i = 0; i < listData.length; i++)
            {
                const parseNickname = await JSON.parse(JSON.stringify(listData[i]["user_id"]));  
                this.exportExcelData[i]["user_id"] = parseNickname[0].nickname;
            }
		},
		// 获取查询条件
		getWhere() {
			const query = this.query.trim()
			if (!query) {
				return ''
			}
			const queryRe = new RegExp(query, 'i')
			return dbSearchFields.map(user_id => queryRe + '.test(' + user_id + ')').join(' || ')
		},
		// 查询
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
		// 跳转页面
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
		// 获取选中项
		selectedItems() {
			var dataList = this.$refs.udb.dataList
			return this.selectedIndexs.map(i => dataList[i]._id)
		},
		// 批量删除
		delTable() {
			this.$refs.udb.remove(this.selectedItems(), {
				success: (res) => {
					this.$refs.table.clearSelection()
				}
			})
		},
		// 选中项改变
		selectionChange(e) {
			this.selectedIndexs = e.detail.index
		},
		// 确认删除
		confirmDelete(id) {
			this.$refs.udb.remove(id, {
				success: (res) => {
					this.$refs.table.clearSelection()
				}
			})
		},
		// 排序改变
		sortChange(e, name) {
			// 设置排序字段
			this.orderByFieldName = name;
			// 判断是否需要排序
			if (e.order) {
				// 设置排序方式
				this.orderby = name + ' ' + orderByMapping[e.order]
			} else {
				this.orderby = ''
			}
			// 清空选中项
			this.$refs.table.clearSelection()
			// 加载数据
			this.$nextTick(() => {
				this.$refs.udb.loadData()
			})

		},
		// 筛选改变
		filterChange(e, name) {
			// 将筛选条件添加到筛选对象中
			this._filter[name] = {
				type: e.filterType,
				value: e.filter
			}
      // range 类型的筛选，如果输入的值不是数字，则不进行筛选
      const {type, value} = this._filter[name]
      if (type === 'range') {
        for (const val of value) {
          if (typeof val === "number" && isNaN(val)) return
        }
      }

			// 将筛选对象转换为where条件
			let newWhere = filterToWhere(this._filter, db.command)
			// 判断是否有where条件
			if (Object.keys(newWhere).length) {
				// 如果有where条件，则将where条件赋值给this.where
				this.where = newWhere
			} else {
				// 如果没有where条件，则将this.where赋值为空字符串
				this.where = ''
			}
			// 加载数据
			this.$nextTick(() => {
				this.$refs.udb.loadData()
			})
		},
	}

}
</script>

<style lang="scss" scoped>
.preview-tip {
  display: flex;
  align-items: center;
  .mp-preview {
    position: relative;
    color: #2979ff;
    cursor: pointer;
    &:hover {
      .qr {
        display: block;
      }
    }
    .qr {
      display: none;
      position: absolute;
      left: 50%;
      margin-left: -70px;
      width: 140px;
      height: 140px;
      padding: 10px;
      background: #fff;
      z-index: 1;
      top: 34px;
      border-radius: 8px;
      border: #e1e1e1 solid 1px;
      box-shadow: rgba(0,0,0,.1) 0 5px 8px;
      box-sizing: border-box;
      .img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
