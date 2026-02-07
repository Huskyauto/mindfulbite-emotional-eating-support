CREATE TABLE `ai_research_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`query` text NOT NULL,
	`response` text NOT NULL,
	`category` varchar(100),
	`sources` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_research_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `biohacking_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('morning_sunlight','cold_exposure','sauna','red_light','neat_steps','grounding') NOT NULL,
	`durationMinutes` int,
	`coldTemp` int,
	`saunaTemp` int,
	`stepCount` int,
	`standingMinutes` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `biohacking_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `body_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`weightLbs` decimal(5,1),
	`bodyFatPercent` decimal(4,1),
	`leanMassLbs` decimal(5,1),
	`visceralFat` int,
	`waistInches` decimal(4,1),
	`hipsInches` decimal(4,1),
	`chestInches` decimal(4,1),
	`measurementType` enum('scale','dexa','bodpod','tape'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `body_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fit_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetWeight` int,
	`visualizationNotes` text,
	`emotionsExperienced` json,
	`durationMinutes` int DEFAULT 5,
	`effectivenessRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fit_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneName` varchar(255) NOT NULL,
	`targetValue` decimal(5,1),
	`currentValue` decimal(5,1),
	`reward` text,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`proteinGrams` int,
	`carbsGrams` int,
	`fatGrams` int,
	`calories` int,
	`sodiumMg` int,
	`potassiumMg` int,
	`magnesiumMg` int,
	`isRefeedDay` boolean DEFAULT false,
	`waterOz` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutrition_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bedTime` timestamp NOT NULL,
	`wakeTime` timestamp NOT NULL,
	`totalHours` decimal(4,2) NOT NULL,
	`quality` enum('excellent','good','fair','poor'),
	`caffeineLate` boolean DEFAULT false,
	`screensBefore` boolean DEFAULT false,
	`roomTemp` int,
	`magnesiumTaken` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplement_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplementId` int NOT NULL,
	`userId` int NOT NULL,
	`taken` boolean NOT NULL DEFAULT true,
	`takenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplement_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`dosage` varchar(100),
	`tier` enum('tier1','tier2','tier3') DEFAULT 'tier1',
	`frequency` enum('daily','twice_daily','weekly','as_needed') DEFAULT 'daily',
	`timeOfDay` enum('morning','afternoon','evening','bedtime','with_meals'),
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutType` enum('strength','walking','incline','rucking','nordic','other') NOT NULL,
	`name` varchar(255),
	`durationMinutes` int NOT NULL,
	`distanceMiles` decimal(4,2),
	`inclinePercent` int,
	`ruckWeightLbs` int,
	`avgHeartRate` int,
	`exercises` json,
	`caloriesBurned` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
