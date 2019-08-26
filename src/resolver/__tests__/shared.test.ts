import { getFolderEntryPointFromPackageJSON } from '../shared';

describe('shared functions', () => {
  describe('getFolderEntryPointFromPackageJSON', () => {
    it('Should return brwoser field', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: { browser: 'foo.js' }, isBrowserBuild: true });
      expect(res).toEqual('foo.js');
    });

    it('Should module despite having brwoser', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: { browser: 'foo.js', module: 'mod.js' } });
      expect(res).toEqual('mod.js');
    });

    it('Should return module', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: { module: 'mod.js' } });
      expect(res).toEqual('mod.js');
    });

    it('Should return ts:main', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: { 'ts:main': 'mod.ts' } });
      expect(res).toEqual('mod.ts');
    });

    it('Should return main', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: { main: 'oi.js' } });
      expect(res).toEqual('oi.js');
    });

    it('Should return index without anything', () => {
      const res = getFolderEntryPointFromPackageJSON({ json: {} });
      expect(res).toEqual('index.js');
    });
  });
});
