import React, { useState, useEffect } from 'react';
import { SideBar, Header } from "../components";
import { Home, Assignment, Setting, Error, SubmissionStatus, SetAssignment, Scoring, SetStudentList, Test1, Test2, TestHome } from "../pages";
import "./pages.css";
import clsx from 'clsx';
import axios from "axios";
import { Route, Link } from 'react-router-dom';

import { Grid } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { set } from 'date-fns';
import { getMajorStr } from '../shared/MajorDictionary';

// jwt 추가
const jwt = require('jsonwebtoken');

/* style definition => 대부분 css로 옮길 예정 */

const drawerWidth = 300;
const useStyles = makeStyles((theme) => ({
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(4),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));


/* main pages */
function Main(props) {
  /* drawer 코드 */
  const classes = useStyles();
  const [open, setOpen] = useState(true); // header와 drawer에 동시 적용되어야하기 때문에 Main에 저장
  const [user, setUser] = useState(undefined);
  const [sideAssign, setSideAssign] = useState(undefined);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  
  const handleDrawerClose = () => {
    setOpen(false);
  };

  function getCookie(name) {
    let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
  };

  function getUserInfo(){
    try{
      const access_token = getCookie('access_token');
      const token = jwt.decode(access_token);

      // 사용자의 major (ex. 920 => 컴과, MajorDictionary.js에 정의되어 있음)
      // type이 1일 때만 setting
      // type이 0이면(교수면) default로 ""
      token.type = String(token.userNumber)[0] == '1' ? 0 : 1;
      const majorNumber = String(token.userNumber).substring(4,7);
      if(token.type===0)
        token.major = "";
      else if(token.type===1)
        token.major = getMajorStr(majorNumber);

      return token;
    }catch(err){
      alert(`사용자 정보를 가져오는 중 오류가 발생하였습니다. (${err})`);
      window.location.href = "/";
    }
  }


  /*function getAssignmentInfo() {
    try {
      let response = await axios.get('/v1/assignment', { withCredentials: true });
      return response.data
    } catch (err) {
      const status = err.response.status;
      if (status === 400 || status === 401) {
        //console.log("과제 정보를 얻는데 실패하였습니다. 잘못된 요청입니다. (${status})");
        alert(`과제 정보를 얻는데 실패하였습니다. 잘못된 요청입니다. (${status})`);
      }
      else if (status === 404) {
        //console.log("과제를 찾을 수 없습니다.");
        alert("과제를 찾을 수 없습니다.");
      }
      else if (status === 500) {
        //console.log("내부 서버 오류입니다. 잠시 후에 다시 시도해주세요...");
        alert("내부 서버 오류입니다. 잠시 후에 다시 시도해주세요...");
      }
      window.location.href = "/";
    }
    return [];
  }*/

  useState(() => {
    setUser(getUserInfo());
    console.log(user);

    axios.get('/v1/assignment', { withCredentials: true })
      .then(res => {
        let assign = res.data;
        let sAssign = [];
        for (let i = 0; i < assign.length; i++) {
          // id: 0, title : 1, state : 2
          sAssign.push(
            [
              assign[i].assignmentId,
              assign[i].assignmentName,
              assign[i].assignmentState
            ]);
        }

        setSideAssign(sAssign);
      })
      .catch(err => {
        const status = err.response.status;
        if (status === 400 || status === 401) {
          alert(`과제 정보를 얻는데 실패하였습니다. 잘못된 요청입니다. (${status})`);
        }
        else if (status === 404) {
          alert("과제를 찾을 수 없습니다.");
        }
        else if (status === 500) {
          alert("내부 서버 오류입니다. 잠시 후에 다시 시도해주세요...");
        }
        window.location.href = "/";
      })
  }, []);

  /*
  useEffect(() => {
    async function fetchData() {
      setUser(await getUserInfo());
      setAssign(await getAssignmentInfo());
    }

    fetchData();
  }, [user.userId]);

  useEffect(()=>{
    async function updateType() {
      // 사용자의 type (교수 0, 학생 1)
      setType((String(user.userNumber).charAt(0) === '1') ? 0 : 1);
    }

    updateType();
  }, [user.userNumber]);

  useEffect(()=>{
    async function updateAssignments() {
      // SideBar로 넘길 "과제 제목"들
      let sAssign = [];
      // home으로 넘길 정보 정리
      let hAssign = [];

      for (let i = 0; i < assign.length; i++) {
        // id: 0, title : 1, state : 2
        sAssign.push(
          [
            assign[i].assignmentId,
            assign[i].assignmentName,
            assign[i].assignmentState
          ]);
      }

      for (let i = 0; i < assign.length; i++) {
        hAssign.push(
          [
            assign[i].assignmentId,
            assign[i].deadline,
            assign[i].assignmentName,
            assign[i].assignmentState
            //,assign[i].score => 없어졌음
          ]);
      }

      setSideAssign(sAssign);
      setHomeAssign(hAssign);
    };

    updateAssignments();
  }, [assign]);
  
  useEffect(()=>{
    function selectComponent(){
      /* select component from url 
      
  // url은 http://NERA서버/component/sub/last 순으로 구성되어있음
      const component = props.match.params.component;

      if (component == undefined) { // '/home' => Home.js

        // home component setting
        setContents(
          <Home
            type={type}
            userInfo={user}
            asInfo={homeAssign}
        />);
      } else { // 'home/' => 여러 컴포넌트로 분리
        if (type === 1) { // 학생이면
          switch (component) {
            case "assign": // 'home/assign' => Assignment.js
              if (sub != undefined) { // 'home/assign/:as_id' (as_id가 sub)
                setContents(
                    <Assignment
                      info={findAssignmentById(Number(sub), assign)}
                    />);
              } else { // 'home/assign' default page가 없음
                // 첫번째 과제 페이지로 redirect
                window.location.href = "/home/assign/1";
              }
              break;
            default: // 학생은 현재 Assignment 컴포넌트 말고 다른 컴포넌트가 없음
              setContents(<Error />);
          }
        } else if (type === 0) { // 교수이면
          switch (component) {
            case "assign": // 'home/assign' => SubmissionStatus.js
              if (sub != undefined) {
                setContents(<SubmissionStatus info={findAssignmentById(Number(sub), assign)} />); 
              } else { // 'home/assign' default page가 없음
                setContents(<Error/>);
              }
              break;

            case "setting":
              if (sub == undefined) { // 'home/setting' => Setting.js
                setContents(<Setting
                  as_info={assign}
                />);
              } else {
                if (sub === "add") { // 'home/setting/add' => SetAssignment.js
                  contents = <SetAssignment />;
                } else {
                  // add가 아닌 Number type이면 해당 id의 과제 설정창 => SetAssignment.js
                  setContents(
                    <SetAssignment
                      as_info={findAssignmentById(Number(sub), assign)}
                    />);
                }
              }
              break;

            case "scoring": // 'home/scoring/sub/last' => Scoring.js
              // sub, last가 둘 다 존재할 때만 동작
              // sub : 과제 번호, last : 학번
              if (sub != undefined && last != undefined)
                // TODO: API와 동기화를 시키면서 isAbleToMark와 selectAnswers를 사용하지 않기로 했으므로, 
                // 그 컴포넌트의 코드를 수정해야 함.
                setContents(<Scoring as_info={assign} number={Number(last)} />);
              else
                setContents(<Error />);
              break;

            case "setList": // 'home/setList' => SetStudentList.js
              if (sub != undefined) {
                setContents(<Error />);
              } else {
                setContents(<SetStudentList />);
              }
              break;

            default:
              setContents(<Error />);
          }
        } else {
          setContents(<Error />);
        }
      }
    }
    selectComponent();
  }, [assign]);*/

  /* rendering */
  return (
    <Grid container>
      <CssBaseline />

      {user != undefined &&
        <Header
          drawerOpen={handleDrawerOpen}
          open={open}
          type={user.type}
          name={user.userName}
        />}

      {user != undefined && sideAssign != undefined &&
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <SideBar
            type={user.type}
            drawerClose={handleDrawerClose}
            assignment_info={sideAssign}
          />
        </Drawer>}

      <Grid
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        }, "margin-top-64", "contents_side")}
      >
        <Route exact path="/home" component={Home}/>
        <Route exact path="/home/assignment/:as_id" component={Home}/>
      </Grid>
    </Grid>
  )
}

export default Main