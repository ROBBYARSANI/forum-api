/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments(id)',
      referencesConstraintName: 'fk_likes.comment_id_comments.id',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      referencesConstraintName: 'fk_likes.owner_users.id',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add unique constraint to prevent duplicate likes
  pgm.addConstraint('likes', 'unique_comment_owner', {
    unique: ['comment_id', 'owner'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'unique_comment_owner');
  pgm.dropConstraint('likes', 'fk_likes.owner_users.id');
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');
  pgm.dropTable('likes');
};
