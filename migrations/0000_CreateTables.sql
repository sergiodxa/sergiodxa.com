-- Migration number: 0000 	 2023-12-21T16:41:15.770Z
CREATE TABLE users (
  id VARCHAR(36) UNIQUE PRIMARY KEY,
  -- Attributes
  role VARCHAR(255) NOT NULL DEFAULT "guess",
  email VARCHAR(320) UNIQUE NOT NULL,
  avatar VARCHAR(2048) NOT NULL,
  username VARCHAR(39) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE connections (
  id VARCHAR(36) UNIQUE PRIMARY KEY,
  -- Attributes
  provider_id VARCHAR(255) UNIQUE NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  -- Relations
  user_id VARCHAR(36) NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Constraints
  CONSTRAINT fk_connections_users FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE posts (
  id VARCHAR(36) UNIQUE PRIMARY KEY,
  -- Attributes
  type VARCHAR(255) NOT NULL,
  -- Relations
  author_id VARCHAR(36) NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Constraints
  CONSTRAINT fk_posts_author_id FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE post_meta (
  id VARCHAR(36) UNIQUE PRIMARY KEY,
  -- Attributes
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  -- Relations
  post_id VARCHAR(36) NOT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Constraints
  CONSTRAINT fk_post_meta_post_id FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

-- Create Indexes
CREATE INDEX idx_connections_provider ON connections (provider_name, provider_id);
CREATE INDEX idx_posts_type ON posts (type);
CREATE INDEX idx_post_meta_post_id ON post_meta (post_id);
CREATE INDEX idx_post_meta_post_id_key ON post_meta (post_id, key);