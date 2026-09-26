CREATE TABLE `quote_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`service` text NOT NULL,
	`pickup_date` text DEFAULT '' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_quote_requests_email_created_at` ON `quote_requests` (`email`,`created_at`);