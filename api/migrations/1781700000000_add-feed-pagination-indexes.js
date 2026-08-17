/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createIndex('posts', ['created_at', 'id'], {
        name: 'idx_posts_created_at_id',
    })

    pgm.createIndex('users', ['created_at', 'id'], {
        name: 'idx_users_created_at_id',
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropIndex('posts', ['created_at', 'id'], {
        name: 'idx_posts_created_at_id',
    })

    pgm.dropIndex('users', ['created_at', 'id'], {
        name: 'idx_users_created_at_id',
    })
};
