drop trigger if exists "update_user_challenges_updated_at" on "public"."user_challenges";

drop policy "Users can view all user challenges" on "public"."user_challenges";

revoke delete on table "public"."achievements" from "anon";

revoke insert on table "public"."achievements" from "anon";

revoke references on table "public"."achievements" from "anon";

revoke trigger on table "public"."achievements" from "anon";

revoke truncate on table "public"."achievements" from "anon";

revoke update on table "public"."achievements" from "anon";

revoke delete on table "public"."admin_logs" from "anon";

revoke insert on table "public"."admin_logs" from "anon";

revoke references on table "public"."admin_logs" from "anon";

revoke trigger on table "public"."admin_logs" from "anon";

revoke truncate on table "public"."admin_logs" from "anon";

revoke update on table "public"."admin_logs" from "anon";

revoke delete on table "public"."ai_assistants" from "anon";

revoke insert on table "public"."ai_assistants" from "anon";

revoke references on table "public"."ai_assistants" from "anon";

revoke select on table "public"."ai_assistants" from "anon";

revoke trigger on table "public"."ai_assistants" from "anon";

revoke truncate on table "public"."ai_assistants" from "anon";

revoke update on table "public"."ai_assistants" from "anon";

revoke delete on table "public"."ai_assistants" from "authenticated";

revoke insert on table "public"."ai_assistants" from "authenticated";

revoke references on table "public"."ai_assistants" from "authenticated";

revoke select on table "public"."ai_assistants" from "authenticated";

revoke trigger on table "public"."ai_assistants" from "authenticated";

revoke truncate on table "public"."ai_assistants" from "authenticated";

revoke update on table "public"."ai_assistants" from "authenticated";

revoke delete on table "public"."ai_assistants" from "service_role";

revoke insert on table "public"."ai_assistants" from "service_role";

revoke references on table "public"."ai_assistants" from "service_role";

revoke select on table "public"."ai_assistants" from "service_role";

revoke trigger on table "public"."ai_assistants" from "service_role";

revoke truncate on table "public"."ai_assistants" from "service_role";

revoke update on table "public"."ai_assistants" from "service_role";

revoke delete on table "public"."ai_models" from "anon";

revoke insert on table "public"."ai_models" from "anon";

revoke references on table "public"."ai_models" from "anon";

revoke trigger on table "public"."ai_models" from "anon";

revoke truncate on table "public"."ai_models" from "anon";

revoke update on table "public"."ai_models" from "anon";

revoke delete on table "public"."ai_safety_rules" from "anon";

revoke insert on table "public"."ai_safety_rules" from "anon";

revoke references on table "public"."ai_safety_rules" from "anon";

revoke trigger on table "public"."ai_safety_rules" from "anon";

revoke truncate on table "public"."ai_safety_rules" from "anon";

revoke update on table "public"."ai_safety_rules" from "anon";

revoke delete on table "public"."api_keys" from "anon";

revoke insert on table "public"."api_keys" from "anon";

revoke references on table "public"."api_keys" from "anon";

revoke trigger on table "public"."api_keys" from "anon";

revoke truncate on table "public"."api_keys" from "anon";

revoke update on table "public"."api_keys" from "anon";

revoke delete on table "public"."banned_terms" from "anon";

revoke insert on table "public"."banned_terms" from "anon";

revoke references on table "public"."banned_terms" from "anon";

revoke trigger on table "public"."banned_terms" from "anon";

revoke truncate on table "public"."banned_terms" from "anon";

revoke update on table "public"."banned_terms" from "anon";

revoke delete on table "public"."challenge_submissions" from "anon";

revoke insert on table "public"."challenge_submissions" from "anon";

revoke references on table "public"."challenge_submissions" from "anon";

revoke trigger on table "public"."challenge_submissions" from "anon";

revoke truncate on table "public"."challenge_submissions" from "anon";

revoke update on table "public"."challenge_submissions" from "anon";

revoke delete on table "public"."challenges" from "anon";

revoke insert on table "public"."challenges" from "anon";

revoke references on table "public"."challenges" from "anon";

revoke trigger on table "public"."challenges" from "anon";

revoke truncate on table "public"."challenges" from "anon";

revoke update on table "public"."challenges" from "anon";

revoke delete on table "public"."comments" from "anon";

revoke insert on table "public"."comments" from "anon";

revoke references on table "public"."comments" from "anon";

revoke trigger on table "public"."comments" from "anon";

revoke truncate on table "public"."comments" from "anon";

revoke update on table "public"."comments" from "anon";

revoke delete on table "public"."conversation_messages" from "anon";

revoke insert on table "public"."conversation_messages" from "anon";

revoke references on table "public"."conversation_messages" from "anon";

revoke select on table "public"."conversation_messages" from "anon";

revoke trigger on table "public"."conversation_messages" from "anon";

revoke truncate on table "public"."conversation_messages" from "anon";

revoke update on table "public"."conversation_messages" from "anon";

revoke delete on table "public"."conversation_messages" from "authenticated";

revoke insert on table "public"."conversation_messages" from "authenticated";

revoke references on table "public"."conversation_messages" from "authenticated";

revoke select on table "public"."conversation_messages" from "authenticated";

revoke trigger on table "public"."conversation_messages" from "authenticated";

revoke truncate on table "public"."conversation_messages" from "authenticated";

revoke update on table "public"."conversation_messages" from "authenticated";

revoke delete on table "public"."conversation_messages" from "service_role";

revoke insert on table "public"."conversation_messages" from "service_role";

revoke references on table "public"."conversation_messages" from "service_role";

revoke select on table "public"."conversation_messages" from "service_role";

revoke trigger on table "public"."conversation_messages" from "service_role";

revoke truncate on table "public"."conversation_messages" from "service_role";

revoke update on table "public"."conversation_messages" from "service_role";

revoke delete on table "public"."conversation_participants" from "anon";

revoke insert on table "public"."conversation_participants" from "anon";

revoke references on table "public"."conversation_participants" from "anon";

revoke select on table "public"."conversation_participants" from "anon";

revoke trigger on table "public"."conversation_participants" from "anon";

revoke truncate on table "public"."conversation_participants" from "anon";

revoke update on table "public"."conversation_participants" from "anon";

revoke delete on table "public"."conversation_participants" from "authenticated";

revoke insert on table "public"."conversation_participants" from "authenticated";

revoke references on table "public"."conversation_participants" from "authenticated";

revoke select on table "public"."conversation_participants" from "authenticated";

revoke trigger on table "public"."conversation_participants" from "authenticated";

revoke truncate on table "public"."conversation_participants" from "authenticated";

revoke update on table "public"."conversation_participants" from "authenticated";

revoke delete on table "public"."conversation_participants" from "service_role";

revoke insert on table "public"."conversation_participants" from "service_role";

revoke references on table "public"."conversation_participants" from "service_role";

revoke select on table "public"."conversation_participants" from "service_role";

revoke trigger on table "public"."conversation_participants" from "service_role";

revoke truncate on table "public"."conversation_participants" from "service_role";

revoke update on table "public"."conversation_participants" from "service_role";

revoke delete on table "public"."conversations" from "anon";

revoke insert on table "public"."conversations" from "anon";

revoke references on table "public"."conversations" from "anon";

revoke select on table "public"."conversations" from "anon";

revoke trigger on table "public"."conversations" from "anon";

revoke truncate on table "public"."conversations" from "anon";

revoke update on table "public"."conversations" from "anon";

revoke delete on table "public"."conversations" from "authenticated";

revoke insert on table "public"."conversations" from "authenticated";

revoke references on table "public"."conversations" from "authenticated";

revoke select on table "public"."conversations" from "authenticated";

revoke trigger on table "public"."conversations" from "authenticated";

revoke truncate on table "public"."conversations" from "authenticated";

revoke update on table "public"."conversations" from "authenticated";

revoke delete on table "public"."conversations" from "service_role";

revoke insert on table "public"."conversations" from "service_role";

revoke references on table "public"."conversations" from "service_role";

revoke select on table "public"."conversations" from "service_role";

revoke trigger on table "public"."conversations" from "service_role";

revoke truncate on table "public"."conversations" from "service_role";

revoke update on table "public"."conversations" from "service_role";

revoke delete on table "public"."daily_challenges" from "anon";

revoke insert on table "public"."daily_challenges" from "anon";

revoke references on table "public"."daily_challenges" from "anon";

revoke select on table "public"."daily_challenges" from "anon";

revoke trigger on table "public"."daily_challenges" from "anon";

revoke truncate on table "public"."daily_challenges" from "anon";

revoke update on table "public"."daily_challenges" from "anon";

revoke delete on table "public"."daily_challenges" from "authenticated";

revoke insert on table "public"."daily_challenges" from "authenticated";

revoke references on table "public"."daily_challenges" from "authenticated";

revoke select on table "public"."daily_challenges" from "authenticated";

revoke trigger on table "public"."daily_challenges" from "authenticated";

revoke truncate on table "public"."daily_challenges" from "authenticated";

revoke update on table "public"."daily_challenges" from "authenticated";

revoke delete on table "public"."daily_challenges" from "service_role";

revoke insert on table "public"."daily_challenges" from "service_role";

revoke references on table "public"."daily_challenges" from "service_role";

revoke select on table "public"."daily_challenges" from "service_role";

revoke trigger on table "public"."daily_challenges" from "service_role";

revoke truncate on table "public"."daily_challenges" from "service_role";

revoke update on table "public"."daily_challenges" from "service_role";

revoke delete on table "public"."daily_videos" from "anon";

revoke insert on table "public"."daily_videos" from "anon";

revoke references on table "public"."daily_videos" from "anon";

revoke select on table "public"."daily_videos" from "anon";

revoke trigger on table "public"."daily_videos" from "anon";

revoke truncate on table "public"."daily_videos" from "anon";

revoke update on table "public"."daily_videos" from "anon";

revoke delete on table "public"."daily_videos" from "authenticated";

revoke insert on table "public"."daily_videos" from "authenticated";

revoke references on table "public"."daily_videos" from "authenticated";

revoke select on table "public"."daily_videos" from "authenticated";

revoke trigger on table "public"."daily_videos" from "authenticated";

revoke truncate on table "public"."daily_videos" from "authenticated";

revoke update on table "public"."daily_videos" from "authenticated";

revoke delete on table "public"."daily_videos" from "service_role";

revoke insert on table "public"."daily_videos" from "service_role";

revoke references on table "public"."daily_videos" from "service_role";

revoke select on table "public"."daily_videos" from "service_role";

revoke trigger on table "public"."daily_videos" from "service_role";

revoke truncate on table "public"."daily_videos" from "service_role";

revoke update on table "public"."daily_videos" from "service_role";

revoke delete on table "public"."evaluation_logs" from "anon";

revoke insert on table "public"."evaluation_logs" from "anon";

revoke references on table "public"."evaluation_logs" from "anon";

revoke trigger on table "public"."evaluation_logs" from "anon";

revoke truncate on table "public"."evaluation_logs" from "anon";

revoke update on table "public"."evaluation_logs" from "anon";

revoke delete on table "public"."follows" from "anon";

revoke insert on table "public"."follows" from "anon";

revoke references on table "public"."follows" from "anon";

revoke trigger on table "public"."follows" from "anon";

revoke truncate on table "public"."follows" from "anon";

revoke update on table "public"."follows" from "anon";

revoke delete on table "public"."learning_paths" from "anon";

revoke insert on table "public"."learning_paths" from "anon";

revoke references on table "public"."learning_paths" from "anon";

revoke trigger on table "public"."learning_paths" from "anon";

revoke truncate on table "public"."learning_paths" from "anon";

revoke update on table "public"."learning_paths" from "anon";

revoke delete on table "public"."likes" from "anon";

revoke insert on table "public"."likes" from "anon";

revoke references on table "public"."likes" from "anon";

revoke trigger on table "public"."likes" from "anon";

revoke truncate on table "public"."likes" from "anon";

revoke update on table "public"."likes" from "anon";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."notification_deliveries" from "anon";

revoke insert on table "public"."notification_deliveries" from "anon";

revoke references on table "public"."notification_deliveries" from "anon";

revoke select on table "public"."notification_deliveries" from "anon";

revoke trigger on table "public"."notification_deliveries" from "anon";

revoke truncate on table "public"."notification_deliveries" from "anon";

revoke update on table "public"."notification_deliveries" from "anon";

revoke delete on table "public"."notification_deliveries" from "authenticated";

revoke insert on table "public"."notification_deliveries" from "authenticated";

revoke references on table "public"."notification_deliveries" from "authenticated";

revoke select on table "public"."notification_deliveries" from "authenticated";

revoke trigger on table "public"."notification_deliveries" from "authenticated";

revoke truncate on table "public"."notification_deliveries" from "authenticated";

revoke update on table "public"."notification_deliveries" from "authenticated";

revoke delete on table "public"."notification_deliveries" from "service_role";

revoke insert on table "public"."notification_deliveries" from "service_role";

revoke references on table "public"."notification_deliveries" from "service_role";

revoke select on table "public"."notification_deliveries" from "service_role";

revoke trigger on table "public"."notification_deliveries" from "service_role";

revoke truncate on table "public"."notification_deliveries" from "service_role";

revoke update on table "public"."notification_deliveries" from "service_role";

revoke delete on table "public"."notification_templates" from "anon";

revoke insert on table "public"."notification_templates" from "anon";

revoke references on table "public"."notification_templates" from "anon";

revoke select on table "public"."notification_templates" from "anon";

revoke trigger on table "public"."notification_templates" from "anon";

revoke truncate on table "public"."notification_templates" from "anon";

revoke update on table "public"."notification_templates" from "anon";

revoke delete on table "public"."notification_templates" from "authenticated";

revoke insert on table "public"."notification_templates" from "authenticated";

revoke references on table "public"."notification_templates" from "authenticated";

revoke select on table "public"."notification_templates" from "authenticated";

revoke trigger on table "public"."notification_templates" from "authenticated";

revoke truncate on table "public"."notification_templates" from "authenticated";

revoke update on table "public"."notification_templates" from "authenticated";

revoke delete on table "public"."notification_templates" from "service_role";

revoke insert on table "public"."notification_templates" from "service_role";

revoke references on table "public"."notification_templates" from "service_role";

revoke select on table "public"."notification_templates" from "service_role";

revoke trigger on table "public"."notification_templates" from "service_role";

revoke truncate on table "public"."notification_templates" from "service_role";

revoke update on table "public"."notification_templates" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."posts" from "anon";

revoke insert on table "public"."posts" from "anon";

revoke references on table "public"."posts" from "anon";

revoke trigger on table "public"."posts" from "anon";

revoke truncate on table "public"."posts" from "anon";

revoke update on table "public"."posts" from "anon";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."resources" from "anon";

revoke insert on table "public"."resources" from "anon";

revoke references on table "public"."resources" from "anon";

revoke trigger on table "public"."resources" from "anon";

revoke truncate on table "public"."resources" from "anon";

revoke update on table "public"."resources" from "anon";

revoke delete on table "public"."scheduled_messages" from "anon";

revoke insert on table "public"."scheduled_messages" from "anon";

revoke references on table "public"."scheduled_messages" from "anon";

revoke select on table "public"."scheduled_messages" from "anon";

revoke trigger on table "public"."scheduled_messages" from "anon";

revoke truncate on table "public"."scheduled_messages" from "anon";

revoke update on table "public"."scheduled_messages" from "anon";

revoke delete on table "public"."scheduled_messages" from "authenticated";

revoke insert on table "public"."scheduled_messages" from "authenticated";

revoke references on table "public"."scheduled_messages" from "authenticated";

revoke select on table "public"."scheduled_messages" from "authenticated";

revoke trigger on table "public"."scheduled_messages" from "authenticated";

revoke truncate on table "public"."scheduled_messages" from "authenticated";

revoke update on table "public"."scheduled_messages" from "authenticated";

revoke delete on table "public"."scheduled_messages" from "service_role";

revoke insert on table "public"."scheduled_messages" from "service_role";

revoke references on table "public"."scheduled_messages" from "service_role";

revoke select on table "public"."scheduled_messages" from "service_role";

revoke trigger on table "public"."scheduled_messages" from "service_role";

revoke truncate on table "public"."scheduled_messages" from "service_role";

revoke update on table "public"."scheduled_messages" from "service_role";

revoke delete on table "public"."scoring_templates" from "anon";

revoke insert on table "public"."scoring_templates" from "anon";

revoke references on table "public"."scoring_templates" from "anon";

revoke trigger on table "public"."scoring_templates" from "anon";

revoke truncate on table "public"."scoring_templates" from "anon";

revoke update on table "public"."scoring_templates" from "anon";

revoke delete on table "public"."user_achievements" from "anon";

revoke insert on table "public"."user_achievements" from "anon";

revoke references on table "public"."user_achievements" from "anon";

revoke trigger on table "public"."user_achievements" from "anon";

revoke truncate on table "public"."user_achievements" from "anon";

revoke update on table "public"."user_achievements" from "anon";

revoke delete on table "public"."user_challenges" from "anon";

revoke insert on table "public"."user_challenges" from "anon";

revoke references on table "public"."user_challenges" from "anon";

revoke select on table "public"."user_challenges" from "anon";

revoke trigger on table "public"."user_challenges" from "anon";

revoke truncate on table "public"."user_challenges" from "anon";

revoke update on table "public"."user_challenges" from "anon";

revoke delete on table "public"."user_challenges" from "authenticated";

revoke insert on table "public"."user_challenges" from "authenticated";

revoke references on table "public"."user_challenges" from "authenticated";

revoke select on table "public"."user_challenges" from "authenticated";

revoke trigger on table "public"."user_challenges" from "authenticated";

revoke truncate on table "public"."user_challenges" from "authenticated";

revoke update on table "public"."user_challenges" from "authenticated";

revoke delete on table "public"."user_challenges" from "service_role";

revoke insert on table "public"."user_challenges" from "service_role";

revoke references on table "public"."user_challenges" from "service_role";

revoke select on table "public"."user_challenges" from "service_role";

revoke trigger on table "public"."user_challenges" from "service_role";

revoke truncate on table "public"."user_challenges" from "service_role";

revoke update on table "public"."user_challenges" from "service_role";

revoke delete on table "public"."user_progress" from "anon";

revoke insert on table "public"."user_progress" from "anon";

revoke references on table "public"."user_progress" from "anon";

revoke trigger on table "public"."user_progress" from "anon";

revoke truncate on table "public"."user_progress" from "anon";

revoke update on table "public"."user_progress" from "anon";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

alter table "public"."user_challenges" drop constraint "user_challenges_user_id_fkey";

drop function if exists "public"."decrement_post_comments"(post_id uuid);

drop function if exists "public"."decrement_post_likes"(post_id uuid);

drop function if exists "public"."increment_post_comments"(post_id uuid);

drop function if exists "public"."increment_post_likes"(post_id uuid);

drop index if exists "public"."idx_user_challenges_active";

drop index if exists "public"."idx_user_challenges_difficulty";

alter table "public"."user_challenges" add column "transcript" text;

alter table "public"."user_challenges" alter column "challenge_type" set not null;

CREATE INDEX idx_user_challenges_challenge_type ON public.user_challenges USING btree (challenge_type);

CREATE INDEX idx_user_challenges_difficulty_level ON public.user_challenges USING btree (difficulty_level);

CREATE INDEX idx_user_challenges_is_active ON public.user_challenges USING btree (is_active);

alter table "public"."user_challenges" add constraint "user_challenges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_challenges" validate constraint "user_challenges_user_id_fkey";

create policy "Admins can manage all user challenges"
on "public"."user_challenges"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));


create policy "Anyone can view active user challenges"
on "public"."user_challenges"
as permissive
for select
to public
using ((is_active = true));



