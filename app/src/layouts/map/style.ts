import { AnyLayer, Expression } from 'maplibre-gl';

const baseColor = '#09f';
const selectColor = '#FFA500';
const fill: Expression = ['case', ['boolean', ['feature-state', 'selected'], false], selectColor, baseColor];
const outline: Expression = [
	'case',
	['boolean', ['feature-state', 'selected'], false],
	selectColor,
	['boolean', ['feature-state', 'hovered'], false],
	selectColor,
	baseColor,
];

export const layers: AnyLayer[] = [
	{
		id: '__directus_polygons',
		type: 'fill',
		source: '__directus',
		filter: ['all', ['!has', 'point_count'], ['==', '$type', 'Polygon']],
		paint: {
			'fill-color': fill,
			'fill-opacity': 0.15,
		},
	},
	{
		id: '__directus_polygons_outline',
		type: 'line',
		source: '__directus',
		filter: ['all', ['!has', 'point_count'], ['==', '$type', 'Polygon']],
		paint: {
			'line-color': outline,
			'line-width': 2,
		},
	},
	{
		id: '__directus_lines',
		type: 'line',
		source: '__directus',
		filter: ['all', ['!has', 'point_count'], ['==', '$type', 'LineString']],
		paint: {
			'line-color': outline,
			'line-width': 2,
		},
	},
	{
		id: '__directus_points',
		type: 'circle',
		source: '__directus',
		filter: ['all', ['!has', 'point_count'], ['==', '$type', 'Point']],
		layout: {},
		paint: {
			'circle-radius': 5,
			'circle-color': fill,
			'circle-stroke-color': outline,
			'circle-stroke-width': 3,
		},
	},
	{
		id: '__directus_clusters',
		type: 'circle',
		source: '__directus',
		filter: ['has', 'point_count'],
		paint: {
			'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
			'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
		},
	},
	{
		id: '__directus_cluster_count',
		type: 'symbol',
		source: '__directus',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			// 'text-font': ['Open Sans Semibold'],
			'text-font': ['Noto Sans Regular'],
			'text-size': ['step', ['get', 'point_count'], 15, 100, 17, 750, 19],
		},
	},
];
