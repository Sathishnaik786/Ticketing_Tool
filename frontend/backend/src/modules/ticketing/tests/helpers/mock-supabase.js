function createQueryBuilder(state = {}) {
  const builder = {
    table: null,
    operation: null,
    filters: [],
    payload: null,
    selectArgs: null,
    orderBy: null,
    rangeArgs: null,
    maybeSingle: false,
    single: false,
    returnSelect: false,

    from(table) {
      builder.table = table;
      return builder;
    },
    select(_columns, args) {
      builder.selectArgs = args;
      if (!builder.operation) {
        builder.operation = 'select';
      } else {
        builder.returnSelect = true;
      }
      return builder;
    },
    insert(payload) {
      builder.operation = 'insert';
      builder.payload = payload;
      return builder;
    },
    update(payload) {
      builder.operation = 'update';
      builder.payload = payload;
      return builder;
    },
    delete() {
      builder.operation = 'delete';
      return builder;
    },
    eq(column, value) {
      builder.filters.push({ type: 'eq', column, value });
      return builder;
    },
    is(column, value) {
      builder.filters.push({ type: 'is', column, value });
      return builder;
    },
    or(expression) {
      builder.filters.push({ type: 'or', expression });
      return builder;
    },
    gte(column, value) {
      builder.filters.push({ type: 'gte', column, value });
      return builder;
    },
    lte(column, value) {
      builder.filters.push({ type: 'lte', column, value });
      return builder;
    },
    in(column, values) {
      builder.filters.push({ type: 'in', column, values });
      return builder;
    },
    limit(count) {
      builder.limit = count;
      return builder;
    },
    order(column, options) {
      builder.orderBy = { column, options };
      return builder;
    },
    range(from, to) {
      builder.rangeArgs = { from, to };
      return builder;
    },
    maybeSingle() {
      builder.maybeSingle = true;
      return builder;
    },
    single() {
      builder.single = true;
      return builder;
    },
    then(resolve, reject) {
      return Promise.resolve(builder.execute()).then(resolve, reject);
    },
    execute() {
      const op = builder.operation || 'select';
      const handler = state.handlers?.[builder.table]?.[op];
      const context = {
        table: builder.table,
        operation: op,
        filters: builder.filters,
        payload: builder.payload,
        selectArgs: builder.selectArgs,
        orderBy: builder.orderBy,
        rangeArgs: builder.rangeArgs,
        maybeSingle: builder.maybeSingle,
        single: builder.single,
        returnSelect: builder.returnSelect,
      };

      if (handler) {
        return handler(context);
      }

      return { data: null, error: null, count: 0 };
    },
  };

  return builder;
}

function createMockSupabase(initialState = {}) {
  const state = {
    handlers: initialState.handlers || {},
    storage: initialState.storage || {},
  };

  return {
    from(table) {
      return createQueryBuilder(state).from(table);
    },
    storage: {
      from(bucket) {
        return {
          upload: async (path, buffer, options) => {
            if (state.storage.uploadError) {
              return { data: null, error: state.storage.uploadError };
            }
            state.storage.lastUpload = { bucket, path, buffer, options };
            return { data: { path }, error: null };
          },
          createSignedUrl: async (path, expiresIn) => {
            if (state.storage.signedUrlError) {
              return { data: null, error: state.storage.signedUrlError };
            }
            return {
              data: { signedUrl: `https://signed.example/${path}?exp=${expiresIn}` },
              error: null,
            };
          },
        };
      },
    },
    _state: state,
  };
}

module.exports = {
  createMockSupabase,
  createQueryBuilder,
};
