/* CREATE DATABASE `charting`; */
DROP TABLE IF EXISTS `ct_udf_history`;

CREATE TABLE `ct_udf_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `resolution` varchar(3) NOT NULL,
  `exchange` varchar(30) NOT NULL,
  `startUnixTimestampSec` bigint(15) unsigned NOT NULL,
  `baseTokenSymbol` varchar(32) CHARACTER SET latin1 NOT NULL,
  `quoteTokenSymbol` varchar(32) CHARACTER SET latin1 NOT NULL,
  `openPrice` decimal(30,18) unsigned NOT NULL,
  `highPrice` decimal(30,18) unsigned NOT NULL,
  `lowPrice` decimal(30,18) unsigned NOT NULL,
  `closePrice` decimal(30,18) unsigned NOT NULL,
  `totalVolume` decimal(30,18) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk1` (`resolution`,`exchange`,`startUnixTimestampSec`,`baseTokenSymbol`,`quoteTokenSymbol`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii;