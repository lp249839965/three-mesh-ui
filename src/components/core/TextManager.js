
/*

Job: Takes glyphs (strings), positions, and text types, returns meshes to Text

Knows:
	- The Text component for which it creates Meshes
	- The parameters of the text mesh it must return

To learn more about the differences between Text types :
https://github.com/felixmariotto/three-mesh-ui/wiki/Choosing-a-Text-type

*/

import { Mesh } from 'three/src/objects/Mesh.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import MSDFGlyph from '../../content/MSDFGlyph.js';

export default function TextManager() {

	return {
		createText,
		getGlyphDimensions
	};

};

//

function getGlyphDimensions( options ) {

	// Constants common to all types of font

	const FONT = options.font;

	const FONT_SIZE = options.fontSize; 

	const GLYPH = options.glyph;

	let width, height, ascender, anchor;

	// Depending on the type of font, the way to compute a glyph dimensions vary

	switch ( options.textType ) {

		case 'MSDF' :

			const charOBJ = FONT.chars.find( charOBJ => charOBJ.char === GLYPH );

			width = charOBJ ? (charOBJ.width * FONT_SIZE) / FONT.common.lineHeight : FONT_SIZE / 3 ;

			if ( GLYPH === '\n' ) width = 0;

			height = charOBJ ? (charOBJ.height * FONT_SIZE) / FONT.common.lineHeight : 0 ;

			// world-space length between lowest point and the text cursor position
			anchor = charOBJ ? ((charOBJ.yoffset + charOBJ.height - FONT.common.base) * FONT_SIZE) / FONT.common.lineHeight : 0 ;

			return {
				width,
				height,
				anchor
			};

	};

};

//

function createText( options ) {

	switch ( this.getTextType() ) {

		case 'MSDF' :
			return buildMSDFText.call( this );

	};

};

// Creates a THREE.Plane geometry, with UVs carefully positioned to map a particular
// glyph on the MSDF texture. Then creates a shaderMaterial with the MSDF shaders,
// creates a THREE.Mesh, returns it.
// Called only when the Text is created with 'textType: "MSDF"' (the default)

function buildMSDFText() {

	const component = this;

	const translatedGeom = [];

	this.inlines.forEach( (inline, i)=> {

		translatedGeom[ i ] = MSDFGlyph( inline, this.getFontFamily() );

		translatedGeom[ i ].translate( inline.offsetX, inline.offsetY, 0 );

	});

	const mergedGeom = BufferGeometryUtils.mergeBufferGeometries( translatedGeom );

	const mesh = new Mesh( mergedGeom, this.getFontMaterial() );

	mesh.renderOrder = Infinity;

	// This is for hiddenOverflow to work
	mesh.onBeforeRender = function( renderer, scene, camera, geometry, material, group ) {

		if ( component.updateClippingPlanes ) {

			component.updateClippingPlanes();

		};

	};

	return mesh

};
