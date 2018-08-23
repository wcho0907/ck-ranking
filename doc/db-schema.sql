/* CREATE DATABASE `charting`; */

DROP TABLE IF EXISTS `px_udf_data_1m`;
CREATE TABLE `px_udf_data_1m` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,    
  `baseTokenSymbol` varchar(32) NOT NULL,
  `quoteTokenSymbol` varchar(32) NOT NULL,
  `startUnixTimestampSec` bigint(15) UNSIGNED,  
  `openPrice` DECIMAL(30,18) UNSIGNED,
  `highPrice` DECIMAL(30,18) UNSIGNED,
  `lowPrice` DECIMAL(30,18) UNSIGNED,
  `closePrice` DECIMAL(30,18) UNSIGNED,
  `totalVolume` DECIMAL(30,0) UNSIGNED NOT NULL DEFAULT 0,  
   PRIMARY KEY (`id`),
   UNIQUE KEY `pair` (`baseTokenAddress`, `quoteTokenAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;