CREATE TABLE IF NOT EXISTS "public"."topic_chat_messages" (
    "id" bigint NOT NULL,
    "source" smallint DEFAULT 0 NOT NULL,
    "topic" "text" NOT NULL,
    "author" "uuid" DEFAULT "auth"."uid"(),
    "external_author_id" "text",
    "external_author_name" "text",
    "external_author_avatar" "text",
    "message" "text",
    "external_message_id" "text",
    "translated" "jsonb",
    "rich" "jsonb",
    "bridged" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."topic_chat_messages" OWNER TO "postgres";
ALTER TABLE "public"."topic_chat_messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."topic_chat_messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."topic_chat_messages"
    ADD CONSTRAINT "topic_chat_messages_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."topic_chat_messages"
    ADD CONSTRAINT "topic_chat_messages_author_fkey" FOREIGN KEY ("author") REFERENCES "public"."users_public"("user_id");

CREATE POLICY "can write only authed" ON "public"."topic_chat_messages" FOR INSERT TO "authenticated" WITH CHECK (((((message IS NOT NULL) AND (message <> ''::text) AND (length(message) <= 1000)) OR ((message IS NULL) AND (rich IS NOT NULL))) AND (author = auth.uid()) and ((SELECT blocked from users_public where user_id = auth.uid()) <> true)));

ALTER TABLE "public"."topic_chat_messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view everyone" ON "public"."topic_chat_messages" FOR SELECT USING (true);

GRANT ALL ON TABLE "public"."topic_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."topic_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_chat_messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."topic_chat_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."topic_chat_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."topic_chat_messages_id_seq" TO "service_role";
