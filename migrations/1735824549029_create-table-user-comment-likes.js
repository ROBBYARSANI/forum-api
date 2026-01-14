exports.up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
    },
  });

  pgm.addConstraint(
    'user_comment_likes',
    'unique_comment_and_owner',
    'UNIQUE(comment_id, user_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('user_comment_likes');
};
