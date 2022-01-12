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

