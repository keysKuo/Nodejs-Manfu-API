/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.language = 'vi';
	config.extraPlugins = "youtube";
	config.youtube_width = '640';
	config.youtube_height = '480';
	config.youtube_responsive = true;
	config.allowedContent = true;
};
