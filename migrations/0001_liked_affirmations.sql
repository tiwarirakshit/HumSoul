CREATE TABLE "user_liked_affirmations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"affirmation_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user_liked_affirmations" ADD CONSTRAINT "user_liked_affirmations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_liked_affirmations" ADD CONSTRAINT "user_liked_affirmations_affirmation_id_affirmations_id_fk" FOREIGN KEY ("affirmation_id") REFERENCES "affirmations"("id") ON DELETE CASCADE; 