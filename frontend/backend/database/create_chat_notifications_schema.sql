/* ============================================================
   EMS – Real-Time Chat & Notifications
   Database Schema (PostgreSQL / Supabase Compatible)
   ============================================================ */

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- CHAT CONVERSATIONS (1:1 ONLY)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id),

  CONSTRAINT fk_chat_user1 FOREIGN KEY (user1_id)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_chat_user2 FOREIGN KEY (user2_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- CHAT MESSAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id)
    REFERENCES chat_conversations(id) ON DELETE CASCADE,

  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_message_receiver FOREIGN KEY (receiver_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50),
  title VARCHAR(100),
  message TEXT,
  link TEXT,
  source_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_notification_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- INDEXES (PERFORMANCE)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user1
  ON chat_conversations(user1_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user2
  ON chat_conversations(user2_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
  ON chat_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
  ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver
  ON chat_messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------

-- === chat_conversations ===
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_conversations"
ON chat_conversations
FOR SELECT USING (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

CREATE POLICY "insert_own_conversations"
ON chat_conversations
FOR INSERT WITH CHECK (
  auth.uid() = user1_id OR auth.uid() = user2_id
);

-- === chat_messages ===
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_messages"
ON chat_messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "send_messages"
ON chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

CREATE POLICY "receiver_mark_read"
ON chat_messages
FOR UPDATE USING (
  auth.uid() = receiver_id
);

-- === notifications ===
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_notifications"
ON notifications
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "insert_notifications"
ON notifications
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "update_own_notifications"
ON notifications
FOR UPDATE USING (
  auth.uid() = user_id
);

/* ============================================================
   END OF FILE
   ============================================================ */