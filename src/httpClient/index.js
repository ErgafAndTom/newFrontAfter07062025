/**
 * Lightweight HTTP client — drop-in replacement for axios.
 * Uses native fetch + XMLHttpRequest (for upload progress).
 * ~4KB vs axios ~50KB.
 */

class HttpError extends Error {
  constructor(message, response, request, code) {
    super(message);
    this.name = 'HttpError';
    this.response = response;   // { data, status, headers }
    this.request = request;
    this.code = code || null;
  }
}

function parseHeaders(raw) {
  const obj = {};
  if (!raw) return obj;
  // Headers from fetch Response
  if (typeof raw.forEach === 'function') {
    raw.forEach((value, key) => { obj[key] = value; });
    return obj;
  }
  // Headers from XMLHttpRequest string
  if (typeof raw === 'string') {
    raw.split('\r\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) obj[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
    });
  }
  return obj;
}

function mergeConfig(defaults, override) {
  const merged = { ...defaults, ...override };
  merged.headers = { ...defaults.headers, ...override.headers };
  return merged;
}

function buildURL(base, url) {
  if (!base || /^https?:\/\//i.test(url)) return url;
  return base.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
}

/**
 * Core request via fetch (no upload progress needed).
 */
async function fetchRequest(url, config) {
  const opts = {
    method: config.method,
    headers: { ...config.headers },
    signal: config.signal || null,
  };

  if (config.body !== undefined) {
    if (config.body instanceof FormData) {
      // Let browser set Content-Type with boundary
      delete opts.headers['Content-Type'];
      opts.body = config.body;
    } else {
      opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
      opts.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
    }
  }

  let response;
  try {
    const timeoutId = config.timeout
      ? setTimeout(() => config._abortCtrl?.abort(), config.timeout)
      : null;

    response = await fetch(url, opts);

    if (timeoutId) clearTimeout(timeoutId);
  } catch (err) {
    if (err.name === 'AbortError' && config._timedOut) {
      throw new HttpError(`timeout of ${config.timeout}ms exceeded`, null, opts, 'ECONNABORTED');
    }
    throw new HttpError(err.message, null, opts, err.code || null);
  }

  const headers = parseHeaders(response.headers);
  let data;
  const rt = config.responseType;
  if (rt === 'blob') {
    data = await response.blob();
  } else if (rt === 'arraybuffer') {
    data = await response.arrayBuffer();
  } else {
    const text = await response.text();
    try { data = JSON.parse(text); } catch { data = text; }
  }

  const result = { data, status: response.status, headers, config };

  if (!response.ok) {
    throw new HttpError(
      `Request failed with status code ${response.status}`,
      result,
      opts,
      null,
    );
  }

  return result;
}

/**
 * Request via XMLHttpRequest (when onUploadProgress is needed).
 */
function xhrRequest(url, config) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(config.method, url);

    // Set headers
    const headers = { ...config.headers };
    if (config.body instanceof FormData) {
      delete headers['Content-Type']; // browser sets it
    }
    Object.entries(headers).forEach(([k, v]) => {
      if (v != null) xhr.setRequestHeader(k, v);
    });

    // Response type
    if (config.responseType === 'blob') xhr.responseType = 'blob';
    else if (config.responseType === 'arraybuffer') xhr.responseType = 'arraybuffer';

    // Timeout
    if (config.timeout) xhr.timeout = config.timeout;

    // Upload progress
    if (config.onUploadProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', config.onUploadProgress);
    }

    // Abort signal
    if (config.signal) {
      if (config.signal.aborted) {
        xhr.abort();
        return reject(new HttpError('canceled', null, config, null));
      }
      config.signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.ontimeout = () => {
      reject(new HttpError(`timeout of ${config.timeout}ms exceeded`, null, config, 'ECONNABORTED'));
    };

    xhr.onerror = () => {
      reject(new HttpError('Network Error', null, config, null));
    };

    xhr.onabort = () => {
      const err = new HttpError('canceled', null, config, null);
      err.name = 'AbortError';
      reject(err);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4 || xhr.status === 0) return;

      const respHeaders = parseHeaders(xhr.getAllResponseHeaders());
      let data;

      if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
        data = xhr.response;
      } else {
        data = xhr.responseText;
        try { data = JSON.parse(data); } catch { /* keep text */ }
      }

      const result = { data, status: xhr.status, headers: respHeaders, config };

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(result);
      } else {
        reject(new HttpError(
          `Request failed with status code ${xhr.status}`,
          result,
          config,
          null,
        ));
      }
    };

    const body = config.body instanceof FormData
      ? config.body
      : config.body !== undefined
        ? (typeof config.body === 'string' ? config.body : JSON.stringify(config.body))
        : null;

    if (body && !(config.body instanceof FormData)) {
      xhr.setRequestHeader('Content-Type', headers['Content-Type'] || 'application/json');
    }

    xhr.send(body);
  });
}

/**
 * Dispatch — pick XHR or fetch based on config.
 */
async function dispatchRequest(url, config) {
  if (config.onUploadProgress) {
    return xhrRequest(url, config);
  }

  // For fetch timeout support: wrap with AbortController
  if (config.timeout && !config.signal) {
    const ctrl = new AbortController();
    config._abortCtrl = ctrl;
    config.signal = ctrl.signal;
    const timer = setTimeout(() => {
      config._timedOut = true;
      ctrl.abort();
    }, config.timeout);
    try {
      const res = await fetchRequest(url, config);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError' || (config._timedOut && !err.code)) {
        throw new HttpError(`timeout of ${config.timeout}ms exceeded`, null, config, 'ECONNABORTED');
      }
      throw err;
    }
  }

  return fetchRequest(url, config);
}

/**
 * Create an http client instance (axios.create() equivalent).
 */
function createInstance(instanceConfig = {}) {
  const defaults = {
    baseURL: instanceConfig.baseURL || '',
    headers: { ...instanceConfig.headers },
    timeout: instanceConfig.timeout || 0,
  };

  const requestInterceptors = [];

  async function request(configOrUrl, cfgOverride) {
    let cfg;
    if (typeof configOrUrl === 'string') {
      cfg = { ...(cfgOverride || {}), url: configOrUrl };
    } else {
      cfg = { ...configOrUrl };
    }

    // Merge with defaults
    cfg = mergeConfig(defaults, cfg);

    const url = buildURL(cfg.baseURL, cfg.url || '');
    cfg.method = (cfg.method || 'GET').toUpperCase();

    // Run request interceptors
    for (const { fulfilled, rejected } of requestInterceptors) {
      try {
        cfg = await fulfilled(cfg);
      } catch (err) {
        if (rejected) return rejected(err);
        throw err;
      }
    }

    return dispatchRequest(url, cfg);
  }

  function methodNoData(method) {
    return (url, config = {}) => request({ ...config, url, method });
  }

  function methodWithData(method) {
    return (url, data, config = {}) => request({ ...config, url, method, body: data });
  }

  const instance = {
    request,
    get: methodNoData('GET'),
    delete: methodNoData('DELETE'),
    head: methodNoData('HEAD'),
    post: methodWithData('POST'),
    put: methodWithData('PUT'),
    patch: methodWithData('PATCH'),

    defaults,

    interceptors: {
      request: {
        use(fulfilled, rejected) {
          const id = requestInterceptors.length;
          requestInterceptors.push({ fulfilled, rejected });
          return id;
        },
      },
    },

    create(cfg) {
      return createInstance({ ...defaults, ...cfg });
    },
  };

  return instance;
}

const httpClient = createInstance();
httpClient.create = createInstance;

export default httpClient;
