/**
 * Shared test utilities — mock DB, request builders, context factories.
 */

export function createMockDb(overrides = {}) {
  const calls = { select: [], insert: [], update: [], delete: [] };

  function chainable(result = []) {
    const obj = {
      _result: result,
      from: () => obj,
      where: () => obj,
      orderBy: () => obj,
      limit: () => obj,
      leftJoin: () => obj,
      selectDistinct: () => obj,
      select: () => obj,
      then: (resolve) => resolve(result),
      // Make it thenable so await works
      [Symbol.for('nodejs.util.promisify.custom')]: null,
    };
    // Drizzle uses .then() for awaitable queries
    obj[Symbol.toStringTag] = 'Promise';
    return obj;
  }

  const db = {
    _calls: calls,
    _results: overrides,

    select: (...args) => {
      calls.select.push(args);
      const result = overrides.selectResult ?? [];
      return chainable(result);
    },

    insert: (table) => ({
      values: (data) => {
        calls.insert.push({ table, data });
        return Promise.resolve(overrides.insertResult ?? [{ id: data?.id }]);
      },
    }),

    update: (table) => ({
      set: (data) => ({
        where: (condition) => {
          calls.update.push({ table, data, condition });
          return Promise.resolve(overrides.updateResult ?? []);
        },
      }),
    }),

    delete: (table) => ({
      where: (condition) => {
        calls.delete.push({ table, condition });
        return Promise.resolve(overrides.deleteResult ?? []);
      },
    }),
  };

  return db;
}

export function makeRequest(url, options = {}) {
  const { method = 'GET', body, headers = {}, cookies = {} } = options;
  const req = new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return req;
}

export function makeLocals(user = null) {
  return { user };
}

export function makeCookies(existing = {}) {
  const store = { ...existing };
  return {
    get: (name) => (store[name] ? { value: store[name] } : undefined),
    set: (name, value, opts) => { store[name] = value; },
    delete: (name) => { delete store[name]; },
    _store: store,
  };
}

export function makeContext(url, options = {}) {
  return {
    request: makeRequest(url, options),
    locals: makeLocals(options.user),
    cookies: makeCookies(options.cookies),
    redirect: (path) => new Response(null, { status: 302, headers: { Location: path } }),
  };
}

export async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Override process.env for the duration of a test.
 * Returns a restore function.
 */
export function setEnv(vars) {
  const originals = {};
  for (const [k, v] of Object.entries(vars)) {
    originals[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  return () => {
    for (const [k, v] of Object.entries(originals)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
}
