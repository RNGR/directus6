<template>
	<div class="v-list-group">
		<v-list-item
			class="activator"
			:active="active"
			:to="to"
			:exact="exact"
			:disabled="disabled"
			:dense="dense"
			clickable
			@click="onClick"
		>
			<slot name="activator" :active="groupActive" />

			<v-list-item-icon v-if="$slots.default" class="activator-icon" :class="{ active: groupActive }">
				<v-icon name="chevron_right" :disabled="disabled" @click.stop.prevent="toggle" />
			</v-list-item-icon>
		</v-list-item>

		<div v-if="groupActive" class="items">
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useGroupable } from '@/composables/groupable';

export default defineComponent({
	props: {
		multiple: {
			type: Boolean,
			default: true,
		},
		to: {
			type: String,
			default: '',
		},
		active: {
			type: Boolean,
			default: false,
		},
		exact: {
			type: Boolean,
			default: false,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		clickable: {
			type: Boolean,
			default: false,
		},
		scope: {
			type: String,
			default: undefined,
		},
		value: {
			type: [String, Number],
			default: undefined,
		},
		dense: {
			type: Boolean,
			default: false,
		},
		open: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['click'],
	setup(props, { emit }) {
		const { active, toggle } = useGroupable({
			group: props.scope,
			value: props.value,
		});

		const groupActive = computed(() => active.value || props.open);

		return { groupActive, toggle, onClick };

		function onClick(event: MouseEvent) {
			if (props.to) return null;
			if (props.clickable) return emit('click', event);

			event.stopPropagation();
			toggle();
		}
	},
});
</script>

<style lang="scss" scoped>
.v-list-group {
	margin-bottom: 4px;

	&:last-child {
		margin-bottom: 0;
	}

	.activator-icon {
		color: var(--foreground-subdued);
		transform: rotate(0deg);
		transition: transform var(--medium) var(--transition);

		&:hover {
			color: var(--foreground-normal);
		}

		&.active {
			transform: rotate(90deg);
		}
	}

	.items {
		padding-left: 16px;
	}
}
</style>
