-- Migration number: 0002 	 2023-12-21T16:44:52.255Z
CREATE TABLE post_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_meta (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  post_id INTEGER NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Relations
  CONSTRAINT fk_post_meta_post_id FOREIGN KEY (post_id) REFERENCES posts (id)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  author_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Relations
  CONSTRAINT fk_posts_author_id FOREIGN KEY (author_id) REFERENCES users (id),
  CONSTRAINT fk_posts_type_id FOREIGN KEY (type_id) REFERENCES post_types (id)
);