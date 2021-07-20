import { Filter, LogicalOperatorFilter } from '@directus/shared/types';
import { clone } from 'lodash';

export default function filtersToQuery(filters: readonly (Filter | LogicalOperatorFilter)[]): {
	filter: Record<string, any>;
} {
	const filterList = generateQuery(filters);

	let filterQuery: Record<string, any> = {};

	if (filterList.length === 1) {
		filterQuery = filterList[0];
	} else if (filterList.length > 1) {
		filterQuery = { _and: filterList };
	}

	return { filter: filterQuery };
}

function generateQuery(filters: readonly (Filter | LogicalOperatorFilter)[]): Record<string, any>[] {
	const filterList: Record<string, any>[] = [];

	for (const filter of filters) {
		const loFilter = filter as LogicalOperatorFilter;

		if (!!loFilter.filters === true) {
			filterList.push({ [`_${loFilter.operator}`]: generateQuery(loFilter.filters) });
		} else {
			const { field, operator } = clone(filter) as any;
			let { value } = clone(filter) as any;

			if (['empty', 'nempty', 'null', 'nnull'].includes(operator)) {
				value = true;
			}

			if (!value) continue;

			if (field.includes('.')) {
				let filter: Record<string, any> = { [`_${operator}`]: value };
				const path = field.split('.');

				for (const field of path.reverse()) {
					filter = { [field]: filter };
				}

				filterList.push(filter);
			} else {
				filterList.push({ [field]: { [`_${operator}`]: value } });
			}
		}
	}

	return filterList;
}
