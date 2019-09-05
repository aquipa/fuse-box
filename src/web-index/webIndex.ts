import { join } from 'path';
import { IBundleWriteResponse, BundleType } from '../bundle/Bundle';
import { Context } from '../core/Context';
import { env } from '../env';
import { ensureAbsolutePath, fileExists, readFile, joinFuseBoxPath } from '../utils/utils';
import { htmlStrings } from './htmlStrings';

export interface IWebIndexConfig {
  enabled?: boolean;
  target?: string;
  template?: string;
  distFileName?: string;
  publicPath?: string;
  embedIndexedBundles?: boolean;
}
export interface IWebIndexInterface {
  isDisabled?: boolean;
  addBundleContent?: (content: string) => void;
  resolve?: (userPath: string) => string;
  generate?: (bundles: Array<IBundleWriteResponse>) => void;
}

export function replaceWebIndexStrings(str: string, keys: { [key: string]: any }) {
  return str.replace(/\$([a-z_-]+)/gi, (_var, name) => {
    return keys[name] !== undefined ? (typeof keys[name] === 'object' ? JSON.stringify(keys[name]) : keys[name]) : '';
  });
}

export function getEssentialWebIndexParams(config: IWebIndexConfig | boolean) {
  let templatePath = join(env.FUSE_MODULES, 'web-index-default-template/template.html');
  let publicPath = '/';
  let distFileName = 'index.html';
  if (typeof config === 'object') {
    if (config.template) {
      templatePath = ensureAbsolutePath(config.template, env.SCRIPT_PATH);
      if (!fileExists(templatePath)) {
        throw new Error(`Failed to find webindex ${templatePath}`);
      }
    }
    if (config.publicPath) {
      publicPath = config.publicPath;
    }

    if (config.distFileName) {
      distFileName = config.distFileName;
    }
  }
  return {
    distFileName,
    publicPath,
    templatePath,
  };
}

export function createWebIndex(ctx: Context): IWebIndexInterface {
  const config = ctx.config.webIndex;
  const isDisabled = config.enabled === false;
  const logger = ctx.log;
  if (isDisabled) {
    return { isDisabled };
  }
  const opts = getEssentialWebIndexParams(config);

  return {
    resolve: (userPath: string) => {
      return joinFuseBoxPath(opts.publicPath, userPath);
    },
    generate: async (bundles: Array<IBundleWriteResponse>) => {
      const scriptTags = [];
      const cssTags = [];
      let ftlEnabled = false;
      if (ctx.cache && ctx.config.cache.FTL && ctx.devServer && !ctx.config.production) {
        ftlEnabled = true;
      }
      const sorted = bundles.sort((a, b) => a.bundle.props.priority - b.bundle.props.priority);
      sorted.forEach(item => {
        if (item.bundle.props.webIndexed) {
          if (ftlEnabled && item.bundle.props.type == BundleType.PROJECT_ENTRY) {
            scriptTags.push(htmlStrings.scriptTag('/__ftl'));
          }
          if (item.bundle.props.type !== BundleType.CSS) {
            if (config.embedIndexedBundles && ctx.config.production) {
              scriptTags.push(htmlStrings.embedScriptTag(item.bundle.contents.content.toString()));
            } else {
              scriptTags.push(htmlStrings.scriptTag(joinFuseBoxPath(opts.publicPath, item.stat.relBrowserPath)));
            }
          } else {
            if (config.embedIndexedBundles && ctx.config.production) {
              cssTags.push(htmlStrings.cssTagScript(item.bundle.contents.content.toString()));
            } else {
              cssTags.push(htmlStrings.cssTag(joinFuseBoxPath(opts.publicPath, item.stat.relBrowserPath)));
            }
          }
        }
      });
      const scriptOpts: any = {
        bundles: scriptTags.join('\n'),
        css: cssTags.join('\n'),
      };
      let contents = replaceWebIndexStrings(readFile(opts.templatePath), scriptOpts);

      logger.info('webindex', 'writing to $name</yellow></bold></dim>', {
        name: opts.distFileName,
      });
      await ctx.writer.write(opts.distFileName, contents);
    },
  };
}