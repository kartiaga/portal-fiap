/**
 * A coluna guarda a chave do arquivo no armazenamento (avatars/<usuário>/<uuid>.jpg), e não uma
 * URL: a API monta o endereço público na hora, a partir de S3_PUBLIC_URL.
 *
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
    pgm.renameColumn("profiles", "avatar_url", "avatar_key");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
    pgm.renameColumn("profiles", "avatar_key", "avatar_url");
};
