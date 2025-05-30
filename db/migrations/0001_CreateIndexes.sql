-- Migration number: 0001 	 2025-05-30T01:36:00.000Z

CREATE INDEX idx_post_meta_key_value ON post_meta (key, value);
CREATE INDEX idx_posts_id_type ON posts (id, type);
