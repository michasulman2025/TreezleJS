import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { Element, context } from './dom-fixture.mjs';

vm.runInNewContext(await readFile(new URL('../dist/treezle.iife.js', import.meta.url), 'utf8'), context);
const data = [
  { id: 'z', label: 'Zulu', isExpanded: true },
  { id: 'z2', parentId: 'z', label: 'Zulu child' },
  { id: 'z1', parentId: 'z', label: 'Alpha child' },
  { id: 'a', label: 'Alpha' },
];
const tree = new context.TreeView(new Element('div'), data);
const ids = () => Array.from(tree.getNodes(), n => n.id).join(',');
assert.equal(ids(), 'a,z,z1,z2');
tree.setOptions({ sortOrder: 'input' });
assert.equal(ids(), 'z,z2,z1,a');
tree.addNode('z', { id: 'new', label: 'New' });
tree.editNode({ id: 'z2', label: 'Updated child' });
tree.setOptions({ sortOrder: 'alphabetical' });
assert.equal(ids(), 'a,z,z1,new,z2');
assert.equal(tree.getNodes().find(n => n.id === 'z2').label, 'Updated child');
tree.setOptions({ sortOrder: 'input' });
assert.equal(ids(), 'z,z2,z1,new,a');
tree.setNodes(data);
assert.equal(ids(), 'z,z2,z1,a');
tree.setOptions({ sortOrder: 'alphabetical' });
assert.equal(ids(), 'a,z,z1,z2');
const second = new context.TreeView(new Element('div'), data, { sortOrder: 'input' });
assert.equal(Array.from(second.getNodes(), n => n.id).join(','), 'z,z2,z1,a');
assert.equal(ids(), 'a,z,z1,z2');
second.destroy();
tree.destroy();
console.log('PASS sort order: default, input order, option changes, additions and reset.');
