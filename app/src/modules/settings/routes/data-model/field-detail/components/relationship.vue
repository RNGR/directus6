<template>
	<relationship-m2o
		v-if="type === 'm2o' || type === 'file'"
		:collection="collection"
		:is-existing="isExisting"
		:type="type"
	/>
	<relationship-o2m v-else-if="type === 'o2m'" :collection="collection" :is-existing="isExisting" :type="type" />
	<relationship-m2m
		v-else-if="type === 'm2m' || type === 'files'"
		:collection="collection"
		:is-existing="isExisting"
		:type="type"
	/>
	<relationship-m2a v-else-if="type === 'm2a'" :collection="collection" :is-existing="isExisting" :type="type" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import RelationshipM2o from './relationship-m2o.vue';
import RelationshipO2m from './relationship-o2m.vue';
import RelationshipM2m from './relationship-m2m.vue';
import RelationshipM2a from './relationship-m2a.vue';

export default defineComponent({
	components: {
		RelationshipM2o,
		RelationshipO2m,
		RelationshipM2m,
		RelationshipM2a,
	},
	props: {
		type: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
		isExisting: {
			type: Boolean,
			default: false,
		},
	},
});
</script>
