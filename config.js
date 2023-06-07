/*
   Copyright 2021 The MITRE Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var config = {};

config.appname = "COSA API Server"
config.version = "0.9"
config.port = 8888;

// HTTPS configurations
config.https = {};
config.https.enabled = false;
config.https.certificate = "./server.cert";
config.https.key =  "./server.key";

// To enable antivirus scanning on artifacts
config.clamAV = {};
config.clamAV.host = '128.29.34.69';
config.clamAV.port = 3310;
config.clamAV.active = false;

// Mysql connection configurations
// These should match the COSA dashboard server
config.mysql = {}
config.mysql.host =     process.env.COSA_MYSQL_HOST || '<COSA_MYSQL_HOST>';
config.mysql.user =     process.env.COSA_MYSQL_USER || '<COSA_MYSQL_USER>';
config.mysql.password = process.env.COSA_MYSQL_PASSWORD || '<COSA_MYSQL_PASSWORD>';
config.mysql.database = process.env.COSA_MYSQL_DATABASE || '<COSA_MYSQL_DATABASE>';

// These user and password pairs need to be configured by the administrator.
config.users = {}
config.users[process.env.COSA_API_USER||"<COSA_API_USER>"] = process.env.COSA_API_PASSWORD || "COSA_API_PASSWORD";
//config.users.api_user = "api_user"; // example 

module.exports = config;
