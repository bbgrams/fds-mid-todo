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
  rootEl.appendChild(fragment)
}

async function drawTodoList(){
  const res = await api.get('/todos')
  const list = res.data
  // 1. 템플릿 복사
  const fragment = document.importNode(templates.todoList, true)

  // 2. 내용 채우고 이벤트 리스너 등록하기
  // 배열에 있는 할일 항목들을 불러온 다음에 html의 li로
  const todoListEl = fragment.querySelector('.todo-list');
  const todoFormEl = fragment.querySelector('.todo-form');

  todoFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    const body = e.target.elements.body.value
    const res = await api.post('/todos', {
      body,
      complete : false
    })
    if(res.status === 201){ // 불러오는것에 성공했다면
      drawTodoList()
    }
  })

  list.forEach(todoItem => { // todoitem템플릿을 복사해서 todoitem템플릿에 넣어준다
    // 1. 템플릿 복사
    const fragment = document.importNode(templates.todoItem, true)

    // 2. 내용 채우고 이벤트 리스너 등록하기
    const bodyEl = fragment.querySelector('.body')

    bodyEl.textContent = todoItem.body
    // 3. 문서 내부에 삽입하기
    todoListEl.appendChild(fragment)
  })

  // 3. 문서 내부에 삽입하기
  rootEl.textContent = '';
  rootEl.appendChild(fragment)
}

drawLoginForm()

