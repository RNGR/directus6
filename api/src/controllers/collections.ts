import { Router } from 'express';
import Busboy from 'busboy';
import asyncHandler from '../utils/async-handler';
import { CollectionsService, MetaService, XliffService } from '../services';
import { ForbiddenException, InvalidPayloadException } from '../exceptions';
import { respond } from '../middleware/respond';

const router = Router();

router.post(
	'/',
	asyncHandler(async (req, res, next) => {
		const collectionsService = new CollectionsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const collectionKey = await collectionsService.create(req.body);
		const record = await collectionsService.readByKey(collectionKey);

		res.locals.payload = { data: record || null };
		return next();
	}),
	respond
);

router.get(
	'/',
	asyncHandler(async (req, res, next) => {
		const collectionsService = new CollectionsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		const metaService = new MetaService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const collections = await collectionsService.readByQuery();
		const meta = await metaService.getMetaForQuery('directus_collections', {});

		res.locals.payload = { data: collections || null, meta };
		return next();
	}),
	respond
);

router.get(
	'/:collection',
	asyncHandler(async (req, res, next) => {
		const collectionsService = new CollectionsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		const collectionKey = req.params.collection.includes(',')
			? req.params.collection.split(',')
			: req.params.collection;

		const collection = await collectionsService.readByKey(collectionKey as any);
		res.locals.payload = { data: collection || null };

		return next();
	}),
	respond
);

router.patch(
	'/:collection',
	asyncHandler(async (req, res, next) => {
		const collectionsService = new CollectionsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		const collectionKey = req.params.collection.includes(',')
			? req.params.collection.split(',')
			: req.params.collection;
		await collectionsService.update(req.body, collectionKey as any);

		try {
			const collection = await collectionsService.readByKey(collectionKey as any);
			res.locals.payload = { data: collection || null };
		} catch (error) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

router.post(
	'/:collection',
	asyncHandler(async (req, res, next) => {
		if (req.is('multipart/form-data') === false) return next();
		let content = '';
		/* req
			.on('data', (data) => content += data)
			.on('end', (...args: any[]) => {
			const format = req.query.format as string;
			// console.log(data);
		});*/
		const busboy = new Busboy({ headers: req.headers });
		let fileCount = 0;
		const format = req.query.format as string;
		const collectionKey = req.params.collection;
		busboy.on('file', async (fieldname, fileStream, filename, encoding, mimetype) => {
			fileCount++;
			if (['xliff', 'xliff2'].includes(format)) {
				if (fileCount > 1) {
					busboy.emit('error', new InvalidPayloadException(`Only one import file supported for XLIFF format.`));
				}
				let content = '';
				fileStream
					.on('data', (d) => (content += d))
					.on('end', async () => {
						const xliffService = new XliffService({
							accountability: req.accountability,
							schema: req.schema,
							language: req.query.language as string,
							format,
						});
						try {
							await xliffService.fromXliff(collectionKey, content, req.query.field as string | undefined);
						} catch (error) {
							busboy.emit('error', error);
						}
					});
			}
		});
		busboy.on('error', (error: Error) => {
			next(error);
		});

		busboy.on('finish', () => {
			next();
		});
		req.pipe(busboy);
	}),
	respond
);

router.delete(
	'/:collection',
	asyncHandler(async (req, res, next) => {
		const collectionsService = new CollectionsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const collectionKey = req.params.collection.includes(',')
			? req.params.collection.split(',')
			: req.params.collection;

		await collectionsService.delete(collectionKey as any);

		return next();
	}),
	respond
);

export default router;
