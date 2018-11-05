import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!

const templates = { // 이 객체를 계속 복사해서 쓸 것임
  loginForm : document.querySelector('#login-form').content
}
const rootEl = document.querySelector('.root')

function drawLoginForm(){

  // 1. 템플릿 복사하기
  const fragment = document.importNode(templates.loginForm, true) // 한 벌 복사 완료

  // 2. 내용 채우고, 이벤트 리스너 등록하기
  const loginFormEl = fragment.querySelector('.login-form')

  loginFormEl.addEventListener('submit', async => { // 이벤트 리스너 안에서 통신을 할 예정이니 비동기 함수로 진행
    alert('로그인 요청 전송')
    e.preventDefault()
  })

  // 3. 문서 내부에 삽입하기
  rootEl.appendChild(fragment)
}

drawLoginForm()
