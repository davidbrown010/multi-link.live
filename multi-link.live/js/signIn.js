document.querySelectorAll('form h2').forEach(elem => {
    elem.addEventListener('click', () => {
        hiddenToggle(['logInForm', 'signUpForm'])
    })
})

document.querySelectorAll('form').forEach(elem => {
    elem.addEventListener('submit', () => {
        showLoader_formValidate(elem)
    })
})