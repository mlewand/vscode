/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import * as sinon from 'sinon';
import { Selection } from 'vs/editor/common/core/selection';
import { createTestCodeEditor, TestCodeEditor } from 'vs/editor/test/browser/testCodeEditor';
import { OpenLinkAction, LinkDetector } from  'vs/editor/contrib/links/links';
import { TextModel } from 'vs/editor/common/model/textModel';

suite('Editor Contrib - Links', () => {
	suite('OpenLinkAction', () => {
		const editor = <TestCodeEditor>createTestCodeEditor( TextModel.createFromString('foobar') );
		const linkDetector = editor.registerAndInstantiateContribution<LinkDetector>(LinkDetector);
		const openLinkStub = sinon.stub(linkDetector, 'openLinkOccurrence');

		suiteTeardown(() => {
			openLinkStub.restore();
			editor.getModel().dispose();
			editor.dispose();
		});

		test('should open a single link', function () {
			const openLinkAction = new OpenLinkAction();
			editor.getModel().setValue('sample link: https://github.com/Microsoft/vscode');

			editor.setSelection(new Selection(0, 36, 0, 36));
			openLinkAction.run(null, editor);

			assert.equal(openLinkStub.callCount, 1, 'LinkDetector.openLinkOccurrence call count');
			assert.deepEqual(openLinkStub.args[0], ['https://github.com/Microsoft/vscode']);
		});

		test('should open multiple links', function () {
			const EOL = editor.getModel().getEOL();
			const openLinkAction = new OpenLinkAction();

			editor.getModel().setValue(['* https://github.com/Microsoft/vscode', '* https://github.com/microsoft/vscode/issues'].join(EOL));

			editor.setSelections([new Selection(0, 36, 0, 36), new Selection(1, 36, 1, 36)]);
			openLinkAction.run(null, editor);

			assert.equal(openLinkStub.callCount, 2, 'LinkDetector.openLinkOccurrence call count');
			assert.deepEqual(openLinkStub.args[0], ['https://github.com/Microsoft/vscode']);
			assert.deepEqual(openLinkStub.args[1], ['https://github.com/Microsoft/vscode/issues']);
		});

		test('should not open on a regular text', function () {
			const openLinkAction = new OpenLinkAction();
			editor.getModel().setValue('foo  bar baz');

			editor.setSelection(new Selection(0, 5, 0, 5));
			openLinkAction.run(null, editor);

			assert.equal(openLinkStub.callCount, 0, 'LinkDetector.openLinkOccurrence call count');
		});
	});
});
