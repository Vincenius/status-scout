const getFormData = e => {
  const formObject = {};
  const elements = e.target.elements;
  for (let element of elements) {
    if (element.name) {
      formObject[element.name] = element.value;
    }
  }

  return formObject
}

export default getFormData