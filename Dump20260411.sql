-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: construction_tracker
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `old_values` varchar(255) DEFAULT NULL,
  `new_values` varchar(255) DEFAULT NULL,
  `action_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'CREATE','users',2,1,NULL,'{\"name\":\"kajal patil\",\"email\":\"kajal@123\",\"role_code\":102}','2026-04-07 05:34:38',NULL),(2,'CREATE','categories',1,1,NULL,'{\"category_name\":\"Raw Materials\",\"category_type\":\"Outward\"}','2026-04-07 05:40:26',NULL),(3,'CREATE','categories',2,1,NULL,'{\"category_name\":\"Labor & Wages\",\"category_type\":\"Outward\"}','2026-04-07 05:40:51',NULL),(4,'CREATE','categories',3,1,NULL,'{\"category_name\":\"Machinary rent\",\"category_type\":\"Outward\"}','2026-04-07 05:41:01',NULL),(5,'CREATE','categories',4,1,NULL,'{\"category_name\":\"Site \",\"category_type\":\"Outward\"}','2026-04-07 05:41:08',NULL),(6,'CREATE','categories',5,1,NULL,'{\"category_name\":\"expenses\",\"category_type\":\"Outward\"}','2026-04-07 05:41:11',NULL),(7,'DELETE','categories',4,1,NULL,NULL,'2026-04-07 05:41:15',NULL),(8,'DELETE','categories',5,1,NULL,NULL,'2026-04-07 05:41:17',NULL),(9,'CREATE','categories',6,1,NULL,'{\"category_name\":\"Site Expenses\",\"category_type\":\"Outward\"}','2026-04-07 05:41:25',NULL),(10,'CREATE','categories',7,1,NULL,'{\"category_name\":\"Client Payment\",\"category_type\":\"Inward\"}','2026-04-07 05:42:19',NULL),(11,'CREATE','categories',8,1,NULL,'{\"category_name\":\"Funding\",\"category_type\":\"Inward\"}','2026-04-07 05:42:28',NULL),(12,'CREATE','categories',9,1,NULL,'{\"category_name\":\"Scrap Sale\",\"category_type\":\"Inward\"}','2026-04-07 05:42:40',NULL),(13,'CREATE','sites',1,1,NULL,'{\"site_name\":\"Main Office\"}','2026-04-07 05:42:52',NULL),(14,'CREATE','sites',2,1,NULL,'{\"site_name\":\"Site A - City Center\"}','2026-04-07 05:43:03',NULL),(15,'CREATE','transactions',1,1,NULL,'{\"transaction_type\":\"Money Outward (Expense)\",\"site_id\":1,\"category_id\":1,\"amount\":5000}','2026-04-07 05:44:16',NULL),(16,'CREATE','transactions',2,2,NULL,'{\"transaction_type\":\"Money Inward (Income)\",\"site_id\":1,\"category_id\":7,\"amount\":70000}','2026-04-07 05:46:05',NULL),(17,'CREATE','sites',3,1,NULL,'{\"site_name\":\"new site \"}','2026-04-07 06:09:21',NULL),(18,'CREATE','users',3,1,NULL,'{\"name\":\"Divya Patil\",\"email\":\"divya@gmail.com\",\"role_code\":102}','2026-04-07 06:09:56',NULL);
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `category_type` enum('Inward','Outward') NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_per_creator` (`category_name`,`category_type`,`created_by`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Raw Materials','Outward',1,'2026-04-07 05:40:26',1),(2,'Labor & Wages','Outward',1,'2026-04-07 05:40:51',1),(3,'Machinary rent','Outward',1,'2026-04-07 05:41:01',1),(4,'Site ','Outward',1,'2026-04-07 05:41:08',0),(5,'expenses','Outward',1,'2026-04-07 05:41:11',0),(6,'Site Expenses','Outward',1,'2026-04-07 05:41:25',1),(7,'Client Payment','Inward',1,'2026-04-07 05:42:19',1),(8,'Funding','Inward',1,'2026-04-07 05:42:28',1),(9,'Scrap Sale','Inward',1,'2026-04-07 05:42:40',1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `dashboard_summary`
--

DROP TABLE IF EXISTS `dashboard_summary`;
/*!50001 DROP VIEW IF EXISTS `dashboard_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `dashboard_summary` AS SELECT 
 1 AS `site_id`,
 1 AS `site_name`,
 1 AS `total_inward`,
 1 AS `total_outward`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `role_code` int NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`),
  UNIQUE KEY `role_code` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin',101,'Administrator with full access and user management','2026-04-06 12:54:52'),(2,'User',102,'Regular user with project access','2026-04-06 12:54:52');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_name` varchar(255) NOT NULL,
  `site_code` varchar(50) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_code` (`site_code`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sites`
--

LOCK TABLES `sites` WRITE;
/*!40000 ALTER TABLE `sites` DISABLE KEYS */;
INSERT INTO `sites` VALUES (1,'Main Office',NULL,1,'2026-04-07 05:42:52','2026-04-07 05:42:52',1),(2,'Site A - City Center',NULL,1,'2026-04-07 05:43:03','2026-04-07 05:43:03',1),(3,'new site ',NULL,1,'2026-04-07 06:09:21','2026-04-07 06:09:21',1);
/*!40000 ALTER TABLE `sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_type` enum('Money Inward (Income)','Money Outward (Expense)') NOT NULL,
  `site_id` int NOT NULL,
  `category_id` int NOT NULL,
  `party_vendor_name` varchar(255) NOT NULL,
  `bill_voucher_no` varchar(100) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text,
  `transaction_date` date DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `idx_site_id` (`site_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_transaction_date` (`transaction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,'Money Outward (Expense)',1,1,'Tata Steel','',5000.00,'Description is description',NULL,1,'2026-04-07 05:44:16','2026-04-07 05:44:16',0),(2,'Money Inward (Income)',1,7,'Birla','',70000.00,'dse',NULL,2,'2026-04-07 05:46:05','2026-04-07 05:46:05',0);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `site_id` int DEFAULT NULL,
  `can_view` tinyint(1) DEFAULT '1',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_user_site_permission` (`user_id`,`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `user_transaction_summary`
--

DROP TABLE IF EXISTS `user_transaction_summary`;
/*!50001 DROP VIEW IF EXISTS `user_transaction_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_transaction_summary` AS SELECT 
 1 AS `user_id`,
 1 AS `name`,
 1 AS `email`,
 1 AS `total_transactions`,
 1 AS `total_inward`,
 1 AS `total_outward`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role_id` (`role_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@construction.com','9876543210','$2a$10$zbRtL1Ch5M9vtNIpdcqVe.dVHqQ2g7oSE.dqN4bnsLMPy1ZLkJB7G',1,1,'2026-04-07 05:16:29','2026-04-07 05:33:33',NULL),(2,'kajal patil','kajal@gmail.com','9175690372','$2a$10$GDb.5EVxDOKVWpFSbg1SseaoXGOu2xiGdeE0/wZtSONat1K4SNzVG',2,1,'2026-04-07 05:34:38','2026-04-07 05:35:43',1),(3,'Divya Patil','divya@gmail.com','9881007272','$2a$10$EWqlS8D5HekxCUcU0EDSbOhE/sz63tC.j/lSNUUSNhY8mYxUp6KDO',2,1,'2026-04-07 06:09:56','2026-04-07 06:09:56',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'construction_tracker'
--

--
-- Final view structure for view `dashboard_summary`
--

/*!50001 DROP VIEW IF EXISTS `dashboard_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `dashboard_summary` AS select `s`.`id` AS `site_id`,`s`.`site_name` AS `site_name`,coalesce(sum((case when (`t`.`transaction_type` = 'Money Inward (Income)') then `t`.`amount` else 0 end)),0) AS `total_inward`,coalesce(sum((case when (`t`.`transaction_type` = 'Money Outward (Expense)') then `t`.`amount` else 0 end)),0) AS `total_outward` from (`sites` `s` left join `transactions` `t` on(((`s`.`id` = `t`.`site_id`) and (`t`.`is_deleted` = false)))) group by `s`.`id`,`s`.`site_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_transaction_summary`
--

/*!50001 DROP VIEW IF EXISTS `user_transaction_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_transaction_summary` AS select `u`.`id` AS `user_id`,`u`.`name` AS `name`,`u`.`email` AS `email`,count(`t`.`id`) AS `total_transactions`,coalesce(sum((case when (`t`.`transaction_type` = 'Money Inward (Income)') then `t`.`amount` else 0 end)),0) AS `total_inward`,coalesce(sum((case when (`t`.`transaction_type` = 'Money Outward (Expense)') then `t`.`amount` else 0 end)),0) AS `total_outward` from (`users` `u` left join `transactions` `t` on(((`u`.`id` = `t`.`created_by`) and (`t`.`is_deleted` = false)))) group by `u`.`id`,`u`.`name`,`u`.`email` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-11 16:30:42
