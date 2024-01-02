<template>
	<view class="uni-container">
		<view class="title">新增问卷</view>
		<uni-forms ref="form" :model="formData" validateTrigger="bind">
			<uni-forms-item name="title" label-width="80px" label="名称" required>
				<uni-easyinput placeholder="问卷或投票名称" v-model="formData.title" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="description" label="简介" label-width="80px">
				<uni-easyinput placeholder="简介" v-model="formData.description" trim="both"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="sort" label="排序" label-width="80px">
				<uni-easyinput placeholder="显示顺序" type="number" v-model="formData.sort"></uni-easyinput>
			</uni-forms-item>
			<!-- <uni-forms-item name="count" label="子项总数">
				<uni-easyinput placeholder="此问题下投票项或问卷题目统计" type="number" v-model="formData.count"></uni-easyinput>
			</uni-forms-item> -->
			<uni-forms-item name="status" label="状态" label-width="80px">
				<uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item name="period_of_validity" label="有效期" label-width="80px">
				<uni-data-checkbox v-model="formData.period_of_validity"
					:localdata="formOptions.period_of_validity_localdata"></uni-data-checkbox>
			</uni-forms-item>
			
			<!-- 当有效期为时间段时，显示开始时间和结束时间 -->
			<template v-if="formData.period_of_validity == 1">
				<uni-forms-item name="start_date" label="开始时间" label-width="80px">
					<uni-datetime-picker return-type="timestamp" v-model="formData.start_date"></uni-datetime-picker>
				</uni-forms-item>
				<uni-forms-item name="end_date" label="结束时间" label-width="80px">
					<uni-datetime-picker return-type="timestamp" v-model="formData.end_date"></uni-datetime-picker>
				</uni-forms-item>
			</template>
			
			<!-- <uni-forms-item name="create_date" label="创建时间">
				<uni-datetime-picker return-type="timestamp" v-model="formData.create_date"></uni-datetime-picker>
			</uni-forms-item> -->
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
	// 导入验证器
	import {
		validator
	} from '../../js_sdk/validator/uni-vote.js';

	// 初始化数据库
	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-vote';

	// 获取验证器
	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				result[key] = validator[key]
			}
		}
		return result
	}

	// 导出组件
	export default {
		data() {
			let formData = {
				"title": "",
				"description": "",
				"sort": null,
				// "count": 0,
				"status": 1,
				"period_of_validity": 0,
				"start_date": null,
				"end_date": null,
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
						},
						{
							"value": 2,
							"text": "已完成"
						}
					],
					"period_of_validity_localdata": [{
							"value": 0,
							"text": "长期"
						},
						{
							"value": 1,
							"text": "时间段"
						}
					]
				},
				rules: {
					...getValidator(Object.keys(formData))
				}
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		methods: {

			/**
			 * 验证表单并提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})
				
				if(this.formData.period_of_validity == 1){
					if(!this.formData.start_date || !this.formData.end_date){
						uni.showToast({
							title: '请选择开始或结束时间',
							icon:'none'
						});
						return false
					}
					if(this.formData.start_date > this.formData.end_date){
						uni.showToast({
							title: '开始时间不能大于结束时间',
							icon:'none'
						});
						return false
					}
				}
				
				
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