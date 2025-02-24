CREATE OR REPLACE FUNCTION "public"."find_posts"(
        "p_user_id" "uuid",
        "search_string" "text",
        "last_post_id" bigint DEFAULT NULL::bigint,
        "max_count" integer DEFAULT 50
    ) RETURNS TABLE(
        "id" bigint,
        "target" smallint,
        "krew" "text",
        "author" "uuid",
        "author_display_name" "text",
        "author_avatar" "text",
        "author_avatar_thumb" "text",
        "author_stored_avatar" "text",
        "author_stored_avatar_thumb" "text",
        "author_x_username" "text",
        "message" "text",
        "translated" "jsonb",
        "rich" "jsonb",
        "parent" bigint,
        "comment_count" integer,
        "repost_count" integer,
        "like_count" integer,
        "created_at" timestamp with time zone,
        "updated_at" timestamp with time zone,
        "liked" boolean,
        "reposted" boolean
    ) LANGUAGE "plpgsql" AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.target,
        p.krew,
        p.author,
        u.display_name,
        u.avatar,
        u.avatar_thumb,
        u.stored_avatar,
        u.stored_avatar_thumb,
        u.x_username,
        p.message,
        p.translated,
        p.rich,
        p.parent,
        p.comment_count,
        p.repost_count,
        p.like_count,
        p.created_at,
        p.updated_at,
        EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id) AS liked,
        EXISTS (SELECT 1 FROM reposts r WHERE r.post_id = p.id AND r.user_id = p_user_id) AS reposted
    FROM 
        posts p
    INNER JOIN 
        users_public u ON p.author = u.user_id
    WHERE 
        POSITION(lower(search_string) IN lower(p.message)) > 0
        AND (last_post_id IS NULL OR p.id < last_post_id)
    ORDER BY 
        p.id DESC
    LIMIT 
        max_count;
END;
$$;

ALTER FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_posts"("p_user_id" "uuid", "search_string" "text", "last_post_id" bigint, "max_count" integer) TO "service_role";
