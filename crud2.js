/**
 * 이 JS는 Mysql 데이터베이스 CRUD하는 앱 입니다.
 * 결과 화면 진입점은 http://localhost:3000/ (사용자 리스트화면)
 * 로그인 : http://localhost:3000/public/login.html
 * 사용자등록: http://localhot:3000/public/adduser.html
 */
// Express 프레임워크 기본 모듈들 불러오기
var express = require('express')
, http = require('http')
, path = require('path');

// Express용 미들웨어 모듈 불러오기
var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

// Mysql 데이터베이스를 사용할 수 있도록 하는 모듈 불러오기
var mysql = require('mysql');
const { callbackify } = require('util');

// Mysql 데이터베이스 연결 설정
var pool = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'root',
    password:'apmsetup',
    database:'nodejs',
    debug:false
});

// 익스프레스 객체 생성(실행가능한 변수생성)
var app = express();

// 기본환경설정 env 들어있는 port정보 또는 지정한 3000 웹서버 포트 생성
app.set('port', process.env.PORT || 3000);

// public 폴더를 static 콘텐츠 공간으로 생성
app.use('/pulbic', static(path.join(__dirname,'public')));

// 데이터베이스 커넥션 확인
//if(pool) {
    pool.getConnection(function(err, conn){
        if(err) {
            if(conn) {
                conn.release();//연결이 있다면 해제;
            }
            return;
        }
        conn.on('error',function(err){
            console.log('데이터베이스 연결 시 에러가 발생했습니다.');
            console.dir(err);
        });
    });
//}