/* CREATE DATABASE `charting`; */
DROP TABLE IF EXISTS `ct_udf_history`;

CREATE TABLE `ct_udf_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `baseTokenSymbol` varchar(32) CHARACTER SET latin1 NOT NULL DEFAULT '',
  `quoteTokenSymbol` varchar(32) CHARACTER SET latin1 NOT NULL DEFAULT '',
  `startUnixTimestampSec` bigint(15) unsigned NOT NULL,
  `openPrice` decimal(30,18) unsigned NOT NULL,
  `highPrice` decimal(30,18) unsigned NOT NULL,
  `lowPrice` decimal(30,18) unsigned NOT NULL,
  `closePrice` decimal(30,18) unsigned NOT NULL,
  `totalVolume` decimal(30,0) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk1` (`baseTokenSymbol`, `quoteTokenSymbol`, `startUnixTimestampSec`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;

