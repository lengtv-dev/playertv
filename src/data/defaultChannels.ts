import { Channel } from '../types';
import { categorizeChannel } from '../services/m3uParser';

// Channels provided by the user in prompt
const rawChannels = [
  {"channel_id": "1580", "title": "AVC 1", "poster": "https://doodii.me/images/tv/gNrpoNE4Lrd5pcbdOT6bmjL12Dtg7nZavc_women.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1580"}, 
  {"channel_id": "1571", "title": "monomax sport", "poster": "https://doodii.me/images/tv/5E0SBxbVr5NC0eft8npW9PVxxQRd3jMmaxsport.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1571"}, 
  {"channel_id": "1538", "title": "max1", "poster": "https://doodii.me/images/tv/iCMaoeXKbEmPzmbxmAfdoi536sTSd6Nmax1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1538"}, 
  {"channel_id": "1544", "title": "max2", "poster": "https://doodii.me/images/tv/z2lwn9XjsBsRgL3Gf4booyE7DviD06ymax2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1544"}, 
  {"channel_id": "1144", "title": "True Sport1", "poster": "https://doodii.me/images/tv/g6YKUpBO26xkt6lRc7KsHo8nerNroTv1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1144"}, 
  {"channel_id": "1143", "title": "True Sport2", "poster": "https://doodii.me/images/tv/jfctg5KXKiuJHg3Jp5lgY55QV16TTyH2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1143"}, 
  {"channel_id": "1142", "title": "True Sport3", "poster": "https://doodii.me/images/tv/KvgYEmG2v0NWBKaEfPZ4qF92pDfEAo93.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1142"}, 
  {"channel_id": "1141", "title": "True Sport4", "poster": "https://doodii.me/images/tv/W2zPSIhCjRFF25i5muG80FfmkRO9a5o4.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1141"}, 
  {"channel_id": "1140", "title": "True Sport5", "poster": "https://doodii.me/images/tv/KX3aTXIjBFgqCDVJ2J7umbe9sasy4hJ5.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1140"}, 
  {"channel_id": "1139", "title": "True Sport7", "poster": "https://doodii.me/images/tv/oUmqnGxkPudJHLGSjNF3iZQ61nCk6BJ7.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1139"}, 
  {"channel_id": "1542", "title": "bein1", "poster": "https://doodii.me/images/tv/dXwh8ApDihDyrNLoMFYLrlJ8IU1NXh720240418192615Bein1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1542"}, 
  {"channel_id": "1150", "title": "beinsport2", "poster": "https://doodii.me/images/tv/tMau2MiGwbHDKNBP2RotX6T3OJgi4GN20240418192624Bein2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1150"}, 
  {"channel_id": "1132", "title": "beinsport3", "poster": "https://doodii.me/images/tv/fJ5Yr6UUhgnZ72SnpTtMCspbqmHQK6j20240418192653Bein3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1132"}, 
  {"channel_id": "1233", "title": "SIAM 5", "poster": "https://doodii.me/images/tv/qsUepUziWdMiV2OmIfT8WZ1MXuvRwGGsiam5.png", "url": "https://ball-online.com/api/proxy/stream?tv=1233"}, 
  {"channel_id": "1586", "title": "premierfootball3", "poster": "https://doodii.me/images/tv/mwGCh2bEGAKJTFZDHpbxyB3CJuTM7GEpre3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1586"}, 
  {"channel_id": "1135", "title": "premierfootball4", "poster": "https://doodii.me/images/tv/9YvLHrniqbDR3mXGG43nsUGFjblsKmZpre4.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1135"}, 
  {"channel_id": "1556", "title": "max3", "poster": "https://doodii.me/images/tv/4o5fxpYUMlrJzrBW5Y3jiqn9F3F1O35max6.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1556"}, 
  {"channel_id": "1230", "title": "SIAM 3", "poster": "https://doodii.me/images/tv/e3vYTZY5x2cGYw2GM2t8OLlge3jbzC1siam3.png", "url": "https://ball-online.com/api/proxy/stream?tv=1230"}, 
  {"channel_id": "1609", "title": "ballthai2 สำรอง", "poster": "https://doodii.me/images/tv/6E55uOJH2ssBNoIM2uppm99r2uKJc9L7gtnup1749974227.png", "url": "https://ball-online.com/api/proxy/stream?tv=1609"}, 
  {"channel_id": "1600", "title": "ballthai1 หลัก", "poster": "https://doodii.me/images/tv/WpgD8773r0SyI7jn23w6zZkS0nwLJnB7gtnup1749974227.png", "url": "https://ball-online.com/api/proxy/stream?tv=1600"}, 
  {"channel_id": "1604", "title": "premier League Full HD", "poster": "https://doodii.me/images/tv/Mj2vTOwD2dcIdGzCLb9b8dG4UzQ3Xm2full.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1604"}, 
  {"channel_id": "1587", "title": "premierfootball5", "poster": "https://doodii.me/images/tv/MAB45eKmloeXgnT1hkJ8L7l2sVKMjCZpre5.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1587"}, 
  {"channel_id": "1509", "title": "K League 1", "poster": "https://doodii.me/images/tv/rn2GNgTjr23LK4BSIXm9ZlbTSsUpg2Bsouth-korea-k-league-new-2021-logo-png_seeklogo-390582.png", "url": "https://ball-online.com/api/proxy/stream?tv=1509"}, 
  {"channel_id": "1272", "title": "BG SPORT1", "poster": "https://doodii.me/images/tv/1yVii0oQ2G2ShXhV3RNZUIHPAZfHLSnbg1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1272"}, 
  {"channel_id": "1463", "title": "เจลีค 1", "poster": "https://doodii.me/images/tv/nTq7LxkVud9pdW5eKozH20G2n4PSHXyj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1463"}, 
  {"channel_id": "1592", "title": "เจลีค3", "poster": "https://doodii.me/images/tv/A1LXUnaqEXZeNiYzHmLgmHyqPARWB5tj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1592"}, 
  {"channel_id": "1593", "title": "เจลีค 4", "poster": "https://doodii.me/images/tv/MUuqBPGaEEF6t5pzP7sTzlb5jTG1rCyj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1593"}, 
  {"channel_id": "1594", "title": "เจลีค 5", "poster": "https://doodii.me/images/tv/q1DEC5sdlE6K4r2KxsWup8OlrGJr2XQj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1594"}, 
  {"channel_id": "1595", "title": "เจลีค 6", "poster": "https://doodii.me/images/tv/jwcpOpCamXkwKanzhPWy2hkS8PUxhyGj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1595"}, 
  {"channel_id": "1596", "title": "เจลีค 7", "poster": "https://doodii.me/images/tv/SDI09ZOVbAu07SgpmMml6R71A0XbbQfj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1596"}, 
  {"channel_id": "1597", "title": "เจลีค 8", "poster": "https://doodii.me/images/tv/fZFW6n3AGPQmhZYXwRQMBR0HLOwW0Qxj1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1597"}, 
  {"channel_id": "1131", "title": "spotv", "poster": "https://doodii.me/images/tv/4Q0AjmRHDTT6yRAyBK7U93AeILgr5ZAsp1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1131"}, 
  {"channel_id": "1130", "title": "Spotv2", "poster": "https://doodii.me/images/tv/oxvJ1JsLoINr0T6aVCkLIlAfkyPXJcLsp2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1130"}, 
  {"channel_id": "1488", "title": "ONE LUMPINEE", "poster": "https://doodii.me/images/tv/PCMkvH3mWTmC6QfKFWX1BoDiH1IFNVPone-lumpinee.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1488"}, 
  {"channel_id": "1502", "title": "ONE LUMPINEE ช่อง 7", "poster": "https://doodii.me/images/tv/Hr4ELicZHB5H2aMRX7OnCEQkIYzkQpvone-lumpinee.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1502"}, 
  {"channel_id": "1252", "title": "NFL 51", "poster": "https://doodii.me/images/tv/bBnyGVEI0HdFOnmxqOfYRJcW7VN9tYcnfl.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1252"}, 
  {"channel_id": "1416", "title": "playsport 66", "poster": "https://doodii.me/images/tv/fU0BePitnNNqxA7vOGCgYwFPXpljc6jplaysport66.png", "url": "https://ball-online.com/api/proxy/stream?tv=1416"}, 
  {"channel_id": "1231", "title": "SIAM 2", "poster": "https://doodii.me/images/tv/DAgvjYNjnRKKBi5ha9DiPlkFaDDmapZsiam2.png", "url": "https://ball-online.com/api/proxy/stream?tv=1231"}, 
  {"channel_id": "1261", "title": "BEIN 6", "poster": "https://doodii.me/images/tv/bk29KCap4cE2i3XHTMrPxkfbwDIbYP620240418192728Bein6.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1261"}, 
  {"channel_id": "1535", "title": "bein4", "poster": "https://doodii.me/images/tv/blxhtXgNLWCyle8DdsX3BjpIUI7JZGE20240418192706Bein4.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1535"}, 
  {"channel_id": "1244", "title": "REALMARIDTV", "poster": "https://doodii.me/images/tv/HbNyknHiOep1XPLZthj75b7GLDQ7Lk9real.png", "url": "https://ball-online.com/api/proxy/stream?tv=1244"}, 
  {"channel_id": "1264", "title": "NBA 55", "poster": "https://doodii.me/images/tv/AZTzy4Yx89Ri1wTWUCJYM2CsutSjGndnba4.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1264"}, 
  {"channel_id": "1265", "title": "NBA 56", "poster": "https://doodii.me/images/tv/N2UXzvc7QGZJadErG8Btmb8Zrj6XSionba3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1265"}, 
  {"channel_id": "1413", "title": "NBA", "poster": "https://doodii.me/images/tv/KKEMwYvAk9iyXHHoEmgxqK0OycHphWdnbatv.png", "url": "https://ball-online.com/api/proxy/stream?tv=1413"}, 
  {"channel_id": "1145", "title": "tennis", "poster": "https://doodii.me/images/tv/3D7cim4Dqxix0jmxmwP6WEOVTD6rUTbtennis.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1145"}, 
  {"channel_id": "1146", "title": "golfplus", "poster": "https://doodii.me/images/tv/mLMy2vo1DrvtB9BnIHsVfrcjJF7HHyHgoft.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1146"}, 
  {"channel_id": "999", "title": "LFC TV", "poster": "https://doodii.me/images/tv/8fc4bc380e6185d2f37a64f0c8f34a9399cad265a1768cc2dd013f0e740300ae.png", "url": "https://ball-online.com/api/proxy/stream?tv=999"}, 
  {"channel_id": "1154", "title": "MUTV", "poster": "https://doodii.me/images/tv/65o6kEdifmAb8dFzpFDod1nYhGte9j0mutv.webp", "url": "https://ball-online.com/api/proxy/stream?tv=1154"}, 
  {"channel_id": "1334", "title": "SIAM 4", "poster": "https://doodii.me/images/tv/W1ommQ5UdOXi5jaETKJ9bwsDhwJnRflsiam4.png", "url": "https://ball-online.com/api/proxy/stream?tv=1334"}, 
  {"channel_id": "1603", "title": "lfctv พากษ์ไทย", "poster": "https://doodii.me/images/tv/vXC8NPY8b2EdTagfxOQgApExQmK1XT6lfctv.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1603"}, 
  {"channel_id": "960", "title": "AIS PLAY 1", "poster": "https://doodii.me/images/tv/RziUDnIsuVooOkZ7IdtFPb4ro94yY4iais1.png", "url": "https://ball-online.com/api/proxy/stream?tv=960"}, 
  {"channel_id": "1598", "title": "bundesliga1", "poster": "https://doodii.me/images/tv/npgNGZsc6XpTRHnb97qFr0ImbIZQxbnbd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1598"}, 
  {"channel_id": "1599", "title": "bundesliga2", "poster": "https://doodii.me/images/tv/HmJYFXMFxnzfbK7yNbbeb75mBvporDBbd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1599"}, 
  {"channel_id": "1602", "title": "bundesliga3", "poster": "https://doodii.me/images/tv/wEnzGRo6cvGNBSayRfo8Y3Y4nTwH2hobd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1602"}, 
  {"channel_id": "1485", "title": "PGA1", "poster": "https://doodii.me/images/tv/IDMwljCM9cxNONLDSNOEuqjnKJxwcUXpga.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1485"}, 
  {"channel_id": "1486", "title": "PGA2", "poster": "https://doodii.me/images/tv/jOZcMCQ3Y0oLy7kueuBZXbZk84kPceqpga.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1486"}, 
  {"channel_id": "1487", "title": "PGA3", "poster": "https://doodii.me/images/tv/1Un5xi1RsvoicCQ9l3K7rxk3GfW7rBOpga.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1487"}, 
  {"channel_id": "1232", "title": "SIAM 1", "poster": "https://doodii.me/images/tv/waUk2YPwyXpQrWbTnZmm1GhWhL8DWBgsiam1.png", "url": "https://ball-online.com/api/proxy/stream?tv=1232"}, 
  {"channel_id": "1589", "title": "เจลีค2", "poster": "https://doodii.me/images/tv/XAo7OrHFu2ze3buqxx2H4usitocmeaKj2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1589"}, 
  {"channel_id": "1578", "title": "BG SPORT2", "poster": "https://doodii.me/images/tv/eIycqJClT3yJIr1lqt3Bal09O7Lj8Wbbg2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1578"}, 
  {"channel_id": "1579", "title": "BG SPORT3", "poster": "https://doodii.me/images/tv/ChJt4rNZdLmjMtNqTEFK4QvjHFRLA3Gbg3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1579"}, 
  {"channel_id": "1591", "title": "BG SPORT4", "poster": "https://doodii.me/images/tv/6OEnlwvjei5zKulLcCEfBm6lboPupfYbg4.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1591"}, 
  {"channel_id": "1251", "title": "NFL 52", "poster": "https://doodii.me/images/tv/15mXDl4SVLlqS6blTgmG3ECuFFFqLzvNFL_52.png", "url": "https://ball-online.com/api/proxy/stream?tv=1251"}, 
  {"channel_id": "1250", "title": "NFL 53", "poster": "https://doodii.me/images/tv/ksCwZoxMYW5ft7BttM8A5JYbVOsJXvNNFL_53.png", "url": "https://ball-online.com/api/proxy/stream?tv=1250"}, 
  {"channel_id": "1543", "title": "มวยไทย", "poster": "https://doodii.me/images/tv/ds8tr0ownL0STEl4dq0SNaOBLoJg95Kมวย.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1543"}, 
  {"channel_id": "987", "title": "AIS PLAY 2", "poster": "https://doodii.me/images/tv/4uJiK3DhZb82mr6lq8Cl4dv3oKiiZCKais2.png", "url": "https://ball-online.com/api/proxy/stream?tv=987"}, 
  {"channel_id": "977", "title": "One31", "poster": "https://doodii.me/images/tv/xX2QMC7Acg5RzQVU8RT9Y6h34kLXfWhone.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=977"}, 
  {"channel_id": "1158", "title": "DOODII SPORT", "poster": "https://doodii.me/images/tv/1OR2jLBse3BLwxbBNpMcv75ohyQqzmGdoodiisport.png", "url": "https://ball-online.com/api/proxy/stream?tv=1158"}, 
  {"channel_id": "1179", "title": "MOTOGP", "poster": "https://doodii.me/images/tv/zNioCd6XUtuk05NnQ0bSX2WLaNjgufbmotogp.png", "url": "https://ball-online.com/api/proxy/stream?tv=1179"}, 
  {"channel_id": "1584", "title": "one samurai", "poster": "https://doodii.me/images/tv/xeRNXa8MPlX3ToeIMRq6UVzGGdlrRCpones.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1584"}, 
  {"channel_id": "988", "title": "AIS PLAY 3", "poster": "https://doodii.me/images/tv/vvN9KtCxQiePrrD3JZ1w4zau0TtwKgyais3.png", "url": "https://ball-online.com/api/proxy/stream?tv=988"}, 
  {"channel_id": "1465", "title": "เจลีค3", "poster": "https://doodii.me/images/tv/07cAlZj0KVqLJFfyVwGh3DG0IQ5cOt9j1.png", "url": "https://ball-online.com/api/proxy/stream?tv=1465"}, 
  {"channel_id": "1581", "title": "FIVB2", "poster": "https://doodii.me/images/tv/13CJcZX3P98GcIjxS937isFGlTUPN02fivb1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1581"}, 
  {"channel_id": "1582", "title": "FIVB3", "poster": "https://doodii.me/images/tv/AadB39f4q8QrENpQTslQUrnSvT22Il2fivb1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1582"}, 
  {"channel_id": "1583", "title": "FIVB4", "poster": "https://doodii.me/images/tv/QTeF5jzwjcBLTjGJ5JAKqhAARpYvwXQfivb1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1583"}, 
  {"channel_id": "1169", "title": "VOLLEBALL 1", "poster": "https://doodii.me/images/tv/yuHJ0T69AHHoZJfvOzuOmXyA6V7tqIfvnl.png", "url": "https://ball-online.com/api/proxy/stream?tv=1169"}, 
  {"channel_id": "951", "title": "gmm25", "poster": "https://doodii.me/images/tv/eMFGW0rNrSGtKAeDvotD4EaRpLqMx5agmm.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=951"}, 
  {"channel_id": "1576", "title": "อนิเมะพลัส", "poster": "https://doodii.me/images/tv/HIYlIqtRvjbD5uz2Qvwlei5aZcZGvdMane.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1576"}, 
  {"channel_id": "1505", "title": "FILMHD1", "poster": "https://doodii.me/images/tv/sXGRz54POgMrmZu6NcuTofqW4u1SGxHfilm1.png", "url": "https://ball-online.com/api/proxy/stream?tv=1505"}, 
  {"channel_id": "1506", "title": "FILMHD2", "poster": "https://doodii.me/images/tv/F17IxA7FtwRvtYhrfdrzS0GLaT6ZPFdtruefilm2.png", "url": "https://ball-online.com/api/proxy/stream?tv=1506"}, 
  {"channel_id": "1491", "title": "ATP1", "poster": "https://doodii.me/images/tv/q6BHwpVZNBMYSEIA4dPNms6hnDHcSKbatp.png", "url": "https://ball-online.com/api/proxy/stream?tv=1491"}, 
  {"channel_id": "1492", "title": "ATP2", "poster": "https://doodii.me/images/tv/dxErYYjSk3iB7IhQIFwRKkCWVjXF2zLatp.png", "url": "https://ball-online.com/api/proxy/stream?tv=1492"}, 
  {"channel_id": "1493", "title": "ATP3", "poster": "https://doodii.me/images/tv/20UwgzljQaR6iWKY9RESCTqVFiuo9Bsatp.png", "url": "https://ball-online.com/api/proxy/stream?tv=1493"}, 
  {"channel_id": "1557", "title": "VOLLEBALL 2", "poster": "https://doodii.me/images/tv/VolTkhZDeSdCE0yk59hk0HBFfLY0DMHvnl2.png", "url": "https://ball-online.com/api/proxy/stream?tv=1557"}, 
  {"channel_id": "1567", "title": "VOLLEBALL 3", "poster": "https://doodii.me/images/tv/yyGPWnpnvdNlitkXEhpiRJWKY78w15jvnl2.png", "url": "https://ball-online.com/api/proxy/stream?tv=1567"}, 
  {"channel_id": "1575", "title": "Variety", "poster": "https://doodii.me/images/tv/fNMf57ZZPCFk52oga8nbcZV0HM9KJnKva.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1575"}, 
  {"channel_id": "1572", "title": "movie1", "poster": "https://doodii.me/images/tv/zgeYpjboFfeJAWZQMjliqWApXutckqDm1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1572"}, 
  {"channel_id": "1573", "title": "movie2", "poster": "https://doodii.me/images/tv/ux6HzYnddoB5R8jYr1wUzK5o21PrLS9m2.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1573"}, 
  {"channel_id": "1574", "title": "movie3", "poster": "https://doodii.me/images/tv/rgUkOBTMCpnySzLUQ3xoP9g5eIM1hwRm3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1574"}, 
  {"channel_id": "1490", "title": "CAGE WARRIORS", "poster": "https://doodii.me/images/tv/k3WLfYTMYw16H398gLOy8pLSiKbyVbQcw-201-warriors.png", "url": "https://ball-online.com/api/proxy/stream?tv=1490"}, 
  {"channel_id": "1518", "title": "TRUE AF 2026", "poster": "https://doodii.me/images/tv/ZtQ604BW4gaGEtb5zze0P6Bd31zvXQ9af.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1518"}, 
  {"channel_id": "1327", "title": "PRIME", "poster": "https://doodii.me/images/tv/Hr8R3h7z8Kh9z39l6RABuMgNDcWBPvDprime.png", "url": "https://ball-online.com/api/proxy/stream?tv=1327"}, 
  {"channel_id": "1510", "title": "rockxtream", "poster": "https://doodii.me/images/tv/iAueBakeGoia2PsABO8m34jMVmfMuvbrockx.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1510"}, 
  {"channel_id": "1559", "title": "zufaboxing", "poster": "https://doodii.me/images/tv/aXD9aOsXh3MQwhsRnZFloTv9SZ4w2TWhero__zuffa-boxing-logo-0232a741910b3924b65e4e19ca87c6c34c8cd95dadad9caae59f03d9da66e743.png", "url": "https://ball-online.com/api/proxy/stream?tv=1559"}, 
  {"channel_id": "1507", "title": "sv.league1", "poster": "https://doodii.me/images/tv/h5ukqNMrO5Cp49YHTbtoUyyIhSMDsPPsv_leauge.png", "url": "https://ball-online.com/api/proxy/stream?tv=1507"}, 
  {"channel_id": "1136", "title": "premierfootball3", "poster": "https://doodii.me/images/tv/YuMBTxlIv1a44jO9uZQbSxfyXqtTNcMpl3.png", "url": "https://ball-online.com/api/proxy/stream?tv=1136"}, 
  {"channel_id": "1005", "title": "true4u", "poster": "https://doodii.me/images/tv/DDEyT8tuncKE5wdaANUCX4aQ7d7CtO5t4u.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1005"}, 
  {"channel_id": "1134", "title": "premierfootball5", "poster": "https://doodii.me/images/tv/Eqxg287lvkw7es0u3k3uoy6aUhnW8wLpl5.png", "url": "https://ball-online.com/api/proxy/stream?tv=1134"}, 
  {"channel_id": "1415", "title": "BEIN9", "poster": "https://doodii.me/images/tv/eDkVP1kFXQBZQm0kJ5Q3yE5k1YcDprf20240831143312Bein9.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1415"}, 
  {"channel_id": "1508", "title": "sv.league2", "poster": "https://doodii.me/images/tv/joAzysGwYFDqEBJptoXszAXSRQ9A9yJsv_leauge.png", "url": "https://ball-online.com/api/proxy/stream?tv=1508"}, 
  {"channel_id": "1548", "title": "ATP4", "poster": "https://doodii.me/images/tv/iZlSUpHJxt4PPoRPA8xdDd92Xqq5v4Zatp.png", "url": "https://ball-online.com/api/proxy/stream?tv=1548"}, 
  {"channel_id": "1234", "title": "SIAM 6", "poster": "https://doodii.me/images/tv/HkpLHRCX5aW4BtkgGvptZYbybf4fKF6siam6.png", "url": "https://ball-online.com/api/proxy/stream?tv=1234"}, 
  {"channel_id": "1235", "title": "SIAM 7", "poster": "https://doodii.me/images/tv/cZcCgwJJYfVkXpuYbPEIryitiw3wd4Bsiam7.png", "url": "https://ball-online.com/api/proxy/stream?tv=1235"}, 
  {"channel_id": "1236", "title": "SIAM 8", "poster": "https://doodii.me/images/tv/zSbJmeFviEoBcbkMrkDD73SdRbyZgu1siam8.png", "url": "https://ball-online.com/api/proxy/stream?tv=1236"}, 
  {"channel_id": "1532", "title": "avc women's champions league 2026", "poster": "https://doodii.me/images/tv/Ow05KAY7llQCNqMpkJvCiNtvYUYF6MBAVC_Champions_League.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1532"}, 
  {"channel_id": "1237", "title": "SIAM 9", "poster": "https://doodii.me/images/tv/OhpoK0ArbZJxL0UOkJtkNgISI2RKmiXsiam9.png", "url": "https://ball-online.com/api/proxy/stream?tv=1237"}, 
  {"channel_id": "1515", "title": "BG SPORT2", "poster": "https://doodii.me/images/tv/xEsONuT0IBbFMxibXXfDXI813R0QKuZbg.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1515"}, 
  {"channel_id": "1242", "title": "BEIN5", "poster": "https://doodii.me/images/tv/1VR2OkliOftzscIEyP0YlW6BEVkGDdE20240418192717Bein5.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1242"}, 
  {"channel_id": "1156", "title": "SKYSPORT F1", "poster": "https://doodii.me/images/tv/LzH2Jm9iBz9UYHa4oqQnUaOLseurz0nsky.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1156"}, 
  {"channel_id": "1174", "title": "DAZN", "poster": "https://doodii.me/images/tv/IztdMFZOkKwC5YwdN6UuHMT9rutb4LGdazn.png", "url": "https://ball-online.com/api/proxy/stream?tv=1174"}, 
  {"channel_id": "1180", "title": "MOTO GP1", "poster": "https://doodii.me/images/tv/BfZnBGeMiOynCRQNxK9HujqjtuaoJsYmotogp1.webp", "url": "https://ball-online.com/api/proxy/stream?tv=1180"}, 
  {"channel_id": "1133", "title": "beinsport1 สำรอง", "poster": "https://doodii.me/images/tv/GlLPvVSVo1pu83f7b0Z4WuHUuAltNkv20240418192615Bein1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1133"}, 
  {"channel_id": "1238", "title": "SIAM 10", "poster": "https://doodii.me/images/tv/PHUGggqGJPXTRGQDk1L3D4yHZ17LRc2siam10.png", "url": "https://ball-online.com/api/proxy/stream?tv=1238"}, 
  {"channel_id": "1454", "title": "volleyball3", "poster": "https://doodii.me/images/tv/IgEPxW0E0byFsT0EStRmgRiYWSKvCibvolleeyball3.png", "url": "https://ball-online.com/api/proxy/stream?tv=1454"}, 
  {"channel_id": "1176", "title": "SKY SPORT GOLF", "poster": "https://doodii.me/images/tv/dLzJnfUYx9cOUxgzoNaCaD0Ru3NRypGskygolf.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1176"}, 
  {"channel_id": "989", "title": "AIS PLAY 4", "poster": "https://doodii.me/images/tv/pBivjaUbfo4dNnCbcyFpXPE1fL9YIV0ais4.png", "url": "https://ball-online.com/api/proxy/stream?tv=989"}, 
  {"channel_id": "1424", "title": "trueballthai 6", "poster": "https://doodii.me/images/tv/FHnbI2tsRtbBWT4RfDphkDaX9R1bwYeball6.png", "url": "https://ball-online.com/api/proxy/stream?tv=1424"}, 
  {"channel_id": "1262", "title": "BEIN 7", "poster": "https://doodii.me/images/tv/nAy5E2VmH2v4YHFSTCh32N70bFYhv0M20240418195754Bein7.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1262"}, 
  {"channel_id": "1263", "title": "BEIN 8", "poster": "https://doodii.me/images/tv/gQnoe855WWd66F3iIqSaz9wyZBle1wM20240831143535Bein8.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1263"}, 
  {"channel_id": "1414", "title": "BEIN10", "poster": "https://doodii.me/images/tv/ctZWz3D2UPvvRmLF06juBxRptiV5e3X20240831143640Bein10.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1414"}, 
  {"channel_id": "1163", "title": "WWE", "poster": "https://doodii.me/images/tv/jT0jlho8wtduxeXlAm5L6C0k93p6Liuwwe.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1163"}, 
  {"channel_id": "1229", "title": "SIAM 4", "poster": "https://doodii.me/images/tv/3MGnxHjiqGaWiKYApiWD4tJcexhG1wGsiam4.png", "url": "https://ball-online.com/api/proxy/stream?tv=1229"}, 
  {"channel_id": "1239", "title": "SIAM 11", "poster": "https://doodii.me/images/tv/JPiovcaOcw6JxaHJKC1p8TjTmhVr2wIsiam11.png", "url": "https://ball-online.com/api/proxy/stream?tv=1239"}, 
  {"channel_id": "1178", "title": "FIGHT SPORTS", "poster": "https://doodii.me/images/tv/atbaGS4vIcnw4EcmrMMC9NcxVrQIXYPFight-Sports-new.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1178"}, 
  {"channel_id": "1177", "title": "EURO SPORT 2", "poster": "https://doodii.me/images/tv/UVK9YQ0DBon1pyDLae8H1VarFR1l8zGeuro2.png", "url": "https://ball-online.com/api/proxy/stream?tv=1177"}, 
  {"channel_id": "1153", "title": "SPORT1", "poster": "https://doodii.me/images/tv/0qWam76vJvSLdmd5mFU3n7HOxlcEjBDSports-One.png", "url": "https://ball-online.com/api/proxy/stream?tv=1153"}, 
  {"channel_id": "1138", "title": "premierfootball1", "poster": "https://doodii.me/images/tv/WAtXZM9NCdJRwqtEMVGLxc28fGDrHxtpm1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1138"}, 
  {"channel_id": "1137", "title": "premierfootball2", "poster": "https://doodii.me/images/tv/pi8vklsfJHCGS07iThNjxgYuOUpjLXppl3.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1137"}, 
  {"channel_id": "1308", "title": "BTSPORT1", "poster": "https://doodii.me/images/tv/bMiqOD4ett6du7x3IXFepKceimBuPOvbt1.png", "url": "https://ball-online.com/api/proxy/stream?tv=1308"}, 
  {"channel_id": "1175", "title": "EURO SPORT1", "poster": "https://doodii.me/images/tv/azjGAldj0KY3QUFfemU1oVG6U1U7F4Feuro11.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1175"}, 
  {"channel_id": "1188", "title": "BBC NEW", "poster": "https://doodii.me/images/tv/TjhgsncD0X4htlQMVV5jlWpQkQNz7qGbccnew.png", "url": "https://ball-online.com/api/proxy/stream?tv=1188"}, 
  {"channel_id": "1182", "title": "CNN", "poster": "https://doodii.me/images/tv/XQjLqbLz82rTbXnsFY0q2Oh5bKkQHA5cnn.png", "url": "https://ball-online.com/api/proxy/stream?tv=1182"}, 
  {"channel_id": "1186", "title": "NHK WORLD", "poster": "https://doodii.me/images/tv/xppqkO5I1cWHux5Rt9GGh5qJxcLTNzwnhk.png", "url": "https://ball-online.com/api/proxy/stream?tv=1186"}, 
  {"channel_id": "1184", "title": "CNA", "poster": "https://doodii.me/images/tv/J9Cpj3ttC6Ar89g0zFYJTTFiuzeg2FRcna.png", "url": "https://ball-online.com/api/proxy/stream?tv=1184"}, 
  {"channel_id": "1185", "title": "FRANCE24", "poster": "https://doodii.me/images/tv/JS1u2aLckjbOWi9FSj8RYaunrTiaWzYfrance24.png", "url": "https://ball-online.com/api/proxy/stream?tv=1185"}, 
  {"channel_id": "1187", "title": "DW", "poster": "https://doodii.me/images/tv/ffW8LQlrrxVGDOYv77ddTQSY1v7rcvTdw.png", "url": "https://ball-online.com/api/proxy/stream?tv=1187"}, 
  {"channel_id": "1109", "title": "dreamwork", "poster": "https://doodii.me/images/tv/S3T92nCOTbuUOJ2bLrZnWLsLi5EtXiHa6FPatIZNxA6ZhyxpAh6bwYbmOSo8dg20240418205933Dream_Works1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1109"}, 
  {"channel_id": "1111", "title": "nickjr", "poster": "https://doodii.me/images/tv/OzCTNwdnEu3Nkngzl8BkH6iCXDaQQkBdPOLmB3hmouAXaWYQhdfEbrif0u9cS920240418203048Nickjr.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1111"}, 
  {"channel_id": "1114", "title": "CN (Cartoon Network)", "poster": "https://doodii.me/images/tv/Sc78ziVjHKYuh6dT1voGZM4p8raptsqNcvHmE4PWGStBqfxV5Qk3HvwBsD56sP20240418202927CN.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1114"}, 
  {"channel_id": "1110", "title": "nickelodeon", "poster": "https://doodii.me/images/tv/Zm0l36hhNYxV2dGCAILwAGoIEIBCJmPAlfmVwrDwSrZV0biVEJpv03oYOFLuzk20240418205237Nickelodeon.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1110"}, 
  {"channel_id": "1112", "title": "BOOMERANG", "poster": "https://doodii.me/images/tv/xUt5kCyFyRUYeQWjM0MhEgS7TgKJmbOIqiLs7vlurKg4hRq0rPgqwdCF5YMNOU20240418202911Boomerang.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1112"}, 
  {"channel_id": "1116", "title": "sparkplay", "poster": "https://doodii.me/images/tv/Vrc7RBbZY9phESnrcvbbGPz2YMxULzrz08Vj06eWps1tt0rkyZHVSVMGxXcZoOsi0g2jpm3bGScENXaq8ja7XeeZpuvLyRwMXzEryJWbKd50M6ycbUcpMNMDDcxg46065310-e599-11ed-96ec-4d05b9e2ca86_webp_original-removebg-preview.png", "url": "https://ball-online.com/api/proxy/stream?tv=1116"}, 
  {"channel_id": "1171", "title": "BOOM ANIME", "poster": "https://doodii.me/images/tv/MiDdGcWvoq8bLXAofUJxDdKhLWW3kz0boomaneme.png", "url": "https://ball-online.com/api/proxy/stream?tv=1171"}, 
  {"channel_id": "1107", "title": "xzyte", "poster": "https://doodii.me/images/tv/Xc3V3ddYpj3LEPj9H2gi4ICEZQcJ4AnSvWScgZOktSUGA0ZlAU8AQWai07BXRj20240418202134True_X-Zyte.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1107"}, 
  {"channel_id": "1266", "title": "FASHION TV", "poster": "https://doodii.me/images/tv/Vn6geMMGyCbXpQmLPwCCIFPyiu4cjJ220240418202717Fashion_TV.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1266"}, 
  {"channel_id": "1105", "title": "foodnetwork", "poster": "https://doodii.me/images/tv/YaeADhhJyiX4NlsTNPXxWEWq0fiSghq0HOWLLnWWYXVIb50svJQT83suHDINV120240418202640Food.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1105"}, 
  {"channel_id": "1099", "title": "AXN", "poster": "https://doodii.me/images/tv/sbkVDjE0jl2sMj4D5LcH2FKCOrgm44wOPtEbnbdQxFpq4wMFDm0btt8teMq3uz20240418201633AXN.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1099"}, 
  {"channel_id": "1108", "title": "asianfood", "poster": "https://doodii.me/images/tv/1wfxbPgip4OZBtgzAhKlAS0Q9uU0LEstZoRVmx6R92AIrgok1VgVdhXPJREkA620240418202628AFN.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1108"}, 
  {"channel_id": "1160", "title": "RUSH", "poster": "https://doodii.me/images/tv/v7fyzeJbrVorHJYD0YHCCKWM41qByw1rush.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1160"}, 
  {"channel_id": "1275", "title": "ALURE", "poster": "https://doodii.me/images/tv/3aOcHjcnCDxkWkXmLC62eFoPtJK1Ixbalure.png", "url": "https://ball-online.com/api/proxy/stream?tv=1275"}, 
  {"channel_id": "1095", "title": "rockaction entertainment", "poster": "https://doodii.me/images/tv/VxZsfihOB0qpt8ckoRgMmoA6Vs9O56iK4Pc9NN03sAeLhvDh8fbWiIkIlX7dFx20240418201026RockEnterment.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1095"}, 
  {"channel_id": "1091", "title": "rockaction", "poster": "https://doodii.me/images/tv/azy1A9CapFvb0rdth0SIamvBZzPUtFH6i64ZhEfDPGPSm4tss6ft3zlZXUM9wm20240418201014RockAction.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1091"}, 
  {"channel_id": "1173", "title": "MVTV ท้องถิ่นไทย", "poster": "https://doodii.me/images/tv/hO8gxcde3GJwxONXGniFKcuQbktEYFqmvtvท้องถิ่น.jfif", "url": "https://ball-online.com/api/proxy/stream?tv=1173"}, 
  {"channel_id": "1168", "title": "COOL", "poster": "https://doodii.me/images/tv/zbAV3ipvKn7v2wdBnfKhEjt1oYYvjXdcool.png", "url": "https://ball-online.com/api/proxy/stream?tv=1168"}, 
  {"channel_id": "1259", "title": "TLC", "poster": "https://doodii.me/images/tv/kWHZjQcrYq7xc6tWnfHFl6dSXwRMO7Utlc.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1259"}, 
  {"channel_id": "1077", "title": "SCI", "poster": "https://doodii.me/images/tv/T8U9wGLVglgZRs4oGaMN6ktsV76ioIbEWhw8dLW1GnwgrxG76dAEPVKbufSlq320240418210428TrueExploreSci.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1077"}, 
  {"channel_id": "1082", "title": "wild", "poster": "https://doodii.me/images/tv/Dc98XfsJVlmol48wpuFrP07YxtUk9XgrcqI50Ir5cF4EAohnHe0COIGqSFEPdt20240418210353TrueExploreWild.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1082"}, 
  {"channel_id": "1081", "title": "discovery", "poster": "https://doodii.me/images/tv/i741kofRHNtQ1iOTw4tIocbV9oEy3gBRm6cTJ2qpQIl4h3Sbg2L0O3SchU1P8p20240418210226Discovery.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1081"}, 
  {"channel_id": "1076", "title": "khongdee", "poster": "https://doodii.me/images/tv/w5fDOkiDKsG3X2gJY74MDeMoGMn1aLQของดี.png", "url": "https://ball-online.com/api/proxy/stream?tv=1076"}, 
  {"channel_id": "1079", "title": "samrujlok", "poster": "https://doodii.me/images/tv/8UcNPKTwY2iRNYgsglTYOg6yFXuZivYhwlqMfGYykYbQxa2INjot4HL3974ezW20240418211443SamRujLok.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1079"}, 
  {"channel_id": "1271", "title": "HISTORY", "poster": "https://doodii.me/images/tv/PcNxQMYR8As9Q3KoVKlDu63kiKEYz2Ohistory.png", "url": "https://ball-online.com/api/proxy/stream?tv=1271"}, 
  {"channel_id": "1083", "title": "mysci", "poster": "https://doodii.me/images/tv/lPwRuozq3Gx6e0kS5wzkh8UWCctTw8iul9B2XYZScocq2lk1Lpd3lK1YE25bHh20240418211511MySci.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1083"}, 
  {"channel_id": "1074", "title": "thainess", "poster": "https://doodii.me/images/tv/oZjMkrFBfofFwwcXaZCr9jhnas9lE5T1JZYoEILB5rlyNG9g2Iqz7JFz3aKKqMthainess.png", "url": "https://ball-online.com/api/proxy/stream?tv=1074"}, 
  {"channel_id": "1080", "title": "animalshow", "poster": "https://doodii.me/images/tv/lp97l9XDX6d8AFy9WaKAh5rWrYeflaAI8dHu0Wu2Wewg6OApRd4RkvepNgpprK20240418211432AnimalShow.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1080"}, 
  {"channel_id": "1072", "title": "mvtv", "poster": "https://doodii.me/images/tv/6LAtkurJ5Ps8UAzIsTzJ7JARJPfDLq4images.png", "url": "https://ball-online.com/api/proxy/stream?tv=1072"}, 
  {"channel_id": "954", "title": "ch 7", "poster": "https://doodii.me/images/tv/qC4vgvzc8kXUobveAhh78PBiUMdHzrX7hd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=954"}, 
  {"channel_id": "1011", "title": "AMARIN TV", "poster": "https://doodii.me/images/tv/30VuyNatO8KFEjakZQxifJdKi7qqc9pamarin.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1011"}, 
  {"channel_id": "950", "title": "thaipbs", "poster": "https://doodii.me/images/tv/SOarJ36YJ7knjqzeDHicZut4mLp1Op3tpbs.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=950"}, 
  {"channel_id": "1127", "title": "3HD", "poster": "https://doodii.me/images/tv/7ir5llTurOK522gxTIRKH7u9BowT8d41Ervzo24A48KRTrhArja3Oc06IV0oPG20240418191821ch3hd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1127"}, 
  {"channel_id": "953", "title": "thairath", "poster": "https://doodii.me/images/tv/dUIhR2pLr7lmoymvCPgvXNPN6YtDF72tr.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=953"}, 
  {"channel_id": "907", "title": "PPTV", "poster": "https://doodii.me/images/tv/nZBXTXtBCGq6lmsvaaZU2CU7IRRk166pptv.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=907"}, 
  {"channel_id": "1129", "title": "true24", "poster": "https://doodii.me/images/tv/WRXIDPjWHmTWtP9IC7XiqCzIMdbpzYNdg4cPn0lmuRerdrEXo9a4EohjNtaqqD20240418190115True4u.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1129"}, 
  {"channel_id": "957", "title": "workpointtv", "poster": "https://doodii.me/images/tv/FUkblYDaGUO0YwRRHGXzWbzIPFBmcuIwp.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=957"}, 
  {"channel_id": "1128", "title": "Ch8", "poster": "https://doodii.me/images/tv/hXKaBCYfjqfXTcNhk2q0PH2t9rP5xZlKLkKLHsc5TCE9xKr2uhfbKl4E50gTdq20240418191335ch8.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1128"}, 
  {"channel_id": "1004", "title": "tnn24", "poster": "https://doodii.me/images/tv/Dy5ZU94pDmx4fBGOzUHrz9wtKiYIAsCtnn.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1004"}, 
  {"channel_id": "1010", "title": "9mcot", "poster": "https://doodii.me/images/tv/YciY753IFNKtZxxzs1uXx9GOzp7NUfrmcot.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1010"}, 
  {"channel_id": "947", "title": "CH 5", "poster": "https://doodii.me/images/tv/z9eEiP2NMjiU2M1tp8hVCHJ0mxDUBCj5hd.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=947"}, 
  {"channel_id": "976", "title": "T Sport 7", "poster": "https://doodii.me/images/tv/BnXdTh8WP7njT6XKqkgyadiX1vrWvMTt7.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=976"}, 
  {"channel_id": "949", "title": "nbt", "poster": "https://doodii.me/images/tv/djdjCCVIxlO2zkbXQhIY7RInM8hHFmxnbt.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=949"}, 
  {"channel_id": "1165", "title": "TOPNEW", "poster": "https://doodii.me/images/tv/0a5Xi7dLfA9WO8JfHQTUo0yzK8mfoFTCropped-topnews-logo.png", "url": "https://ball-online.com/api/proxy/stream?tv=1165"}, 
  {"channel_id": "1164", "title": "NEW1", "poster": "https://doodii.me/images/tv/Q2P94Ud3ZcxI9j2DLrtjuuD9E6ueJmfnew1.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1164"}, 
  {"channel_id": "1162", "title": "JKN18", "poster": "https://doodii.me/images/tv/P0CfWlXbgCmgvDsXoq3VEROimff8wXNjkn03.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1162"}, 
  {"channel_id": "1161", "title": "NATION", "poster": "https://doodii.me/images/tv/DueSGUHfDYyOFVLwB3DTeanr58PTkcKnation.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1161"}, 
  {"channel_id": "1096", "title": "warnertv", "poster": "https://doodii.me/images/tv/voD4UhtkptUia0ChDUsCO85sUUji39ClnhTy54ILgW2V6iIfImfNQDXbue7ShD20240418201607WBTV.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1096"}, 
  {"channel_id": "1092", "title": "cinemax", "poster": "https://doodii.me/images/tv/a0D0IGocEdt8yOEdg6bvq8OKYdJ047ADGhzhqmHAWDMNDPETWdhRwN49f3aZNb20240418201426cinemax.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1092"}, 
  {"channel_id": "1089", "title": "moviehits", "poster": "https://doodii.me/images/tv/4e44DOPsP7P5QL1fGM2SgLNhnRule6D0DJflh9m4CLJDWrnizbTq3DOy2CGwV620240418202419True_MoviesHits.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1089"}, 
  {"channel_id": "1098", "title": "asian more", "poster": "https://doodii.me/images/tv/IuKRjQHhsvYItwIv296VBGvNJyQIba4nA5XXnod0iJuyJ4vxRywiSoIA3gmh2J20240418202614True_Asian_More.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1098"}, 
  {"channel_id": "1101", "title": "hbohit", "poster": "https://doodii.me/images/tv/gnf90KRTGwIVMXwX3KGhvY5aAbyzWy8uyXGplZM5W71O1HzL7Gr0hLCBgvEiPE20240418201343HBO_Hits.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1101"}, 
  {"channel_id": "1094", "title": "thaifilm", "poster": "https://doodii.me/images/tv/Er5kcrz7aqvB5tvkIdugLT2h9kuBz7AJHIIuSnpEfC8JDzdQxXZgisaeAiL8e820240418202437True_Thai_Film.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1094"}, 
  {"channel_id": "1093", "title": "filmasia", "poster": "https://doodii.me/images/tv/NCdly9mKAigkMVQNyYXcK3tqhQjo5wV81x2Nl74HoId9jVx38iOTlQwjhN4iJs20240418202244True_FilmAsia.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1093"}, 
  {"channel_id": "1088", "title": "celestial", "poster": "https://doodii.me/images/tv/WHAOsrxxDVrXTbafataucaoBwc2SHGR00CvZB8cq4dbIe029fNBbnFAVrgGr4o20240421154338CCM.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1088"}, 
  {"channel_id": "1104", "title": "HBOHD", "poster": "https://doodii.me/images/tv/kplaLFkprVKrTPw1J1gNxmNW4BRSpQGxgne8b2N8TFF2zoqlL9qx563tjAi77720240418201334HBO.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1104"}, 
  {"channel_id": "1103", "title": "trueserie", "poster": "https://doodii.me/images/tv/FOTUeHXI7yKQPYqEflKGwAzfvHrPLzVv79unUnFdpaxTAhWwfkqRN30UwLoQMk20240418202230True_Series.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1103"}, 
  {"channel_id": "1090", "title": "hbosignature", "poster": "https://doodii.me/images/tv/O7uiPwa2nxqh5HB54TYpwtSylO9RB866bxTkasNoA5EZTywm28K53syVtrHbNt20240418201358HBO_Signature.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1090"}, 
  {"channel_id": "1166", "title": "ASIAN HIT", "poster": "https://doodii.me/images/tv/GDcrUu7bBzuTrOy2DWgwfPsybo6lfehAsian-Hits.png", "url": "https://ball-online.com/api/proxy/stream?tv=1166"}, 
  {"channel_id": "1100", "title": "hbofamily", "poster": "https://doodii.me/images/tv/kskUB8NfqWcHpZKadWsVkezy6EAgFAmrhHj4BH3dHp9BUycAQycjZVhP0dxcPg20240418201412HBO_Family.jpg", "url": "https://ball-online.com/api/proxy/stream?tv=1100"}
];

// Verified public HLS streams for testing & demo
const testPublicStreams: Channel[] = [
  {
    id: 'demo_thaipbs',
    name: 'Thai PBS Live (HD)',
    url: 'https://thaipbs-live.cdn.byteark.com/live/playlist.m3u8',
    logo: 'https://doodii.me/images/tv/SOarJ36YJ7knjqzeDHicZut4mLp1Op3tpbs.jpg',
    category: 'thaidigtv',
    groupTitle: 'ดิจิทัลทีวี',
    resolution: 'Full HD',
    isLive: true,
    isCustom: false,
    description: 'สถานีโทรทัศน์ไทยพีบีเอส ช่องหมายเลข 3 รายการข่าวและสารคดีสด 24 ชม.',
    currentProgram: 'ข่าวค่ำมิติใหม่ทั่วไทย',
    nextProgram: 'ตอบโจทย์ ประเด็นร้อน'
  },
  {
    id: 'demo_aljazeera',
    name: 'Al Jazeera English HD (Live)',
    url: 'https://live-hls-web-aje.getaj.net/AJE/03.m3u8',
    logo: 'https://ui-avatars.com/api/?name=AJE&background=c2410c&color=ffffff&size=200',
    category: 'news',
    groupTitle: 'ข่าวสารสากล',
    resolution: 'Full HD',
    isLive: true,
    isCustom: false,
    description: 'Al Jazeera English Global Live News Broadcast 24/7',
    currentProgram: 'World News Live',
    nextProgram: 'Counting the Cost'
  },
  {
    id: 'demo_bbb_vod',
    name: 'Big Buck Bunny (Replay & VOD Sample)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    logo: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    category: 'anime',
    groupTitle: 'การ์ตูน & แอนิเมชัน',
    resolution: 'Full HD',
    isLive: false,
    isCustom: false,
    description: 'ภาพยนตร์แอนิเมชันความละเอียดสูง รองรับการเล่นย้อนหลังและเลื่อนแถบเวลา (DVR/Catch-up Demo)',
    currentProgram: 'Big Buck Bunny Open Movie',
    nextProgram: 'Behind the Scenes'
  },
  {
    id: 'demo_tears_vod',
    name: 'Tears of Steel (Sci-Fi Movie Demo)',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    logo: 'https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg',
    category: 'movies',
    groupTitle: 'ภาพยนตร์ & ซีรีส์',
    resolution: '4K',
    isLive: false,
    isCustom: false,
    description: 'ภาพยนตร์ Sci-Fi 4K Ultra HD ทดสอบเสียงแบบมัลติแชนแนลและการข้ามย้อนหลัง',
    currentProgram: 'Tears of Steel 4K',
    nextProgram: 'VFX Breakdown'
  }
];

// Deduplicate and map prompt channels
export const DEFAULT_CHANNELS: Channel[] = (() => {
  const seenIds = new Set<string>();
  const list: Channel[] = [...testPublicStreams];

  rawChannels.forEach((item) => {
    if (!item.channel_id || seenIds.has(item.channel_id)) return;
    seenIds.add(item.channel_id);

    const category = categorizeChannel(item.title);
    let resolution = 'HD';
    if (item.title.toLowerCase().includes('full hd') || item.title.toLowerCase().includes('1080')) {
      resolution = 'Full HD';
    } else if (item.title.toLowerCase().includes('4k')) {
      resolution = '4K';
    }

    list.push({
      id: item.channel_id,
      name: item.title,
      url: item.url,
      logo: item.poster,
      category,
      groupTitle: getCategoryTitleThai(category),
      resolution,
      isLive: true,
      isCustom: false,
      currentProgram: 'กำลังออกอากาศสด (Live Broadcast)',
      nextProgram: 'รายการถัดไปตามผังสถานี'
    });
  });

  return list;
})();

export function getCategoryTitleThai(cat: string): string {
  switch (cat) {
    case 'sports':
      return 'กีฬา & ฟุตบอล';
    case 'thaidigtv':
      return 'ดิจิทัลทีวีไทย';
    case 'movies':
      return 'ภาพยนตร์ & ซีรีส์';
    case 'anime':
      return 'การ์ตูน & อนิเมะ';
    case 'documentary':
      return 'สารคดี & การเรียนรู้';
    case 'news':
      return 'ข่าวสารทันเหตุการณ์';
    case 'variety':
      return 'วาไรตี้ & บันเทิง';
    default:
      return 'ทั่วไป';
  }
}
