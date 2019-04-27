import { Context } from '../core/Context';
import { IDevServerProps } from '../dev-server/devServerProps';
import { IRawCompilerOptions } from '../interfaces/TypescriptInterfaces';
import { ILoggerProps } from '../logging/logging';
import { IWatcherExternalProps } from '../watcher/watcher';
import { IWebIndexConfig } from '../web-index/webIndex';
import { IStyleSheetProps } from './IStylesheetProps';
import { IHMRExternalProps } from './PrivateConfig';

export interface IPublicConfig {
  root?: string;
  target?: 'browser' | 'server' | 'electron' | 'universal';
  homeDir?: string;
  output?: string;
  modules?: Array<string>;
  logging?: ILoggerProps;
  watch?: boolean | IWatcherExternalProps;
  hmr?: boolean | IHMRExternalProps;
  stylesheet?: IStyleSheetProps;
  cache?:
    | boolean
    | {
        root?: string;
        enabled?: boolean;
      };
  tsConfig?: string | IRawCompilerOptions;
  entry?: string | Array<string>;
  allowSyntheticDefaultImports?: boolean;
  webIndex?: IWebIndexConfig | boolean;
  turboMode?:
    | {
        maxWorkers?: number;
        workerPortsRange?: { start: number; end: number };
        workerPorts?: Array<number>;
      }
    | boolean;
  sourceMap?:
    | {
        sourceRoot?: string;
        vendor?: boolean;
        project?: boolean;
        css?: boolean;
      }
    | boolean;
  plugins?: Array<(ctx: Context) => void>;
  alias?: { [key: string]: string };

  // read only
  defaultCollectionName?: string;

  production?: {};

  devServer?: IDevServerProps | boolean | undefined;
}
