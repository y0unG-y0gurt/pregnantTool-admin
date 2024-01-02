<template>
	<view class="uni-container">
		<view class="title">修改问卷的问题</view>
		<uni-forms ref="form" :model="formData" validateTrigger="bind">
			<uni-forms-item name="type" label="选项类型" required label-width="80px">
				<uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<uni-forms-item name="title" label="问题" required label-width="80px">
				<uni-easyinput placeholder="问卷或投票项问题、需求描述" v-model="formData.title" trim="both"></uni-easyinput>
			</uni-forms-item>

			<uni-forms-item name="status" label="状态" label-width="80px">
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
	} from '../../js_sdk/validator/uni-vote-questions.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'uni-vote-questions';

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
				"vote_id": "",
				"type": "radio",
				"title": "",
				"status": 1,
				"create_date": null
			}
			return {
				formData,
				formOptions: {
					"type_localdata": [{
							"value": "radio",
							"text": "单选"
						},
						{
							"value": "checkbox",
							"text": "多选"
						}
					],
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
				vote_id: '',
				modifiedItems: []
			}
		},
		onLoad(e) {
			this.vote_id = e.vote_id
			const item = JSON.parse(decodeURIComponent(e.item));
			
			this.formData = item
			if (item._id) {
				this.formDataId = item._id
				// this.getDetail(item._id)
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
				return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
					uni.showToast({
						title: '修改成功'
					})
					this.getOpenerEventChannel().emit('refreshData')
					setTimeout(() => uni.navigateBack(), 800)

				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				})
			},

			/**
			 * 获取表单数据
			 * @param {Object} id
			 */
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).doc(id).field("vote_id,type,title,status,create_date").get().then((
					res) => {
					const data = res.result.data[0]
					if (data) {
						this.formData = data

					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
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
	.options-box {
		flex-direction: row;
		display: flex;
		align-items: center;
		margin: 20px;
		margin-top: 0;
	}

	.option {
		background-color: #f8f8f8;
		border-radius: 10px;
		padding: 10px;
		margin: 10px;
	}

	.tip {
		width: 15px;
		height: 15px;
		background-color: #eff1f7;
	}

	.radio-tip {
		border-radius: 100px;
	}

	.add-options {
		flex-direction: row;
		display: flex;
		align-items: center;
		margin-right: 30px;
		cursor: pointer;
	}
</style>