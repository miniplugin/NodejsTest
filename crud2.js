/**
 * 이 JS는 Mysql 데이터베이스 CRUD하는 앱 입니다.
 * 결과 화면 진입점은 http://localhosts:3000/ (사용자 리스트화면)
 * 로그인 : http://localhost:3000/public/login.html
 * 사용자등록: http://localhost:3000/public/adduser.html
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

//에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require("express-session");

// Mysql 데이터베이스를 사용할 수 있도록 하는 모듈 불러오기
var mysql = require('mysql');

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

//body-parser에서 form-urlencoding 설정
app.use(bodyParser.urlencoded({extended:false}));
//body-parser에서 json파싱설정
app.use(bodyParser.json());

// public 폴더를 static 콘텐츠 공간으로 생성
app.use('/public', static(path.join(__dirname,'public')));

// 쿠기파서 설정
app.use(cookieParser());

//세션 설정
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

// 데이터베이스 커넥션 확인
if(pool) {
    pool.getConnection(function(err,conn){
        if(err) {
            console.log("데이버베이스 pool에러");
            if(conn) {
                console.log("conn 해제");
                conn.release();//연결이 있다면 해제;
            }
            return;
        }
        conn.query("select * from users");
        conn.on('error',function(err){
            console.log('데이터베이스 연결 시 에러가 발생했습니다.');
            console.dir(err);
            return;
        });
        console.log('데이터베이스 연결이 정상 입니다.');
    });
}

// 라우팅 시작(URL매핑 스프링의 컨트롤러)
var router = express.Router(); //URL매핑 객체생성

// 초기페이지 연결
router.route('/').get(function(req,res){
    res.status(200);
    res.sendFile(path.join(__dirname,'public','listuser2.html'));
});



// 라우터 /를 기본설정
app.use('/',router);

//에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404':'./public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));//객체등록
app.use(errorHandler);//객체등록

// 프로세서 종료시 데이터베이스 연결 해제
process.on('SIGTERM', function(){
    console.log("프로세스가 종료됩니다.");
    if(conn) { conn.release(); }
});
app.on('close', function(){
    console.log("앱이 종료됩니다.");
    if(conn) { conn.release(); }
});

// Express서버 시작 명령(아래)
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트:' + app.get('port'));
});