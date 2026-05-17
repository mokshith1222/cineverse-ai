/*
  # CineVerse AI - Watchlist Table

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - show/movie title
      - `platform` (text) - streaming platform name
      - `poster` (text) - poster image URL
      - `status` (text) - Watching | Completed | Plan to Watch | Dropped
      - `progress` (int) - current episode
      - `total_episodes` (int) - total episodes, nullable
      - `rating` (numeric) - user rating, nullable
      - `genre` (text[]) - genres array
      - `type` (text) - Movie | Anime | Series
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `watchlist` table
    - Policies: authenticated users can CRUD their own entries only
*/

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  platform text NOT NULL DEFAULT '',
  poster text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Plan to Watch',
  progress int DEFAULT 0,
  total_episodes int,
  rating numeric(3, 1),
  genre text[] DEFAULT '{}',
  type text DEFAULT 'Series',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist entries"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist entries"
  ON watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist entries"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_status_idx ON watchlist(status);
