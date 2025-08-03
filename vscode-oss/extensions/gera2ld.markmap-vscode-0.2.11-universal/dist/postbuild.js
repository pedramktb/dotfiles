'use strict';

var node_fs = require('node:fs');
var promises = require('node:fs/promises');
var markmapCommon = require('markmap-common');
var markmapLib = require('markmap-lib');
var markmapRender = require('markmap-render');
var node_path = require('node:path');
var promises$1 = require('node:stream/promises');

const TOOLBAR_VERSION = "0.18.12";
const TOOLBAR_CSS = `markmap-toolbar@${TOOLBAR_VERSION}/dist/style.css`;
const TOOLBAR_JS = `markmap-toolbar@${TOOLBAR_VERSION}/dist/index.js`;
const APP_CSS = 'assets/style.css';
const APP_JS = 'dist/app.js';
const ASSETS_PREFIX = 'dist/web_assets/';
const toolbarAssets = {
  styles: [markmapCommon.buildCSSItem(TOOLBAR_CSS)],
  scripts: [markmapCommon.buildJSItem(TOOLBAR_JS)]
};
({
  styles: [markmapCommon.buildCSSItem(APP_CSS)],
  scripts: [markmapCommon.buildJSItem(APP_JS)]
});
function localProvider(path) {
  return `${ASSETS_PREFIX}${path}`;
}
const transformerExport = new markmapLib.Transformer();
transformerExport.urlBuilder.provider;
transformerExport.urlBuilder.getFastestProvider().then(provider => {
});

const providerName = 'local-hook';
async function fetchAssets(assetsDir) {
  const transformer = new markmapLib.Transformer();
  transformer.urlBuilder.providers[providerName] = localProvider;
  transformer.urlBuilder.provider = providerName;
  const assets = transformer.getAssets();
  delete transformer.urlBuilder.providers[providerName];
  const pluginPaths = markmapCommon.extractAssets(assets).filter(url => url.startsWith(ASSETS_PREFIX)).map(url => url.slice(ASSETS_PREFIX.length));
  const resources = transformer.plugins.flatMap(plugin => {
    var _plugin$config;
    return ((_plugin$config = plugin.config) === null || _plugin$config === void 0 ? void 0 : _plugin$config.resources) || [];
  });
  const paths = [...markmapRender.baseJsPaths, ...pluginPaths, ...resources, ...markmapCommon.extractAssets(toolbarAssets)];
  const fastest = await transformer.urlBuilder.getFastestProvider();
  await Promise.all(paths.map(path => downloadAsset(node_path.resolve(assetsDir, path), transformer.urlBuilder.getFullUrl(path, fastest))));
}
async function downloadAsset(fullPath, url) {
  console.log(`${url} -> ${fullPath}`);
  try {
    const result = await promises.stat(fullPath);
    // Skip existing files
    if (result.isFile()) return;
  } catch {
    // ignore
  }
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Failed to download: ${url}`);
  await promises.mkdir(node_path.dirname(fullPath), {
    recursive: true
  });
  await promises$1.pipeline(res.body, node_fs.createWriteStream(fullPath));
}
fetchAssets(ASSETS_PREFIX).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
