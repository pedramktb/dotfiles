(function (markmapToolbar, markmapView) {
  'use strict';

  Math.random().toString(36).slice(2, 8);
  function wrapFunction(fn, wrapper) {
    return (...args) => wrapper(fn, ...args);
  }
  function defer() {
    const obj = {};
    obj.promise = new Promise((resolve, reject) => {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    return obj;
  }

  const vscode = acquireVsCodeApi();
  let firstTime = true;
  let root;
  let style;
  const activeNodeOptions = {};
  let loading;
  const handlers = {
    async setData(data) {
      var _data$jsonOptions;
      loading = defer();
      await mm.setData(root = data.root, {
        ...markmapView.defaultOptions,
        ...markmapView.deriveOptions(data.jsonOptions)
      });
      activeNodeOptions.placement = (_data$jsonOptions = data.jsonOptions) === null || _data$jsonOptions === void 0 || (_data$jsonOptions = _data$jsonOptions.activeNode) === null || _data$jsonOptions === void 0 ? void 0 : _data$jsonOptions.placement;
      if (firstTime) {
        await mm.fit();
        firstTime = false;
      }
      loading.resolve();
    },
    async setCursor(options) {
      var _loading;
      await ((_loading = loading) === null || _loading === void 0 ? void 0 : _loading.promise);
      const result = root && findActiveNode(options);
      if (!result) return;
      const {
        node,
        needRerender
      } = result;
      if (needRerender) await mm.renderData();
      highlightNode(node);
    },
    setCSS(data) {
      if (!style) {
        style = document.createElement('style');
        document.head.append(style);
      }
      style.textContent = data || '';
    },
    checkTheme,
    downloadSvg(path) {
      const content = new XMLSerializer().serializeToString(mm.svg.node());
      vscode.postMessage({
        type: 'downloadSvg',
        data: {
          content,
          path
        }
      });
    },
    toggleNode(recursive) {
      return;
    }
  };
  window.addEventListener('message', e => {
    const {
      type,
      data
    } = e.data;
    const handler = handlers[type];
    handler === null || handler === void 0 || handler(data);
  });
  document.addEventListener('click', e => {
    var _e$target;
    const el = (_e$target = e.target) === null || _e$target === void 0 ? void 0 : _e$target.closest('a');
    if (el) {
      const href = el.getAttribute('href');
      if (href.startsWith('#')) {
        const node = findHeading(href.slice(1));
        highlightNode(node);
      } else if (!href.includes('://')) {
        vscode.postMessage({
          type: 'openFile',
          data: href
        });
      }
    }
  });
  vscode.postMessage({
    type: 'refresh'
  });
  const toolbar = new markmapToolbar.Toolbar();
  toolbar.register({
    id: 'editAsText',
    title: 'Edit as text',
    content: createButton('Edit'),
    onClick: clickHandler('editAsText')
  });
  toolbar.register({
    id: 'export',
    title: 'Export',
    content: createButton('Export'),
    onClick: clickHandler('export')
  });
  toolbar.setItems(['zoomIn', 'zoomOut', 'fit', 'recurse', 'editAsText', 'export']);
  checkTheme();
  setTimeout(() => {
    initialize(mm);
    toolbar.attach(mm);
    document.body.append(toolbar.el);
  });
  function initialize(mm) {
    mm.renderData = wrapFunction(mm.renderData, async (fn, ...args) => {
      await fn.call(mm, ...args);
      mm.g.selectAll(function () {
        const nodes = Array.from(this.childNodes);
        return nodes.filter(el => el.tagName === 'g');
      }).on('dblclick.focus', (e, d) => {
        var _d$payload;
        const lines = (_d$payload = d.payload) === null || _d$payload === void 0 ? void 0 : _d$payload.lines;
        const line = +(lines === null || lines === void 0 ? void 0 : lines.split(',')[0]);
        if (!isNaN(line)) vscode.postMessage({
          type: 'setFocus',
          data: line
        });
      }, true);
    });
  }
  function checkTheme() {
    // https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content
    const isDark = ['vscode-dark', 'vscode-high-contrast'].some(cls => document.body.classList.contains(cls));
    document.documentElement.classList[isDark ? 'add' : 'remove']('markmap-dark');
  }
  function createButton(text) {
    const el = document.createElement('div');
    el.className = 'btn-text';
    el.textContent = text;
    return el;
  }
  function clickHandler(type) {
    return () => {
      vscode.postMessage({
        type
      });
    };
  }
  function findHeading(id) {
    function dfs(node) {
      var _node$children;
      if (!/^h\d$/.test(node.payload.tag)) return false;
      const normalizedId = node.content.trim().replace(/\W/g, '-').toLowerCase();
      if (normalizedId === id) {
        target = node;
        return true;
      }
      return (_node$children = node.children) === null || _node$children === void 0 ? void 0 : _node$children.some(dfs);
    }
    let target;
    dfs(root);
    return target;
  }
  function findActiveNode({
    line,
    autoExpand = true
  }) {
    function dfs(node, ancestors = []) {
      var _node$payload, _node$children2;
      const [start, end] = ((_node$payload = node.payload) === null || _node$payload === void 0 || (_node$payload = _node$payload.lines) === null || _node$payload === void 0 ? void 0 : _node$payload.split(',').map(s => +s)) || [];
      if (start >= 0 && start <= line && line < end) {
        best = node;
        bestAncestors = ancestors;
      }
      ancestors = [...ancestors, node];
      (_node$children2 = node.children) === null || _node$children2 === void 0 || _node$children2.forEach(child => {
        dfs(child, ancestors);
      });
    }
    let best;
    let bestAncestors = [];
    dfs(root);
    let needRerender = false;
    if (autoExpand) {
      bestAncestors.forEach(node => {
        var _node$payload2;
        if ((_node$payload2 = node.payload) !== null && _node$payload2 !== void 0 && _node$payload2.fold) {
          node.payload.fold = 0;
          needRerender = true;
        }
      });
    }
    return best && {
      node: best,
      needRerender
    };
  }
  async function highlightNode(node) {
    await mm.setHighlight(node);
    if (!node) return;
    await mm[activeNodeOptions.placement === 'center' ? 'centerNode' : 'ensureVisible'](node, {
      bottom: 80
    });
  }

})(markmap, markmap);
