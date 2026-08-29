CREATE TABLE `days` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `date`)
);
--> statement-breakpoint
CREATE TABLE `mutations` (
	`user_id` text NOT NULL,
	`week_key` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `week_key`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `date`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`current_date` text NOT NULL,
	`preferences` text NOT NULL,
	`state_version` integer DEFAULT 2 NOT NULL,
	`updated_at` integer NOT NULL
);
