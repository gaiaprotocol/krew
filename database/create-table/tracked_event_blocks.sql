CREATE TABLE IF NOT EXISTS "public"."tracked_event_blocks" (
    "contract_type" smallint NOT NULL,
    "block_number" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."tracked_event_blocks" OWNER TO "postgres";

ALTER TABLE "public"."tracked_event_blocks" ALTER COLUMN "contract_type" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tracked_event_blocks_contract_type_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."tracked_event_blocks"
    ADD CONSTRAINT "tracked_event_blocks_pkey" PRIMARY KEY ("contract_type");

ALTER TABLE "public"."tracked_event_blocks" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "anon";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."tracked_event_blocks" TO "service_role";

GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tracked_event_blocks_contract_type_seq" TO "service_role";
