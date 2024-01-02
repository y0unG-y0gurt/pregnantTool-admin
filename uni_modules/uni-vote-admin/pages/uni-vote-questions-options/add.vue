<template>
	<view class="uni-container">
		<view class="title">新增问卷问题的选项</view>
		<uni-forms ref="form" :model="formData" validateTrigger="bind">
			<uni-forms-item name="title" label="问题选项" required label-width="100px">
				<uni-easyinput placeholder="请输入问卷或投票问题的选项" v-model="formData.title" trim="both"></uni-easyinput>
			</uni-forms-item>
			<!-- <uni-forms-item name="sort" label="排序">
				<uni-easyinput placeholder="显示顺序" type="number" v-model="formData.sort"></uni-easyinput>
			</uni-forms-item> -->
			<uni-forms-item name="status" label="状态" label-width="100px">
				<uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;">
					<button class="uni-button" style="width: 100px;">返回</button>
				</navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import {
		validator
	} from '../../js_sdk/validator/uni-vote-questions-options.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-vote-questions-options';

	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				result[key] = validator[key]
			}
		}
		return result
	}



	export default {
		data() {
			let formData = {
				// "vote_id": "",
				// "vote_question_id": "",
				"title": "",
				// "count": 0,
				"sort": null,
				"status": 1,
				// "create_date": null
			}
			return {
				formData,
				formOptions: {
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
				rules: {
					...getValidator(Object.keys(formData))
				},
				vote_id:'',
				vote_question_id:''
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		onLoad(e) {
			this.vote_id = e.vote_id
			this.vote_question_id = e.vote_question_id
			
		},
		methods: {

			/**
			 * 验证表单并提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})
				this.$refs.form.validate().then((res) => {
					return this.submitForm(res)
				}).catch(() => {}).finally(() => {
					uni.hideLoading()
				})
			},

			/**
			 * 提交表单
			 */
			submitForm(value) {
				value['vote_id'] = this.vote_id
				value['vote_question_id'] = this.vote_question_id
				
				// 使用 clientDB 提交数据
				return db.collection(dbCollectionName).add(value).then((res) => {
					uni.showToast({
						title: '新增成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 500)
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				})
			}
		}
	}
</script>
<style>
	.title {
		font-size: 16px;
		font-weight: 500;
		color: #333;
		margin: 10px;
	}
</style>