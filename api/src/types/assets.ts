export type Transformation = {
	key?: string;
	width?: number; // width
	height?: number; // height
	fit?: 'cover' | 'contain' | 'inside' | 'outside'; // fit
	withoutEnlargement?: boolean; // Without Enlargement
	format?: '' | 'jpeg' | 'png' | 'webp' | 'tiff'; // override destination format
};

// @NOTE Keys used in Transformation should match ASSET_GENERATION_QUERY_KEYS in constants.ts
