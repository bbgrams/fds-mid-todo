import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from 'axios'

// axios 인스턴스 만들기
const api = axios.create({
  baseURL: 'https://merciful-mammal.glitch.me/'
})

// 로컬스토리지에 토큰이 저장되어있으면 요청에 토큰을 포함시키고
// 로컬스토리지에 토큰이 없으면 요청에 토큰을 포함시키지 않음.
api.interceptors.request.use(function(config) {
  // localStorage에 token이 있으면 요청에 헤더 설정, 없으면 아무것도 하지 않음
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

const templates = { // 이 객체를 계속 복사해서 쓸 것임
  loginForm: document.querySelector('#login-form').content,
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content,

}
const rootEl = document.querySelector('.root')

function drawLoginForm(){

  // 1. 템플릿 복사하기
  const fragment = document.importNode(templates.loginForm, true) // 한 벌 복사 완료

  // 2. 내용 채우고, 이벤트 리스너 등록하기
  const loginFormEl = fragment.querySelector('.login-form')

  loginFormEl.addEventListener('submit', async e => { // 이벤트 리스너 안에서 통신을 할 예정이니 비동기 함수로 진행
    e.preventDefault()
    // e : 이벤트 객체
    // e.target : 이벤트를 실제로 일으킨 요소 객체 (여기서는 loginFormEl)
    // e.target.elements : 폼 내부에 들어있는 요소 객체를 편하게 가져올 수 있는 특이한 객체
    // e.target.elements.username : name 어트리뷰트에 username 이라고 지정되어있는 인풋 요소 객체
    // e.target.elements.username.value : 사용자가 input태그에 입력한 값
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value;
    const res = await api.post('/users/login', { // 상단에 baseURL을 입력해줘서 서버주소전체를 입력해주지않아도 됨.
      username,
      password
    })
    localStorage.setItem('token', res.data.token)

    drawTodoList()
  })

  // 3. 문서 내부에 삽입하기
  rootEl.textContent = ''
  rootEl.appendChild(fragment)
}

async function drawTodoList(){
  const res = await api.get('/todos')
  // 응답받은 body의 데이터가 list에 들어있다.
  const list = res.data
  // 1. 템플릿 복사
  const fragment = document.importNode(templates.todoList, true)

  // 2. 내용 채우고 이벤트 리스너 등록하기
  // 배열에 있는 할일 항목들을 불러온 다음에 html의 li로
  const todoListEl = fragment.querySelector('.todo-list');
  const todoFormEl = fragment.querySelector('.todo-form');
  const todoItemEl = fragment.querySelector('.todo-item');
  const logoutEl = fragment.querySelector('.logout')

  // * 로그아웃 기능. 절차 :
  logoutEl.addEventListener('click', e => { // 서버에 요청 보낼 일이 없기 때문에 비동기로 제어하지 않음.
    // 1. 토큰 삭제
    localStorage.removeItem('token')
    // 2. 로그인 폼 보여주기
    drawLoginForm()
  })

  todoFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const body = e.target.elements.body.value
    const res = await api.post('/todos', {
      body,
      complete : false
    })
    if(res.status === 201){ // 불러오는것에 성공했다면
      drawTodoList() // 사실 axios 는 불러오는것에 성공하면 자동으로 다음 소스를 진행 함. 불러오지 못하면 자동으로 에러를 출력.
    }
  })

  list.forEach(todoItem => { // todoitem템플릿을 복사해서 todoitem템플릿에 넣어준다
    // 1. 템플릿 복사
    const fragment = document.importNode(templates.todoItem, true)

    // 2. 내용 채우고 이벤트 리스너 등록하기
    const bodyEl = fragment.querySelector('.body')
    const deleteEl = fragment.querySelector('.delete')
    const completeEl = fragment.querySelector('.complete');

    if(todoItem.complete){ // complete가 true면 (=할일을 체크하면)
      // checked라는 attribute가 인풋박스에 붙었다. checked = boolean attribute
      completeEl.setAttribute('checked', '')
    }

    // * 할일 체크 기능
    completeEl.addEventListener('click', async e =>{
      e.preventDefault();
      await api.patch('/todos/' + todoItem.id,{
        // 원래 true였으면 !true(=false)로 바꾸고, 원래 false면 !false(=true)로 바꿔준다
        // 길게 풀면 if~로도 할 수 있음.
        complete : !todoItem.complete
      })
      drawTodoList()
    })


    // * 항목 삭제 기능
    deleteEl.addEventListener("click", async e => {
      // 삭제 요청 보내기
      await api.delete('/todos/' + todoItem.id)

      // 성공 시 할 일 목록 다시 그리기
      // await가 성공하면 자동으로 아래 코드가 실행되고, 실패하면 코드가 실행되지 않는다.
      drawTodoList()
    });

    bodyEl.textContent = todoItem.body
    // 3. 문서 내부에 삽입하기
    todoListEl.appendChild(fragment)
  })

  // 3. 문서 내부에 삽입하기
  rootEl.textContent = '';
  rootEl.appendChild(fragment)
}

// * 만약 로그인을 한 상태(= 로컬스토리지에 토큰이 저장되어있는 상태)라면 바로 파일 목록을 보여주고
// 만약 로컬스토리지에서 토큰을 가져올 수 있으면 true(저장되어있는 값을 가져오면 true)
if(localStorage.getItem('token')){
  drawTodoList()
}else{
  // 아니라면 로그인 폼을 보여준다. (저장되어있지 않는 가져오려고 하면 null(false)가 뜬다.)
  drawLoginForm()
}


// * 로그아웃 기능 (=토큰을 지우는 것. 우리는 로컬스토리지에 토큰을 저장하니까.)
// 로그아웃 후 로그인 폼 보여주기

// * 할일 완료 기능 - 체크박스
// 체크박스를 통해 할 일 완료를 표시하고, 체크박스를 클릭하면 할 일 완료여부가 변경되는 기능
// (= complete라는 속성을 true로 저장)
