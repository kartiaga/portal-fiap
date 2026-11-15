/**
 * Curtidas e comentários das postagens. Os dois somem junto com a postagem ou com a conta de quem
 * curtiu/comentou (ON DELETE CASCADE).
 *
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
    // A chave (post_id, user_id) garante uma curtida por pessoa e serve de índice para a contagem.
    pgm.createTable("post_likes", {
        post_id: {
            type: "uuid",
            notNull: true,
            references: "posts",
            onDelete: "CASCADE",
        },
        user_id: {
            type: "uuid",
            notNull: true,
            references: "users",
            onDelete: "CASCADE",
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });
    pgm.addConstraint("post_likes", "post_likes_pkey", {
        primaryKey: ["post_id", "user_id"],
    });

    pgm.createTable("post_comments", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        post_id: {
            type: "uuid",
            notNull: true,
            references: "posts",
            onDelete: "CASCADE",
        },
        author_id: {
            type: "uuid",
            notNull: true,
            references: "users",
            onDelete: "CASCADE",
        },
        content: {
            type: "text",
            notNull: true,
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });
    // Listagem paginada dos comentários de uma postagem (mais recentes primeiro) e contagem.
    pgm.createIndex("post_comments", ["post_id", "created_at", "id"], {
        name: "idx_post_comments_post_created_at_id",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
    pgm.dropTable("post_comments");
    pgm.dropTable("post_likes");
};
