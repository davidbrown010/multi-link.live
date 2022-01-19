const show = (appliedClasses) => {
    appliedClasses.forEach(className => {
        document.querySelectorAll("."+className).forEach(elem => elem.classList.add('show'))
    })
}

const hide = (appliedClasses) => {
    appliedClasses.forEach(className => {
        document.querySelectorAll("."+className).forEach(elem => elem.classList.remove('show'))
    })
}

const hiddenToggle = (appliedClasses) => {
    appliedClasses.forEach(className => {
        document.querySelectorAll("."+className).forEach(elem => elem.classList.toggle('hidden'))
    })
}

const showLoader_formValidate = (form = null) => {
    const inputs = form.querySelectorAll('[required=required]');
    for (let elem of inputs) {
        if (elem.value == '') return
    }
    show(["loadingPageCoverer"])
}