import { RouteConfig } from 'vue-router';
import { replaceRoutes } from '@/router';
import { getModules } from './index';
import { useUserStore, usePermissionsStore } from '@/stores';
import api from '@/api';
import { batchPromises } from '@/utils/paginate';
import { getRootPath } from '@/utils/get-root-path';

const modules = getModules();
let loadedModules: any = [];

export async function loadModules() {
	const context = require.context('.', true, /^.*index\.ts$/);

	loadedModules = context
		.keys()
		.map((key) => context(key))
		.map((mod) => mod.default)
		.filter((m) => m);

	try {
		const customResponse = await api.get('/extensions/modules/');

		const data = customResponse.data.data;

		if (data && Array.isArray(data) && data.length > 0) {
			const loadedModules = await batchPromises(
				data,
				5,
				(customKey) => import(/* webpackIgnore: true */ getRootPath() + `/extensions/modules/${customKey}/index.js`)
			);

			loadedModules.forEach((result, i) => {
				if (result.status === 'rejected') {
					console.warn(`Couldn't load custom module "${data[i]}"`);
					console.warn(result.reason);
				} else {
					const module = result.value;
					module.default.routes = module.default.routes.map((route: RouteConfig) => {
						if (route.path) {
							route.path = `/${module.default.id}/${route.path}`;
						}

						return route;
					});
					loadedModules.push(module.default);
				}
			});
		}
	} catch {
		console.warn(`Couldn't load custom modules`);
	}
}

export async function register() {
	const userStore = useUserStore();
	const permissionsStore = usePermissionsStore();

	const registeredModules = loadedModules.filter((mod: any) => {
		if (!userStore.state.currentUser) return false;

		if (mod.preRegisterCheck) {
			return mod.preRegisterCheck(userStore.state.currentUser, permissionsStore.state.permissions);
		}

		return true;
	});

	const moduleRoutes = registeredModules
		.map((module: any) => module.routes)
		.filter((r: any) => r)
		.flat() as RouteConfig[];

	replaceRoutes((routes) => insertBeforeProjectWildcard(routes, moduleRoutes));

	modules.value = registeredModules;

	function insertBeforeProjectWildcard(currentRoutes: RouteConfig[], routesToBeAdded: RouteConfig[]) {
		// Find the index of the /* route, so we can insert the module routes right above that
		const wildcardIndex = currentRoutes.findIndex((route) => route.path === '/*');
		return [...currentRoutes.slice(0, wildcardIndex), ...routesToBeAdded, ...currentRoutes.slice(wildcardIndex)];
	}
}

export function unregister() {
	replaceRoutes((routes) => routes);
	modules.value = [];
}
