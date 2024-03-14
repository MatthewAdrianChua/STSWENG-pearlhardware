const title = document.querySelector('#title');
const verBtn = document.querySelector('.verify-button');

title.addEventListener('click', async (e) => {
    e.preventDefault();

    window.location.href = '/';
})

verBtn.addEventListener('click', async() => {
	window.location.href = '/emailVerify?sk=true';
})